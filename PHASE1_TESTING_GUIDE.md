# Phase 1 Testing Guide

## Overview
This guide walks through testing the complete Phase 1 workflow after applying stabilization fixes.

## Pre-Testing Checklist

- [ ] Backend database is seeded with hospitals
- [ ] Clerk authentication is configured
- [ ] Environment variables are set in `.env.local`
- [ ] Node modules are installed (`npm install`)
- [ ] Python dependencies are installed (`pip install -r requirements.txt`)

## Starting Services

### 1. Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 2. Start Frontend
```bash
cd apps/web
npm run dev
```

Expected output:
```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
```

## Test Workflow

### Phase 1.1: ABHA Linking

1. **Navigate to Profile**
   - URL: `http://localhost:3000/profile`
   - Login with Clerk if prompted

2. **Open Browser DevTools**
   - Press F12
   - Go to Console tab
   - Keep it open throughout testing

3. **Link ABHA Identity**
   - Scroll to "ABHA Identity" section
   - Should show "Link your ABHA" form
   - Default values should be pre-filled:
     - ABHA Number: `98-7654-3210-9876`
     - ABHA Address: `patient@abdm`
   
4. **Generate OTP**
   - Click "Generate OTP to Link"
   - ✓ **Verify**: Blue banner appears with 6-digit OTP
   - ✓ **Verify**: OTP is pre-filled in input field
   - ✓ **Verify**: No errors in console
   - ✓ **Verify**: Toast notification: "OTP Generated!"

5. **Verify OTP**
   - OTP should already be filled
   - Click "Verify & Link"
   - ✓ **Verify**: Success state shows "ABHA Linked Successfully"
   - ✓ **Verify**: Green banner with checkmark
   - ✓ **Verify**: ABHA Number and Address displayed
   - ✓ **Verify**: Toast notification: "✓ ABHA identity linked successfully!"
   - ✓ **Verify**: No errors in console

**Expected Console Output:**
```
[No errors - clean console]
```

---

### Phase 1.2: Consent Management

1. **Grant Consent**
   - Still on `/profile` page
   - Scroll to "Consent Management" section
   - Click "Grant New" button
   - ✓ **Verify**: Form expands with hospital dropdown

2. **Select Hospital**
   - Open dropdown
   - ✓ **Verify**: Hospitals list appears (Apollo, Care, Yashoda, etc.)
   - Select "Apollo Hospitals"
   - Click "Grant Access"

3. **Verify Consent**
   - ✓ **Verify**: Success toast: "✓ Consent granted successfully!"
   - ✓ **Verify**: Consent card appears with hospital name
   - ✓ **Verify**: Green badge shows "Active"
   - ✓ **Verify**: Granted date is shown
   - ✓ **Verify**: No errors in console

**Expected Console Output:**
```
[No errors - clean console]
```

---

### Phase 1.3: Import Records & Timeline

1. **Navigate to Timeline**
   - Click "Home" in navigation OR go to `/home`
   - ✓ **Verify**: Timeline page loads
   - ✓ **Verify**: "Medical Timeline" header appears
   - ✓ **Verify**: Summary cards show (Consultations, Prescriptions, Labs, Scans)

2. **Open Import Dialog**
   - Look for "Import Records" button (top right, near search)
   - Click "Import Records"
   - ✓ **Verify**: Popup appears with hospital selection

3. **Start Import**
   - Select "Apollo Hospitals" from dropdown
   - Click "Import Records" button
   - ✓ **Verify**: Loading state: "Fetching records via ABHA..."
   - ✓ **Verify**: Spinner animation

4. **Watch Import Complete**
   - Wait 2-3 seconds
   - ✓ **Verify**: Success state: "Import Complete!"
   - ✓ **Verify**: Shows count: "5 records imported from Apollo Hospitals"
   - ✓ **Verify**: Toast notification appears
   - ✓ **Verify**: Dialog auto-closes after 3 seconds
   - ✓ **Verify**: No errors in console

5. **Verify Timeline Update**
   - Timeline should automatically refresh
   - ✓ **Verify**: New month section appears (current month)
   - ✓ **Verify**: Multiple imported record cards visible
   - ✓ **Verify**: Purple AI Summary card appears
   - ✓ **Verify**: Each card has proper icons and styling

6. **Check Imported Records**
   Look for cards with:
   - ✓ **Indigo left border**
   - ✓ **"ABHA Import" badge**
   - ✓ **"(External)" suffix on titles**
   - ✓ **Hospital name as source**
   - ✓ **Record data displayed**

   Expected record types:
   - Prescription (External) - Metformin 500mg
   - LabReport (External) - HbA1c test
   - Consultation (External) - Type 2 Diabetes
   - LabReport (External) - Lipid Panel
   - ECG (External) - Normal Sinus Rhythm

7. **Check AI Summary Card**
   - ✓ **Purple left border**
   - ✓ **"AI Health Insights Generated" title**
   - ✓ **Summary text mentioning 5 records**
   - ✓ **"Key Insights" section with bullet points**
   - ✓ **4-5 insight items listed**

8. **Check Timeline Summary**
   - Look at top cards
   - ✓ **Verify**: Counts increased:
     - Consultations: at least 1
     - Prescriptions: at least 1
     - Lab Reports: at least 2
   - ✓ **Verify**: "Last updated X minutes ago"

