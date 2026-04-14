# Match Decision API - Match Number Support

## Overview
Updated the Match Decision API to use **Match Number** (e.g., `M-1`, `M-2`, `M-3`) as the primary identifier instead of `entity_id`, providing better accuracy and user experience.

## Changes Summary

### 1. Backend Changes

#### File: `backend/app/api/screenings.py`

**Schema Update (Line 889-892):**
```python
class MatchDecisionRequest(BaseModel):
    status: str
    note: Optional[str] = None
    match_number: Optional[str] = None  # Match number like "M-1", "M-2" (preferred)
    entity_id: Optional[str] = None  # For backward compatibility
```

**Endpoint Logic Enhancement (Lines 929-996):**
- **Priority 1**: Uses `match_number` from request body (if provided)
- **Priority 2**: Falls back to `match_id` from URL parameter
- **Priority 3**: Tries `entity_id` from request body (backward compatibility)
- **Priority 4**: Tries `entity_id` from URL parameter (legacy support)

The endpoint now intelligently tries multiple matching strategies:
1. Match by `match_id` (M-1, M-2) using primary identifier
2. Match by `entity_id` (OpenSanctions ID) as fallback
3. Additional fallback layers for backward compatibility

### 2. Frontend Changes

#### File: `frontend/app/(dashboard)/screenings/[id]/page.tsx`

**Type Definition Update (Line 41):**
```typescript
interface Match {
  id?: string;
  match_id?: string;  // System-generated match number (e.g., "M-1", "M-2")
  entity_id?: string;
  // ... other fields
}
```

**State Type Update (Lines 143-149):**
```typescript
const [pendingMatchUpdate, setPendingMatchUpdate] = useState<{
  entityId: string; // Stores match_number (e.g., "M-1") for API call
  status: string;
  name: string;
  matchIndex?: number;
} | null>(null);
```

**Handler Function Update (Lines 368-379):**
```typescript
const handleMatchStatusUpdate = (matchIdx: number, matchId: string, matchStatus: string, matchName?: string) => {
  const match = data?.matches[matchIdx];
  const finalMatchId = match?.match_id || matchId || `M-${matchIdx + 1}`;

  setPendingMatchUpdate({
    entityId: finalMatchId, // Stores match_id like "M-1"
    status: matchStatus,
    name: match?.name || matchName || "this candidate",
    matchIndex: matchIdx
  });
  setIsModalOpen(true);
};
```

**Button Updates (Lines 802-814):**
- Removed `disabled={!match.entity_id}` validation
- Removed conditional tooltips
- Now directly uses `match.match_id` with fallback to generated `M-${idx + 1}`
- Buttons are always enabled (no dependency on entity_id)

```tsx
<button
  onClick={() => handleMatchStatusUpdate(idx, match.match_id || `M-${idx + 1}`, "matched", match.name)}
  className={`${styles.matchActionBtn} ${styles.confirmMatchBtn} ...`}
  title="Mark as True Match"
>
  <CheckCircle2 size={14} /> True Match
</button>
```

## API Usage Examples

### Method 1: Using match_number in URL (Recommended)
```bash
POST /api/screen/{screening_id}/matches/M-1/decision
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "matched",
  "note": "Confirmed true match"
}
```

### Method 2: Using match_number in Request Body
```bash
POST /api/screen/{screening_id}/matches/any_value/decision
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "false_positive",
  "note": "Not the same entity",
  "match_number": "M-2"
}
```

### Method 3: Backward Compatibility with entity_id
```bash
POST /api/screen/{screening_id}/matches/{entity_id}/decision
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "matched",
  "note": "Legacy API call"
}
```

## Benefits

1. **Better Accuracy**: Match numbers (M-1, M-2) are stable and unique within a screening session
2. **No Empty ID Issues**: Unlike `entity_id` which could be empty from the Yente API, match_numbers are always generated
3. **User-Friendly**: Easier to reference in audit logs and communications ("Mark M-1 as True Match")
4. **Backward Compatible**: Existing code using `entity_id` continues to work
5. **Flexible**: Multiple ways to identify matches, with clear priority order

## Testing

A test script is provided at `test_match_decision_api.py` to verify the changes:

```bash
python test_match_decision_api.py
```

The script tests:
1. ✅ Update using match_number in URL
2. ✅ Update using match_number in request body
3. ✅ Backward compatibility with entity_id
4. ✅ Mixed scenarios

## Migration Guide

### For Frontend Developers
- Use `match.match_id` instead of `match.entity_id` when calling the decision API
- The button handlers now use `match_id` as the primary identifier
- No breaking changes - old code still works but new code should prefer `match_id`

### For Backend Developers
- The endpoint now accepts `match_number` and `entity_id` in the request body
- URL parameter is still supported for backward compatibility
- Request body `match_number` takes priority over URL parameter
- All existing API calls continue to work without changes

## Database Impact

No database schema changes required. The `all_matches` JSONB column already contains the `match_id` field for each match object.

## Audit Trail

All match decisions are logged with the `match_id` (M-1, M-2) in the audit log, making it easier to trace decisions in the system.

## Files Modified

1. `backend/app/api/screenings.py` - Updated schema and endpoint logic
2. `frontend/app/(dashboard)/screenings/[id]/page.tsx` - Updated types, handlers, and UI
3. `test_match_decision_api.py` - New test script (created)
4. `MATCH_DECISION_API_MATCH_NUMBER_SUPPORT.md` - This documentation (created)

## Version History

- **v2.0** (Current) - Match Number as primary identifier with backward compatibility
- **v1.0** - Entity ID based matching (legacy)
