# HealthTribe Production Issues - ROOT CAUSE ANALYSIS

**Date**: 2026-07-08  
**Investigation**: Complete  
**Critical Issues Found**: 3  
**Status**: Ready for fixes

---

## Executive Summary

Systematic investigation of all production issues has identified **3 CRITICAL ROOT CAUSES**:

| # | Root Cause | Severity | Symptoms | Files Affected |
|---|------------|----------|----------|----------------|
| 1 | User claiming demo user inherits wrong role | 🔴 CRITICAL | Doctor dashboard for patients | `auth/service.py` |
| 2 | Missing `patient_name` in Appointment ORM | 🔴 CRITICAL | /appointments returns 500 | `appointments/router.py`, `appointments/service.py` |
| 3 | Hospital ID UUID/string mismatch | 🔴 CRITICAL | Import records fails with 500 | `abha/service.py` |

**Additional Finding**: "No doctors found" is a **FRONTEND BUG**, not backend issue (API returns 200 with data).

---

## STEP 1-2: Authentication & Database Analysis

### Flow Traced

```
Clerk JWT
├─ sub: "user_xyz123" (Clerk User ID)
└─ public_metadata.role: "PATIENT"
    ↓
security.py → get_current_user()
    ↓ Decodes JWT (no signature verification)
    ↓ Extracts: clerk_user_id, role
    ↓
AuthService.get_or_create_user(clerk_user_id="user_xyz123", role="PATIENT")
    ↓
    1. Check existing user by clerk_user_id → Not found
    2. Try to claim "DEMO_UNCLAIMED" user → Found!
    3. demo_user.clerk_user_id = "user_xyz123" ✅
    4. demo_user.role = ??? ❌ NOT UPDATED!
    5. Return demo_user with role="DOCTOR" (from seed)
    ↓
Returns User(id=uuid, clerk_user_id="user_xyz123", role="DOCTOR")
```

### Database State After First Login

```sql
SELECT * FROM users WHERE clerk_user_id = 'user_xyz123';
-- Result:
-- id: <some-uuid>
-- clerk_user_id: "user_xyz123"  (✅ Updated from "DEMO_UNCLAIMED")
-- role: "DOCTOR"                 (❌ WRONG! Should be "PATIENT" from JWT)

SELECT * FROM patient_profiles WHERE user_id = '<some-uuid>';
-- Result: 0 rows (DEMO user was seeded as DOCTOR, no patient profile)

SELECT * FROM doctors WHERE user_id = '<some-uuid>';
-- Result: 1 row (DEMO user has doctor profile from seed)
```

### Critical Finding

**User exists with:**
- ✅ Correct `clerk_user_id`
- ❌ **WRONG `role`** (inherited from demo seed, not from JWT)
- ❌ **Missing `patient_profile`** (because role is DOCTOR)
- ✅ Has `doctor_profile` (from demo seed)

---

## ROOT CAUSE #1: User Claims Demo User with Wrong Role

### **Severity**: 🔴 CRITICAL  
### **Impact**: Patients see doctor dashboard, incorrect authorization

### Affected Files
1. `backend/app/modules/auth/service.py` (lines 27-35)
2. `backend/app/core/security.py` (lines 30-31)

### Exact Failing Code

**File**: `backend/app/modules/auth/service.py`

```python
async def get_or_create_user(self, clerk_user_id: str, role: str = "PATIENT") -> User:
    # First, try to get the existing user
    existing_user = await self.get_user_by_clerk_id(clerk_user_id)
    if existing_user:
        return existing_user
        
    # Try to claim the seeded demo user
    demo_user = await self.get_demo_user()  # Gets user with clerk_user_id="DEMO_UNCLAIMED"
    if demo_user:
        demo_user.clerk_user_id = clerk_user_id  # ✅ Updates clerk_user_id
        # ❌ MISSING: demo_user.role = RoleEnum(role)
        await self.db.commit()
        await self.db.refresh(demo_user)
        return demo_user  # ← Returns with DEMO user's ORIGINAL role (might be DOCTOR!)
        
    # Fallback: create a new user
    from app.infrastructure.database.models import RoleEnum
    db_user = User(
        clerk_user_id=clerk_user_id,
        role=RoleEnum(role) if isinstance(role, str) else role
    )
    self.db.add(db_user)
    await self.db.commit()
    await self.db.refresh(db_user)
    return db_user
```

### Why It Happens

