# NEXT SESSION

## Sprint 5: ABHA & Admin Portal Architecture

The next session will formally begin Sprint 5. No remaining stabilization work is required from Sprint 4.

### 1. ABHA (Ayushman Bharat Health Account) Integration

**Goals**: Allow patients to link their Indian national health ID, fetch external records, and merge them seamlessly into our unified Timeline.

**Features to Implement**:
- **Mock ABHA Verification**: A mock service to simulate ABHA number lookup.
- **Mock OTP**: OTP generation and validation flow for ABHA authentication.
- **Link ABHA Number**: DB schema updates to store linked ABHA IDs against `PatientProfiles`.
- **Sync ABHA Records**: Fetch mock FHIR bundles or standard JSON payloads representing external medical history.
- **Merge Imported Records**: Add external records to the `timeline_events` table.
- **Timeline Source Badges**: UI updates to differentiate "Internal" vs "ABHA Imported" records visually.
- **Consent Manager & Consent History**: A system to track what records the patient has consented to share, and with whom.
- **Doctor Import from ABHA**: Allow doctors to pull in patient history if the patient has granted consent.
- **AI Summary of Imported Records**: Automatically prompt the Doctor Copilot to summarize the newly imported ABHA data.
- **AI Timeline Comparison**: Allow AI to compare internal vs external timeline data for discrepancies.
- **AI Longitudinal Health Insights**: AI generated reports on long term health trends.
- **Unified Health Locker**: Existing timeline architecture serving as the central locker.
- **Record Sharing (QR / Share Link)**: Feature to generate a secure shareable link or QR code for a patient's timeline.
- **Health Trends & Risk Detection**: Basic analytics or AI-driven insights on timeline data.

### 2. Admin Portal

**Goals**: Provide a top-level administrative dashboard for platform management.

**Features to Implement**:
- **Dashboard**: High-level metrics (Total Patients, Total Doctors, Appointments today).
- **Manage Patients**: CRUD interface for Patients.
- **Manage Doctors**: CRUD interface for Doctors.
- **Manage Hospitals**: CRUD interface for Hospitals.
- **View Appointments**: Global appointment viewer.
- **View ABHA Links**: Audit log of ABHA connections.
- **View Consent Requests**: Audit log of consents.
- **Seed Demo Data**: UI button to trigger the backend `seed_db.py` script.
- **Impersonate Patient / Doctor**: "Login As" feature for support and debugging.

### Preparations
Before implementing Sprint 5, verify the schema extensibility of `PatientProfiles` (to hold `abha_id`) and `TimelineEvents` (to hold `source` metadata).
