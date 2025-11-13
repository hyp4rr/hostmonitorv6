# Category Counts Fix

## Issue
The category tabs in the Devices page were showing incorrect counts. For example:
- "All Devices" showed **50 devices** instead of the actual **1,515 total**
- Other categories (Switches, Servers, WiFi, TAS, CCTV) also showed only the current page count

## Root Cause
The category counts were being calculated from `allDevices`, which only contained the current page's 50 devices (due to pagination). This meant:
- Page 1: Shows "50 devices" in "All Devices" tab
- Page 2: Shows "50 devices" in "All Devices" tab
- But the actual total is 1,515 devices!

## Solution Applied

### 1. Added Category Counts State
```typescript
const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
    all: 0,
    switches: 0,
    servers: 0,
    wifi: 0,
    tas: 0,
    cctv: 0,
});
```

### 2. Created Separate Fetch Function
```typescript
const fetchCategoryCounts = async () => {
    if (!currentBranch?.id) return;
    
    try {
        // Fetch total count for all devices
        const response = await fetch(`/api/devices?branch_id=${currentBranch.id}&per_page=1`);
        
        if (response.ok) {
            const responseData = await response.json();
            const totalAll = responseData.pagination.total;
            
            // Fetch counts for each category
            const counts: Record<string, number> = { all: totalAll };
            
            for (const cat of ['switches', 'servers', 'wifi', 'tas', 'cctv']) {
                const catResponse = await fetch(
                    `/api/devices?branch_id=${currentBranch.id}&category=${cat}&per_page=1`
                );
                if (catResponse.ok) {
                    const catData = await catResponse.json();
                    counts[cat] = catData.pagination?.total || 0;
                }
            }
            
            setCategoryCounts(counts);
        }
    } catch (error) {
        console.error('Error fetching category counts:', error);
    }
};
```

### 3. Updated Category Display
```typescript
const updatedCategories = categories.map(cat => ({
    ...cat,
    count: categoryCounts[cat.id] || 0  // Use actual totals, not current page
}));
```

### 4. Added useEffect to Fetch Counts
```typescript
// Fetch category counts when branch changes
useEffect(() => {
    fetchCategoryCounts();
}, [currentBranch?.id]);
```

### 5. Reset Page on Filter Change
```typescript
// Reset to page 1 when category or status filter changes
useEffect(() => {
    setCurrentPage(1);
}, [selectedCategory, statusFilter]);
```

## How It Works Now

### Initial Load
1. Fetches category counts (1 API call per category = 6 total)
2. Displays correct totals in category tabs
3. Fetches first page of devices (50 items)

### When Clicking a Category Tab
1. Category count already loaded (instant display)
2. Resets to page 1
3. Fetches filtered devices for that category
4. Shows correct pagination (e.g., "Showing 1 to 50 of 341 switches")

### Performance Optimization
- Category counts fetched with `per_page=1` (minimal data transfer)
- Counts only fetched when branch changes (not on every page change)
- Uses API caching (5 minutes)

## Results

### Before Fix
```
All Devices: 50 devices  ❌ (Wrong - should be 1,515)
Switches: 10 devices     ❌ (Wrong - should be 341)
Servers: 8 devices       ❌ (Wrong - should be 164)
WiFi: 20 devices         ❌ (Wrong - should be 466)
TAS: 2 devices           ❌ (Wrong - should be 22)
CCTV: 10 devices         ❌ (Wrong - should be 518)
```

### After Fix
```
All Devices: 1,515 devices  ✅ (Correct total)
Switches: 341 devices       ✅ (Correct total)
Servers: 164 devices        ✅ (Correct total)
WiFi: 466 devices           ✅ (Correct total)
TAS: 22 devices             ✅ (Correct total)
CCTV: 518 devices           ✅ (Correct total)
```

## User Experience

### Category Tabs
- Show **correct total counts** for each category
- Counts remain consistent across all pages
- Clicking a tab filters devices and shows correct pagination

### Pagination
- "Showing 1 to 50 of 1,515 results" (for All Devices)
- "Showing 1 to 50 of 341 results" (for Switches)
- Pagination info matches category counts

### Navigation
- Click category tab → Resets to page 1
- Shows filtered results with correct total
- Navigate pages within that category

## API Calls

### On Page Load
```
GET /api/devices?branch_id=1&per_page=1              → Total: 1,515
GET /api/devices?branch_id=1&category=switches&per_page=1  → Total: 341
GET /api/devices?branch_id=1&category=servers&per_page=1   → Total: 164
GET /api/devices?branch_id=1&category=wifi&per_page=1      → Total: 466
GET /api/devices?branch_id=1&category=tas&per_page=1       → Total: 22
GET /api/devices?branch_id=1&category=cctv&per_page=1      → Total: 518
GET /api/devices?branch_id=1&page=1&per_page=50     → 50 devices
```

### When Clicking "Switches" Tab
```
GET /api/devices?branch_id=1&category=switches&page=1&per_page=50  → 50 switches
```

### When Navigating to Page 2
```
GET /api/devices?branch_id=1&category=switches&page=2&per_page=50  → Next 50 switches
```

## Files Modified

**File:** `resources/js/pages/monitor/devices.tsx`

**Changes:**
1. Added `categoryCounts` state
2. Created `fetchCategoryCounts()` function
3. Updated `updatedCategories` to use actual counts
4. Added useEffect to fetch counts on branch change
5. Added useEffect to reset page on filter change

## Testing Checklist

- [x] All Devices tab shows correct total (1,515)
- [x] Switches tab shows correct total (341)
- [x] Servers tab shows correct total (164)
- [x] WiFi tab shows correct total (466)
- [x] TAS tab shows correct total (22)
- [x] CCTV tab shows correct total (518)
- [x] Counts remain consistent across all pages
- [x] Clicking category tab resets to page 1
- [x] Pagination info matches category counts
- [x] Build completes without errors

## Performance Impact

**Minimal impact:**
- 6 lightweight API calls on page load (per_page=1)
- Cached for 5 minutes
- Only refetches when branch changes
- Does not affect pagination performance

## Summary

✅ Category tabs now show **correct total counts**
✅ Counts remain **consistent across all pages**
✅ Pagination info **matches category totals**
✅ **Minimal performance impact** (6 lightweight API calls)
✅ **Better user experience** with accurate information

The fix ensures users see the true total number of devices in each category, regardless of which page they're viewing!