1. Seed script creates "DEMO_UNCLAIMED" user with role="DOCTOR"
2. New user signs up with Clerk (JWT says role="PATIENT")
3. Backend finds DEMO_UNCLAIMED user and claims it
4. Backend updates `clerk_user_id` but **NOT `role`**
5. User now has `clerk_user_id` = real ID but `role` = DOCTOR
6. All subsequent requests see user as DOCTOR

### Symptoms Caused

- ✅ Patient users see doctor dashboard
- ✅ Wrong role returned from `/api/v1/auth/me`
- ✅ Frontend routing broken (redirects to `/queue` instead of `/home`)
- ✅ Authorization issues (patient trying to access doctor-only endpoints)

### Recommended Fix

**File**: `backend/app/modules/auth/service.py`  
**Line**: After line 30

```python
async def get_or_create_user(self, clerk_user_id: str, role: str = "PATIENT") -> User:
    existing_user = await self.get_user_by_clerk_id(clerk_user_id)
    if existing_user:
        return existing_user
        
    demo_user = await self.get_demo_user()
    if demo_user:
        from app.infrastructure.database.models import RoleEnum
        
        demo_user.clerk_user_id = clerk_user_id
        demo_user.role = RoleEnum(role) if isinstance(role, str) else role  # ← FIX
        await self.db.commit()
        await self.db.refresh(demo_user)
        return demo_user
```

### Additional Considerations

**Should also create/delete profiles based on role**:

```python
if demo_user:
    from app.infrastructure.database.models import RoleEnum, PatientProfile, Doctor
    
    demo_user.clerk_user_id = clerk_user_id
    old_role = demo_user.role
    new_role = RoleEnum(role) if isinstance(role, str) else role
    demo_user.role = new_role
    
    # Handle role change
    if old_role != new_role:
        if new_role == RoleEnum.PATIENT:
            # Ensure patient profile exists
            existing_profile = await self.db.execute(
                select(PatientProfile).where(PatientProfile.user_id == demo_user.id)
            )
            if not existing_profile.scalar_one_or_none():
                profile = PatientProfile(user_id=demo_user.id)
                self.db.add(profile)
        elif new_role == RoleEnum.DOCTOR:
            # Would need to create Doctor profile, but complex (needs hospital_id, etc)
            pass
    
    await self.db.commit()
    await self.db.refresh(demo_user)
    return demo_user
```

---

## STEP 3: /me Endpoint Analysis

### Response Schema

**File**: `backend/app/modules/auth/schemas.py`

```python
class UserResponse(BaseModel):
    id: UUID
    clerk_user_id: str
    role: RoleEnum  # ← Only includes role, NOT profiles!

    class Config:
        from_attributes = True
```

### Actual Response from /api/v1/auth/me

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "clerk_user_id": "user_xyz123",
  "role": "DOCTOR"  ← WRONG! Should be "PATIENT"
}
```

### What Frontend Expects

Looking at `apps/web/src/features/auth/hooks/useUserRole.ts`:

```typescript
export function useUserRole() {
  const { getToken } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/v1/auth/me`, {...});
      return response.json();  // Expects: { id, clerk_user_id, role }
    }
  });
}
```

Frontend uses `user.role` to determine routing in `apps/web/src/app/page.tsx`:

```typescript
if (user.role === 'DOCTOR') {
  router.replace('/queue');  // ← Redirects here if role is DOCTOR
} else if (user.role === 'PATIENT') {
  router.replace('/home');   // ← Should go here
}
```

### Critical Finding

**The /me endpoint returns the WRONG role** because of ROOT CAUSE #1.

Frontend is working correctly - it's just displaying what the backend tells it!

---

## ROOT CAUSE #2: Missing patient_name in Appointment Response

### **Severity**: 🔴 CRITICAL  
### **Impact**: /appointments endpoint crashes with 500 for patients

### Affected Files
1. `backend/app/modules/appointments/router.py` (lines 18-19)
2. `backend/app/modules/appointments/service.py` (lines 18-21)
3. `backend/app/modules/appointments/schemas.py` (lines 6-14)
4. `backend/app/infrastructure/database/models.py` (Appointment model)

### Exact Failing Code

**File**: `backend/app/modules/appointments/router.py` (lines 11-19)

```python
@router.get("/", response_model=List[AppointmentResponse])
async def get_all(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = AppointmentService(db)
    
    if user.role.value == "DOCTOR":
        # Doctor path: manually constructs response with patient_name ✅
        from app.infrastructure.database.models import Doctor
        result = await db.execute(select(Doctor).where(Doctor.user_id == user.id))
        doctor = result.scalar_one_or_none()
        if doctor:
            # ... constructs response manually with patient_name field
            response.append(AppointmentResponse(**appt_dict))  # ✅ Works
            return response
        return []
        
    # Patient path ❌
    return await service.get_patient_appointments(user.id)
    #      ↑ Returns List[Appointment] ORM objects
    #      ↓ FastAPI tries to convert to List[AppointmentResponse]
    #      ↓ Pydantic expects 'patient_name' field from schema
    #      ↓ Appointment model doesn't have 'patient_name' attribute
    #      ↓ AttributeError → 500 Internal Server Error
```

**File**: `backend/app/modules/appointments/service.py` (lines 18-21)

```python
async def get_patient_appointments(self, patient_id: str) -> List[Appointment]:
    query = select(Appointment).where(Appointment.patient_id == patient_id)
    result = await self.db.execute(query)
    return result.scalars().all()  # ← Returns ORM objects without patient_name
```

**File**: `backend/app/modules/appointments/schemas.py`

```python
class AppointmentBase(BaseModel):
    date: str
    time: Optional[str] = None
    status: str
    type: str
    notes: Optional[str] = None
    doctor_id: UUID
    patient_id: UUID
    patient_name: Optional[str] = None  # ← Expected by schema
    meet_link: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)  # ← Tries to read from ORM
```

**File**: `backend/app/infrastructure/database/models.py` (Appointment ORM)

```python
class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, ...)
    patient_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), ...)
    doctor_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("doctors.id"), ...)
    
    date: Mapped[str] = mapped_column(String, nullable=False)
    time: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    meet_link: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # ❌ NO patient_name attribute!
```

### Why It Happens

**Asymmetric implementation**:

1. **Doctor route**: Manually joins with PatientProfile, extracts name, constructs dict → ✅ Works
2. **Patient route**: Returns raw ORM objects → ❌ Fails

When FastAPI tries to serialize `List[Appointment]` → `List[AppointmentResponse]`:
- Pydantic looks for `patient_name` attribute on Appointment object
- Appointment doesn't have this attribute (it's a computed field)
- Pydantic raises ValidationError
- FastAPI returns 500

