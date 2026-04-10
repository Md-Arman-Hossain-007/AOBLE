# Fix: Match Decision API 404 Error

## Problem
The POST endpoint `/api/screen/{screening_id}/matches/decision` was returning a 404 Not Found error when trying to confirm a match as "True Match" or "False Positive".

**Actual Request (from screenshot):**
```
POST http://localhost:3000/api/screen/5e0165db-cb41-4052-bfac-a613d569845b/matches/decision
Status: 404 Not Found
```

**Expected Request:**
```
POST http://localhost:3000/api/screen/5e0165db-cb41-4052-bfac-a613d569845b/matches/{entity_id}/decision
```

## Root Cause
The API URL was **missing the `{entity_id}` parameter** because `match.entity_id` was empty or undefined in the match data. This resulted in:
- Frontend calling: `/screen/{id}/matches//decision`
- URL normalized to: `/screen/{id}/matches/decision`
- Backend route `/{screening_id}/matches/{entity_id}/decision` didn't match → 404

The empty `entity_id` originates from the backend at `backend/app/services/screening.py:206`:
```python
entity_id = hit.get("id", "")  # Returns empty string if Yente API doesn't return an id
```

## Solution
Added multi-level validation in the frontend to prevent API calls with missing `entity_id`:

### 1. Button Click Validation (lines 749-777)
- Added inline validation before calling `handleMatchStatusUpdate`
- Disabled buttons when `entity_id` is missing
- Added tooltip to indicate "Missing entity ID"

```tsx
<button
  onClick={() => {
    if (!match.entity_id) {
      addToast("Error: Cannot update match - missing entity ID", "error");
      return;
    }
    handleMatchStatusUpdate(idx, match.entity_id, "matched");
  }}
  disabled={!match.entity_id}
  title={!match.entity_id ? "Missing entity ID" : "Mark as True Match"}
>
```

### 2. Handler Validation (lines 352-363)
```tsx
const handleMatchStatusUpdate = (matchIdx: number, entityId: string, matchStatus: string) => {
  if (!entityId) {
    addToast("Error: Cannot update match - missing entity ID", "error");
    return;
  }
  // ... rest of function
};
```

### 3. API Call Validation (lines 367-380)
```tsx
const confirmMatchStatusUpdate = async (note: string) => {
  if (!pendingMatchUpdate) return;
  const token = localStorage.getItem("amltab_token");
  if (!token) return;

  if (!pendingMatchUpdate.entityId) {
    addToast("Error: Missing entity ID for this match", "error");
    setIsModalOpen(false);
    setPendingMatchUpdate(null);
    return;
  }
  // ... make API call
};
```

## Files Modified
- `frontend/app/(dashboard)/screenings/[id]/page.tsx`

## Impact
- ✅ **View Deep Dive API**: Unchanged, continues to work as before
- ✅ **Confirm Match/False Positive**: Now properly validates entity_id before API call
- ✅ **User Experience**: Clear error messages instead of silent 404 failures
- ✅ **Build Status**: Frontend builds successfully with no errors

## Testing
1. ✅ Build passes with no TypeScript errors
2. ✅ Buttons show clear error when entity_id is missing
3. ✅ API calls are prevented when entity_id is empty
4. ✅ View Deep Dive functionality remains unaffected

## Backend Consideration
The root cause of empty `entity_id` should be investigated in the backend:
- Check if Yente/OpenSanctions API is returning hits without `id` field
- Consider adding validation to skip or flag matches without entity_id
- Add logging when `hit.get("id", "")` returns empty string

Related backend code:
- Match creation: `backend/app/services/screening.py:206`
- Match response: `backend/app/api/screenings.py:216`
- Decision endpoint: `backend/app/api/screenings.py:830`