**Expected Console Output:**
```
[No errors]

Possible debug logs (safe to ignore):
- Timeline fetch success logs
- Query invalidation logs
```

---

### Phase 1.4: Persistence Check

1. **Refresh Page**
   - Press F5 or Cmd+R
   - Wait for page to reload

2. **Verify Data Persists**
   - ✓ **Verify**: All imported records still visible
   - ✓ **Verify**: AI Summary still present
   - ✓ **Verify**: Timeline summary counts unchanged
   - ✓ **Verify**: No errors in console
   - ✓ **Verify**: No loading failures

3. **Check Profile Page**
   - Navigate back to `/profile`
   - ✓ **Verify**: ABHA still shows as linked
   - ✓ **Verify**: Consent still shows as active

---

## Expected Timeline Structure After Import

```
┌─────────────────────────────────────────────┐
│ Medical Timeline                            │
│ Last updated X minutes ago                  │
│                                             │
│ [Consultations: 1] [Prescriptions: 1]      │
│ [Lab Reports: 2]   [Scans: 0]              │
└─────────────────────────────────────────────┘

[Search] [Filter] [Import Records]

━━━━ July 2026 ━━━━

  ● AI Health Insights Generated
    [Purple card with summary and insights]

  ● ECG (External)
    [Indigo card with ECG data from Apollo]

  ● Lab Report (External)
    [Indigo card with Lipid Panel from Apollo]

  ● Consultation (External)
    [Indigo card with Diabetes consultation from Apollo]

  ● Lab Report (External)
    [Indigo card with HbA1c from Apollo]

  ● Prescription (External)
    [Indigo card with Metformin from Apollo]
```

---

## Troubleshooting

### No Hospitals in Dropdown

**Cause**: Database not seeded
**Solution**:
```bash
cd backend
python scripts/seed_db.py
```

### Import Button Not Appearing

**Cause**: Not on correct timeline page
**Solution**: Make sure you're on `/home` or timeline page, not `/profile`

### Console Errors After Import

**Check these:**
1. Network tab - Is `/api/v1/timeline` returning 200?
2. Response data - Is it an array of events?
3. Console logs - Any "groupTimeline" or "Timeline" warnings?

**Common Fixes:**
- Clear browser cache
- Restart frontend dev server
- Check backend logs for exceptions

### No Records Appear After Import

**Check:**
1. Network tab - Did `/api/v1/abha/import/me` succeed?
2. Response shows `imported_count > 0`?
3. Timeline query invalidation triggered?

**Debug:**
```javascript
// In browser console
localStorage.clear()
location.reload()
```

### TypeScript Errors

```bash
cd apps/web
npx tsc --noEmit --skipLibCheck
```

Should show: `Exit Code: 0`

---

## Success Criteria Checklist

Mark each as complete during testing:

### ABHA Linking
- [ ] OTP generation works
- [ ] OTP verification works
- [ ] ABHA linked successfully
- [ ] No console errors
- [ ] Timeline event created

### Consent Management
- [ ] Consent grant works
- [ ] Consent displays as active
- [ ] No console errors
- [ ] Timeline event created

### Record Import
- [ ] Import dialog works
- [ ] Hospital selection works
- [ ] Import succeeds
- [ ] No console errors during import
- [ ] No console errors after import
- [ ] Toast notification appears

### Timeline Display
- [ ] Timeline refreshes automatically
- [ ] Imported records visible
- [ ] AI Summary visible
- [ ] All cards render properly
- [ ] No rendering errors
- [ ] No React Error Boundaries

### Persistence
- [ ] Page refresh works
- [ ] Data persists after refresh
- [ ] ABHA remains linked
- [ ] Consent remains active
- [ ] Timeline events remain

### Overall
- [ ] No TypeScript errors
- [ ] No runtime exceptions
- [ ] No failed network requests
- [ ] No backend exceptions
- [ ] Clean browser console

---

## Reporting Issues

If any test fails, capture:

1. **Browser Console Output** (full)
2. **Network Tab** (failed request details)
3. **Backend Logs** (any exceptions)
4. **Steps to Reproduce**
5. **Screenshot of error**

Report in format:
```
## Issue: [Short description]

**Step**: [Which test step]
**Expected**: [What should happen]
**Actual**: [What happened]
**Console Output**: ```[paste]```
**Network**: [Request URL and status]
**Backend**: [Any Python exceptions]
```

---

## Next Steps After Successful Testing

Once all tests pass:

1. Mark Phase 1 as **STABLE** ✓
2. Document any minor UX improvements for future
3. Proceed with confidence to Phase 2 planning
4. Archive this test report with timestamp

---

## Performance Notes

Expected timings:
- ABHA Link: < 1 second
- Consent Grant: < 1 second
- Record Import: 2-3 seconds (includes mock delays)
- Timeline Refresh: < 500ms
- Page Load: < 2 seconds

If significantly slower, check:
- Network conditions
- Backend query performance
- React Query cache
- DevTools overhead

---

## Cleanup After Testing

```bash
# Reset test data (optional)
cd backend
python scripts/seed_db.py --reset

# Or manually:
# - Revoke consent from profile
# - Re-link ABHA to test again
```