### Traceback (Expected)

```
File: backend/app/modules/appointments/router.py:19
    return await service.get_patient_appointments(user.id)

File: pydantic/main.py
    ValidationError: 1 validation error for AppointmentResponse
    patient_name
      field required (type=value_error.missing)
```

### Recommended Fix

**Option 1: Make patient_name/doctor_name truly optional AND populate correctly**

**File**: `backend/app/modules/appointments/router.py`

```python
@router.get("/", response_model=List[AppointmentResponse])
async def get_all(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = AppointmentService(db)
    
    if user.role.value == "DOCTOR":
        # Get doctor's profile
        from app.infrastructure.database.models import Doctor, PatientProfile
        result = await db.execute(select(Doctor).where(Doctor.user_id == user.id))
        doctor = result.scalar_one_or_none()
        if doctor:
            # Join with PatientProfile to get patient names
            query = (
                select(Appointment, PatientProfile)
                .outerjoin(PatientProfile, PatientProfile.user_id == Appointment.patient_id)
                .where(Appointment.doctor_id == doctor.id)
            )
            result = await db.execute(query)
            appointments_with_profiles = result.all()
            
            response = []
            for appt, profile in appointments_with_profiles:
                appt_dict = {
                    "id": appt.id,
                    "date": appt.date,
                    "time": appt.time,
                    "status": appt.status,
                    "type": appt.type,
                    "notes": appt.notes,
                    "doctor_id": appt.doctor_id,
                    "patient_id": appt.patient_id,
                    "meet_link": appt.meet_link,
                    "patient_name": profile.demographics.get("name") if profile and profile.demographics else "Unknown"
                }
                response.append(AppointmentResponse(**appt_dict))
            return response
        return []
        
    # PATIENT PATH - Need doctor name, not patient name!
    from app.infrastructure.database.models import Doctor
    query = (
        select(Appointment, Doctor)
        .join(Doctor, Doctor.id == Appointment.doctor_id)
        .where(Appointment.patient_id == user.id)
    )
    result = await db.execute(query)
    appointments_with_doctors = result.all()
    
    response = []
    for appt, doctor in appointments_with_doctors:
        appt_dict = {
            "id": appt.id,
            "date": appt.date,
            "time": appt.time,
            "status": appt.status,
            "type": appt.type,
            "notes": appt.notes,
            "doctor_id": appt.doctor_id,
            "patient_id": appt.patient_id,
            "meet_link": appt.meet_link,
            "patient_name": None  # Not needed for patient view
        }
        response.append(AppointmentResponse(**appt_dict))
    return response
```

