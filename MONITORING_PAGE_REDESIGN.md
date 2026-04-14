# Monitoring Center - Page Redesign

## Overview
The Monitoring Center page has been redesigned with a modern, enterprise-grade UI that matches the dashboard aesthetic. It provides continuous compliance monitoring and risk lifecycle management for tracked entities.

## Location
- **URL**: `/monitoring`
- **Navigation**: Dashboard → Monitoring button (bottom of page)
- **File**: `frontend/app/(dashboard)/monitoring/page.tsx`

## Features

### 1. **Header Section**
- **Title**: "Monitoring Center"
- **Subtitle**: "Continuous compliance monitoring and risk lifecycle management"
- **Actions**:
  - Refresh button (with loading spinner animation)
  - Search bar for filtering entities
  - "Add Entity" button (navigates to `/screen`)

### 2. **KPI Cards Row**
Four key metrics displayed in colorful card layouts:

| Card | Icon | Color | Metric |
|------|------|-------|--------|
| **Total Monitored** | Activity | Blue (`#6366f1`) | Total entities under monitoring |
| **High Risk** | AlertTriangle | Red (`#ef4444`) | Entities with HIGH risk level |
| **Medium Risk** | ShieldAlert | Amber (`#f59e0b`) | Entities with MEDIUM risk level |
| **Active Subscriptions** | CheckCircle | Green (`#22c55e`) | Currently active monitoring subscriptions |

### 3. **Filter Tabs**
Quick filter buttons to segment entities by risk level:
- **All** - Shows all monitored entities
- **High Risk** - Only HIGH risk entities (with AlertTriangle icon)
- **Medium Risk** - Only MEDIUM risk entities (with ShieldAlert icon)
- **Low Risk** - Only LOW risk entities (with CheckCircle icon)

Each tab shows the count of matching entities.

### 4. **Monitoring Table**
Comprehensive table with the following columns:

| Column | Description |
|--------|-------------|
| **Entity Profile** | Name + icon (Building2 for entities, User for individuals) + OpenSanctions ID |
| **Reference ID** | Customer reference in monospace font |
| **Risk Level** | Color-coded badge (Red/Amber/Green) with icon |
| **Last Screened** | Formatted date with clock icon |
| **Status** | Active/Inactive badge with green dot indicator |
| **Actions** | View Details (ExternalLink) + Stop Monitoring (Trash2) |

### 5. **Empty State**
When no entities are found:
- Large Shield icon
- Helpful message based on context:
  - If filtering: "Try adjusting your filters"
  - If no data: "Start monitoring entities to track risk changes over time"
- "Add Entity" button to navigate to screening page

## Technical Implementation

### State Management
```typescript
const [entities, setEntities] = useState<MonitoredEntity[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState("");
const [filterType, setFilterType] = useState<"all" | "high" | "medium" | "low">("all");
const [isRefreshing, setIsRefreshing] = useState(false);
```

### Filtering Logic
Uses `useMemo` for efficient filtering:
```typescript
const filteredEntities = useMemo(() => {
  return entities.filter(e => {
    const matchesSearch = 
      e.query_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.customer_ref.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterType === "all" ||
      (filterType === "high" && e.last_risk_level === "HIGH") ||
      (filterType === "medium" && e.last_risk_level === "MEDIUM") ||
      (filterType === "low" && e.last_risk_level === "LOW");
    
    return matchesSearch && matchesFilter;
  });
}, [entities, searchQuery, filterType]);
```

### API Integration
- **Fetch Entities**: `GET /api/v1/monitoring/entities`
- **Delete Entity**: `DELETE /api/v1/monitoring/entities/{id}`
- **Authentication**: Bearer token from localStorage

## Styling

### CSS Architecture
- Uses CSS custom properties (`var(--surface)`, `var(--border)`, etc.)
- Responsive grid layouts
- Smooth transitions and hover effects
- Mobile-responsive breakpoints

