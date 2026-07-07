# Phase 1 Debugging Plan

## Current Status
Phase 1 features are implemented:
- ✓ ABHA Linking (OTP Flow)
- ✓ Consent Management  
- ✓ Hospital Import
- ✓ Timeline Events Creation
- ✓ AI Summary Generation

## Known Issue
After importing records, the import succeeds and Timeline updates, but the frontend throws an error.

## Root Cause Investigation

### Potential Issues Identified

1. **Type Mismatch in ImportedRecordCard**
   - Location: `apps/web/src/features/timeline/components/cards/ImportedRecordCard.tsx`
   - Issue: Accessing `event.structured_payload.original_payload` as `Record<string, string>`
   - Backend returns: `{ import_session_id, imported_record_id, original_payload: {...} }`
   - Need to verify: payload.mock_data exists or JSON.stringify doesn't break

2. **Timeline Type Inconsistency**
   - Frontend local type: `apps/web/src/features/timeline/types/timeline.ts`
   - Schemas package: `packages/schemas/src/timeline.ts` (discriminated union)
   - API Client: `packages/api-client/src/types.gen.ts` (Record<string, unknown>)
   - Mismatch between these three definitions

3. **Date Parsing in groupTimeline**
   - Location: `apps/web/src/features/timeline/utils/groupTimeline.ts`
   - Could fail if `occurred_at` is not a valid date string

4. **React Query Cache Invalidation**
   - After import, `queryClient.invalidateQueries({ queryKey: ['timeline'] })` is called
   - Timeline might refetch while component is rendering

5. **Missing Card Renderers**
   - `TimelineList.tsx` doesn't handle imported records or AI summaries
   - Only `TimelineContainer.tsx` does

## Debugging Steps

### Step 1: Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### Step 2: Start Frontend
```bash
cd apps/web
npm run dev
```

### Step 3: Manual Testing Workflow
1. Navigate to `/profile`
2. Open browser DevTools Console
3. Link ABHA
   - Click "Generate OTP"
   - Verify OTP
   - Check Console for errors
4. Grant Consent
   - Select hospital
   - Grant consent
   - Check Console for errors
5. Navigate to `/home` (Timeline)
6. Import Records
   - Click "Import Records"
   - Select hospital
   - Click Import
   - **Watch Console carefully during and after import**
   - Note exact error message
   - Check Network tab for API responses

### Step 4: Check Backend Logs
- Look for Python exceptions during import
- Verify Timeline events are created correctly

### Step 5: Check API Response Structure
In Network tab, inspect:
- `/api/v1/abha/import/me` response
- `/api/v1/timeline` response after import
- Verify `structured_payload` structure matches expectations

## Common Errors to Look For

1. **TypeError: Cannot read property 'X' of undefined**
   - Missing null check in component
   - Payload structure mismatch

2. **Invalid Date**
   - `occurred_at` format issue
   - Timezone handling problem

3. **React Error Boundary**
   - Component render failure
   - Missing key prop

4. **Query Error**
   - API response validation failure
   - Type mismatch between API and frontend

5. **JSON Parsing Error**
   - Circular reference in payload
   - Invalid JSON structure

## Next Steps After Error Identification

Once error is identified:
1. Add null checks where needed
2. Fix type definitions to match API
3. Add error boundaries for graceful degradation
4. Fix payload structure inconsistencies
5. Re-test full workflow

## Success Criteria

✓ Profile → Link ABHA → No errors
✓ Profile → Grant Consent → No errors  
✓ Timeline → Import Records → No errors
✓ Timeline displays imported records
✓ Timeline displays AI summary
✓ Refresh page → Everything persists
✓ Browser Console → No errors
