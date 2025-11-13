# Server-Side Sorting Fix

## Issue
When sorting devices by status (or any field), the sorting only applied to the current page's 50 devices. This meant:
- Page 1: Shows some offline devices (sorted within page 1)
- Page 2: Shows different offline devices (sorted within page 2)
- **Problem:** All offline devices should be grouped together across ALL pages

## Root Cause
Sorting was happening **client-side** (in the browser) on only the 50 devices loaded for the current page. The API was returning devices in default order (by name), and then JavaScript was sorting just those 50 devices.

### Example of the Problem
```
Page 1 (sorted by status):
- Device A: Offline
- Device B: Offline
- Device C: Warning
- Device D: Online
... (46 more devices)

Page 2 (sorted by status):
- Device E: Offline  ← More offline devices!
- Device F: Offline
- Device G: Warning
... (46 more devices)
```

User expectation: All offline devices should be on the first pages, not scattered across all pages.

## Solution Applied

### 1. Backend API Changes
**File:** `app/Http/Controllers/Api/DeviceController.php`

Added server-side sorting parameters:
```php
$sortBy = $request->input('sort_by', 'name'); // Default sort by name
$sortOrder = $request->input('sort_order', 'asc'); // Default ascending

// Apply sorting
$allowedSortFields = ['name', 'ip_address', 'status', 'uptime_percentage', 'response_time', 'last_ping', 'category'];
$sortField = in_array($sortBy, $allowedSortFields) ? $sortBy : 'name';
$sortDirection = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'asc';

// Special handling for status sorting (custom order)
if ($sortField === 'status') {
    // Define status priority: offline first, then warning, then online
    $query->orderByRaw("
        CASE status
            WHEN 'offline' THEN 1
            WHEN 'warning' THEN 2
            WHEN 'online' THEN 3
            WHEN 'offline_ack' THEN 4
            ELSE 5
        END " . ($sortDirection === 'desc' ? 'DESC' : 'ASC'));
    // Secondary sort by name
    $query->orderBy('name', 'asc');
} else {
    $query->orderBy($sortField, $sortDirection);
}
```

### 2. Frontend Changes
**File:** `resources/js/pages/monitor/devices.tsx`

#### Added Sort Parameters to API Request
```typescript
// Add sorting params
params.append('sort_by', sortField);
params.append('sort_order', sortOrder);
```

#### Updated useEffect Dependencies
```typescript
// Fetch devices on mount and when branch/page/filters/sort change
useEffect(() => {
    fetchDevices();
}, [currentBranch?.id, currentPage, perPage, selectedCategory, statusFilter, sortField, sortOrder]);

// Reset to page 1 when category, status filter, or sort changes
useEffect(() => {
    setCurrentPage(1);
}, [selectedCategory, statusFilter, sortField, sortOrder]);
```

#### Removed Client-Side Sorting
```typescript
// Before: Client-side sorting
const sortedDevices = [...filteredDevices].sort((a, b) => {
    // Complex sorting logic...
});

// After: Use API results directly (already sorted)
const sortedDevices = filteredDevices;
```

## How It Works Now

### Status Sorting Priority
When sorting by status (ascending):
1. **Offline** devices (priority 1)
2. **Warning** devices (priority 2)
3. **Online** devices (priority 3)
4. **Offline Acknowledged** devices (priority 4)

Within each status group, devices are sorted by name alphabetically.

### Example After Fix
```
Page 1 (sorted by status):
- Device A: Offline
- Device B: Offline
- Device E: Offline
- Device F: Offline
... (all offline devices first)

Page 2 (sorted by status):
- Device X: Offline (continued)
- Device Y: Offline
- Device C: Warning
- Device G: Warning
... (warnings after all offline)

Page 3 (sorted by status):
- Device D: Online
- Device H: Online
... (online devices last)
```

## Supported Sort Fields

The API now supports sorting by:
- **name** - Device name (alphabetical)
- **ip_address** - IP address
- **status** - Device status (custom priority order)
- **uptime_percentage** - Uptime percentage
- **response_time** - Response time
- **last_ping** - Last ping timestamp
- **category** - Device category

## API Request Example

### Sort by Status (Ascending)
```
GET /api/devices?branch_id=1&page=1&per_page=50&sort_by=status&sort_order=asc
```

### Sort by Name (Descending)
```
GET /api/devices?branch_id=1&page=1&per_page=50&sort_by=name&sort_order=desc
```

### Sort by Uptime (Ascending)
```
GET /api/devices?branch_id=1&page=1&per_page=50&sort_by=uptime_percentage&sort_order=asc
```

## Caching

The cache key now includes sort parameters:
```php
$cacheKey = "devices.list.branch.{$branchId}.page.{$page}.per.{$perPage}.cat.{$category}.status.{$status}.sort.{$sortBy}.{$sortOrder}";
```

This ensures:
- Different sort orders are cached separately
- Cache is invalidated when sort changes
- 5-minute cache duration for performance

## User Experience

### Before Fix ❌
1. Click "Status" column to sort
2. See some offline devices on page 1
3. Go to page 2
4. See more offline devices (confusing!)
5. Devices not properly grouped

### After Fix ✅
1. Click "Status" column to sort
2. See ALL offline devices grouped together
3. Navigate pages to see remaining offline devices
4. Then see warning devices
5. Finally see online devices
6. Proper global sorting across all pages!

## Performance Impact

**Minimal:**
- Sorting happens at database level (very fast)
- Uses indexed columns where possible
- Cached for 5 minutes
- No additional API calls

## Testing Checklist

- [x] Sort by status shows all offline devices first
- [x] Sort by name works alphabetically across pages
- [x] Sort by IP address works correctly
- [x] Sort by uptime percentage works correctly
- [x] Sort direction toggle (asc/desc) works
- [x] Sorting resets to page 1
- [x] Sorting works with category filters
- [x] Sorting works with status filters
- [x] Pagination shows correct totals
- [x] Build completes without errors

## Files Modified

1. **Backend API**
   - `app/Http/Controllers/Api/DeviceController.php`
   - Added sort parameters
   - Implemented server-side sorting
   - Special handling for status sorting

2. **Frontend**
   - `resources/js/pages/monitor/devices.tsx`
   - Added sort params to API request
   - Updated useEffect dependencies
   - Removed client-side sorting

## Benefits

✅ **Consistent sorting** across all pages
✅ **Faster performance** (database-level sorting)
✅ **Better UX** - users see grouped results
✅ **Scalable** - works with any number of devices
✅ **Cached** - 5-minute cache for speed

## Summary

The sorting now happens on the **server-side** (database level) instead of **client-side** (browser). This means:

- When you sort by status, **ALL** offline devices are grouped together across all pages
- When you sort by name, devices are alphabetically sorted across the entire dataset
- Pagination shows the correctly sorted results
- Much better user experience with predictable, consistent sorting

No more confusion about seeing scattered offline devices across different pages! 🎉