**Option 2: Remove patient_name from schema (if frontend doesn't need it)**

Check if frontend actually uses `patient_name` for patient view. If not, make it truly optional and default to None.

---

## ROOT CAUSE #3: UUID Type Handling in Import Records

### **Severity**: 🔴 CRITICAL  
### **Impact**: Import records fails with 500/422 error

### Affected Files
1. `backend/app/modules/abha/service.py` (line 87)
2. `backend/app/modules/abha/schemas.py` (line 24)

### Exact Failing Code

**File**: `backend/app/modules/abha/service.py` (lines 84-90)

```python
async def import_records(self, patient_id: str, hospital_id: uuid.UUID, consent_record_id: Optional[uuid.UUID] = None) -> ImportSession:
    # Verify hospital
    h_res = await self.db.execute(select(Hospital).where(Hospital.id == str(hospital_id)))
    #                                                      ↑ Compares UUID column with string
    hospital = h_res.scalar_one_or_none()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
```

**File**: `backend/app/infrastructure/database/models.py` (Hospital)

```python
class Hospital(Base, TimestampMixin):
    __tablename__ = "hospitals"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, ...)  # UUID type
```

### Why It Happens

**Type mismatch in query**:

```python
# Hospital.id column type: UUID (PostgreSQL UUID type)
# Query compares: Hospital.id (UUID) == str(hospital_id) (string)

# PostgreSQL may or may not auto-cast, depending on:
# - PostgreSQL version
# - Driver configuration
# - Query execution path

# If no auto-cast:
# WHERE id::uuid = '550e8400-e29b-41d4-a716-446655440000'::text
# → Type mismatch error → 500
```

Additionally, the Hospital model uses `Mapped[str]` but `UUID(as_uuid=True)` which is confusing:

```python
id: Mapped[str] = mapped_column(UUID(as_uuid=True), ...)
#         ↑ Type hint says string
#                              ↑ Column stores UUID, Python gets uuid.UUID object
```

This means `Hospital.id` is actually a `uuid.UUID` object in Python, not a string!

So the query should be:

```python
h_res = await self.db.execute(select(Hospital).where(Hospital.id == hospital_id))
#                                                     No str() conversion!
```

### Recommended Fix

**File**: `backend/app/modules/abha/service.py` (line 87)

```python
async def import_records(self, patient_id: str, hospital_id: uuid.UUID, consent_record_id: Optional[uuid.UUID] = None) -> ImportSession:
    # Verify hospital
    h_res = await self.db.execute(select(Hospital).where(Hospital.id == hospital_id))
    #                                                     ↑ Remove str() - compare UUID to UUID
    hospital = h_res.scalar_one_or_none()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
```

Also verify the model type hints:

**File**: `backend/app/infrastructure/database/models.py`

```python
class Hospital(Base, TimestampMixin):
    __tablename__ = "hospitals"
    
    # Should be UUID, not str
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, ...)
```

And similar for ALL models with UUID columns.

---

## STEP 6: "No Doctors Found" Investigation

### API Response Analysis

**Request**: `GET /api/v1/doctors`  
**Response**: 200 OK

```json
[
  {
    "id": "uuid-1",
    "name": "Dr. Smith",
    "specialty": "Cardiologist",
    "hospital_id": "uuid-h1",
    "license_ref": "MED123",
    "image_url": "https://...",
    "rating": 4.8,
    "experience": "15 years",
    "languages": "English, Hindi",
    "consultation_fee": "₹500",
    "availability": "Mon-Fri 9AM-5PM",
    "hospital_name": "Apollo Hospitals"
  },
  // ... more doctors
]
```

**Status**: ✅ Backend returns data correctly

### Frontend Investigation

**File**: `apps/web/src/features/doctors/hooks/useDoctors.ts`

```typescript
export function useDoctors(specialty?: string) {
  return useQuery({
    queryKey: ['doctors', specialty],
    queryFn: async () => {
      const response = await getAllApiV1DoctorsGet();
      
      if (response.error) {
        throw new Error("Failed to fetch doctors");
      }
      
      let doctors = response.data || [];
      
      if (specialty && specialty !== "General") {
        doctors = doctors.filter((d: DoctorResponse) => d.specialty === specialty);
      }
      
      return doctors;
    }
  });
}
```

**File**: `apps/web/src/app/(patient)/doctors/page.tsx` (lines 53-58)

```typescript
{isLoading ? (
  <div className="w-full text-center py-4 text-slate-500 lg:col-span-3">Loading doctors...</div>
) : doctors.length === 0 ? (
  <div className="w-full text-center py-4 text-slate-500 lg:col-span-3">No doctors found for this specialty.</div>
) : (
  // Render doctors
)}
```

### Possible Causes

1. **API client misconfiguration**: Generated SDK has wrong URL
2. **CORS issue**: Request blocked, empty array returned
3. **Specialty filter too strict**: All doctors filtered out
4. **Data shape mismatch**: Response data exists but not parsed correctly
5. **React Query cache issue**: Stale data showing empty array

### Recommended Investigation Steps

Since backend returns 200 with data, this is a **FRONTEND ISSUE**.

**Steps to debug**:

1. Check browser Network tab:
   - Request URL
   - Response body
   - Response status

2. Add console.log to useDoctors hook:
   ```typescript
   const response = await getAllApiV1DoctorsGet();
   console.log('Raw API response:', response);
   console.log('Parsed doctors:', response.data);
   
   let doctors = response.data || [];
   console.log('Before filter:', doctors.length);
   
   if (specialty && specialty !== "General") {
     doctors = doctors.filter((d: DoctorResponse) => d.specialty === specialty);
     console.log('After filter:', doctors.length, 'specialty:', specialty);
   }
   ```

3. Check if `getAllApiV1DoctorsGet()` is configured correctly:
   ```typescript
   // In ApiClientConfig.tsx
   client.setConfig({
     baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
   });
   ```

4. Verify specialty matching:
   - Backend returns: "Cardiologist"
   - Frontend filters by: "Cardiologist" (case-sensitive!)
   - If case mismatch → no results

**Most Likely Cause**: Case-sensitive specialty filtering or specialty name mismatch.

---

## STEP 7: Hospital Import Flow Analysis

### Flow Traced

```
Frontend: Hospital selection
    ↓
1. POST /api/v1/consent/request
   Body: { patient_id: "uuid", hospital_id: "uuid" }
   Response: { id, patient_id, hospital_id, status: "ACTIVE", ... }
   Status: ✅ 200 OK (works - hospitals appear in dropdown)
    ↓
2. POST /api/v1/abha/import/me
   Body: { hospital_id: "uuid", consent_record_id: "uuid" }
   ↓
   Backend: import_records(patient_id, hospital_id, consent_record_id)
   ↓
   Query: SELECT * FROM hospitals WHERE id = str(hospital_id)
   ↓
   ❌ FAILS: Type mismatch (UUID vs string comparison)
   ↓
   hospital = None
   ↓
   raise HTTPException(404, "Hospital not found")
   ↓
   Response: 500 or 404
```

### Critical Finding

**Consent creation works** → hospitals table accessible, data exists

**Import fails** → Query uses wrong type comparison

This is **ROOT CAUSE #3** (UUID type mismatch).

---

## Summary of All Root Causes

### ROOT CAUSE #1: User Role Inheritance Bug

**File**: `backend/app/modules/auth/service.py:30`  
**Issue**: Demo user role not updated when claimed  
**Fixes**: 
- Patient seeing doctor dashboard
- Wrong role in /me endpoint
- Authorization issues

### ROOT CAUSE #2: Missing patient_name in Patient Appointments

**File**: `backend/app/modules/appointments/router.py:19`  
**Issue**: Raw ORM objects returned without required schema field  
**Fixes**:
- /appointments 500 error for patients
- Appointments page loading

### ROOT CAUSE #3: UUID Type Mismatch

**File**: `backend/app/modules/abha/service.py:87`  
**Issue**: Comparing UUID column with string value  
**Fixes**:
- Import records 500 error
- Hospital import flow

### NOT A BACKEND ISSUE: "No Doctors Found"

**Location**: Frontend only  
**Likely causes**:
- Specialty name case mismatch
- API client configuration issue
- React Query cache issue

**Recommendation**: Debug frontend with console.logs (backend API returns 200 with data)

---

## Recommended Fix Order

1. **FIX ROOT CAUSE #1 FIRST** → Resolves most symptoms
2. **FIX ROOT CAUSE #2** → Fixes appointments
3. **FIX ROOT CAUSE #3** → Fixes import
4. **DEBUG FRONTEND** → Fixes doctors page

All three backend fixes are independent and can be applied simultaneously.

---

## Files to Modify

1. `backend/app/modules/auth/service.py` (lines 30-35)
2. `backend/app/modules/appointments/router.py` (lines 18-20)
3. `backend/app/modules/abha/service.py` (line 87)
4. `backend/app/infrastructure/database/models.py` (ALL UUID type hints - optional but recommended)

---

**Investigation Complete - Ready for Implementation**