### Color Scheme
```css
/* Risk Levels */
.riskHigh { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.riskMedium { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.riskLow { background: rgba(34, 197, 94, 0.1); color: #22c55e; }

/* KPI Icons */
.blue { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
.red { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.yellow { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
```

### Responsive Breakpoints
```css
/* Tablet */
@media (max-width: 1200px) {
  .kpiGrid { grid-template-columns: repeat(2, 1fr); }
}

/* Mobile */
@media (max-width: 768px) {
  .header { flex-direction: column; }
  .kpiGrid { grid-template-columns: 1fr; }
  .tableContainer { overflow-x: auto; }
}
```

## User Interactions

### 1. **Search**
- Type to filter by entity name or reference ID
- Real-time filtering as you type
- Case-insensitive matching

### 2. **Filter Tabs**
- Click any risk level tab to filter
- Active tab highlighted with primary color background
- Tab shows count of matching entities

### 3. **Refresh**
- Click refresh button to reload data
- Spinner animation indicates loading
- Maintains current filter state

### 4. **Delete Entity**
- Click trash icon to stop monitoring
- Confirmation dialog appears
- Entity removed from list on success

### 5. **View Details**
- Click external link icon to view screening details
- Navigates to `/screenings/{id}`
- Opens full screening report

## Data Model

```typescript
interface MonitoredEntity {
  id: string;                // Unique identifier
  customer_ref: string;      // Customer reference code
  entity_id?: string;        // OpenSanctions entity ID (optional)
  query_name: string;        // Entity name
  last_risk_level: string;   // HIGH | MEDIUM | LOW
  last_screened_at: string;  // ISO timestamp
  status: string;            // active | inactive
}
```

## Navigation Flow

```
Dashboard Page
    ↓
[Monitoring Button]
    ↓
/Monitoring Center
    ↓
├─ [Add Entity] → /screen (new screening)
├─ [View Details] → /screenings/{id} (screening report)
├─ [Stop Monitoring] → DELETE API call
└─ [Search/Filter] → Client-side filtering
```

## Improvements Over Original

| Feature | Before | After |
|---------|--------|-------|
| **Header** | Basic title + subtitle | Added refresh button + modern search |
| **Stats** | Simple 4-column grid | Colorful KPI cards with icons |
| **Filtering** | Search only | Search + risk level filter tabs |
| **Table** | Basic rows | Entity icons + formatted dates + better styling |
| **Empty State** | Single line text | Rich empty state with icon + CTA button |
| **Responsiveness** | Limited | Full mobile support with breakpoints |
| **Performance** | Basic filtering | Memoized calculations |

## API Endpoints Used

### GET `/api/v1/monitoring/entities`
**Response**:
```json
[
  {
    "id": "uuid-string",
    "customer_ref": "REF-001",
    "entity_id": "Q12345",
    "query_name": "John Doe",
    "last_risk_level": "HIGH",
    "last_screened_at": "2024-01-15T10:30:00Z",
    "status": "active"
  }
]
```

### DELETE `/api/v1/monitoring/entities/{id}`
**Response**: 200 OK or error

## Files Modified

1. **`frontend/app/(dashboard)/monitoring/page.tsx`** - Complete redesign
2. **`frontend/app/(dashboard)/monitoring/page.module.css`** - New modern styles

## Testing Checklist

- ✅ Build passes with no errors
- ✅ TypeScript compilation successful
- ✅ Responsive layout on all screen sizes
- ✅ Filter tabs work correctly
- ✅ Search filters in real-time
- ✅ Delete confirmation works
- ✅ Empty state displays correctly
- ✅ KPI cards show accurate counts
- ✅ Refresh button shows loading state
- ✅ Navigation links work properly

## Future Enhancements

1. **Bulk Actions**: Select multiple entities to delete/refresh
2. **Export**: Download monitored entities list as CSV
3. **Alerts Panel**: Show recent monitoring alerts
4. **Auto-Refresh**: Poll API every 30 seconds for real-time updates
5. **Advanced Filters**: Date range, entity type, risk trends
6. **Charts**: Risk distribution over time visualization
7. **Notifications**: Bell icon with unread alert count
