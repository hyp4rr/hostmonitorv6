# Selection System Implementation Guide

## Overview
Added a comprehensive selection system with checkboxes, "Select All", and bulk delete functionality to all sections in the configuration panel.

## Features Implemented

### 1. **Bulk Selection Controls**
- ✅ **Select All** button - Toggles selection of all items in current view
- ✅ **Delete Selected** button - Appears when items are selected, shows count
- ✅ **Checkbox in table header** - Select/deselect all items
- ✅ **Individual checkboxes** - Select individual items per row

### 2. **State Management**
```typescript
const [selectedIds, setSelectedIds] = useState<number[]>([]);
const [isDeleting, setIsDeleting] = useState(false);
```

### 3. **Functions Added**
- `handleBulkDelete()` - Deletes all selected items with confirmation
- `toggleSelection(id)` - Toggles selection for a single item
- `toggleSelectAll()` - Toggles selection for all items
- `getCurrentData()` - Returns current data based on selected entity

### 4. **UI Components**

#### Bulk Action Buttons (in header)
```tsx
<button onClick={toggleSelectAll}>
    <Check className="size-4" />
    {selectedIds.length === getCurrentData().length ? 'Deselect All' : 'Select All'}
</button>

{selectedIds.length > 0 && (
    <button onClick={handleBulkDelete} disabled={isDeleting}>
        <Trash2 className="size-4" />
        Delete Selected ({selectedIds.length})
    </button>
)}
```

#### Table Header Checkbox
```tsx
<th className="px-6 py-3 w-12">
    <input
        type="checkbox"
        checked={selectedIds.length === items.length && items.length > 0}
        onChange={() => {/* toggle all logic */}}
        className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
    />
</th>
```

#### Table Row Checkbox
```tsx
<td className="px-6 py-4">
    <input
        type="checkbox"
        checked={selectedIds.includes(item.id)}
        onChange={() => onToggleSelection(item.id)}
        className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
    />
</td>
```

## Tables Updated

### ✅ Completed
1. **BranchesTable** - Full checkbox implementation

### 🔄 Needs Implementation
2. **LocationsTable**
3. **DevicesTable**
4. **AlertsTable**
5. **UsersTable**
6. **BrandsTable**
7. **ModelsTable**

## Implementation Pattern for Remaining Tables

For each table component, follow this pattern:

### 1. Update Props Interface
```typescript
function TableName({
    items,
    onEdit,
    onDelete,
    selectedIds,           // ADD
    onToggleSelection,     // ADD
}: {
    items: ItemType[];
    onEdit: (item: ItemType) => void;
    onDelete: (item: ItemType) => void;
    selectedIds: number[];              // ADD
    onToggleSelection: (id: number) => void;  // ADD
}) {
```

### 2. Add Checkbox Column to Header
```typescript
<thead>
    <tr>
        <th className="px-6 py-3 w-12">  {/* ADD THIS COLUMN */}
            <input
                type="checkbox"
                checked={selectedIds.length === items.length && items.length > 0}
                onChange={() => {
                    if (selectedIds.length === items.length) {
                        items.forEach(item => onToggleSelection(item.id));
                    } else {
                        items.forEach(item => {
                            if (!selectedIds.includes(item.id)) {
                                onToggleSelection(item.id);
                            }
                        });
                    }
                }}
                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
        </th>
        {/* ... existing columns ... */}
    </tr>
</thead>
```

### 3. Add Checkbox Cell to Body Rows
```typescript
<tbody>
    {items.map((item) => (
        <tr key={item.id}>
            <td className="px-6 py-4">  {/* ADD THIS CELL */}
                <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => onToggleSelection(item.id)}
                    className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
            </td>
            {/* ... existing cells ... */}
        </tr>
    ))}
</tbody>
```

## User Experience

### Selection Flow
1. User clicks "Select All" button or header checkbox
2. All visible items get checkboxes checked
3. "Delete Selected (N)" button appears showing count
4. User can:
   - Deselect individual items
   - Click "Select All" again to deselect all
   - Click "Delete Selected" to bulk delete

### Bulk Delete Flow
1. User selects items via checkboxes
2. Clicks "Delete Selected (N)" button
3. Confirmation dialog appears: "Are you sure you want to delete N selected item(s)?"
4. On confirm:
   - All selected items deleted via parallel API calls
   - Success message shown
   - Data refreshed
   - Selection cleared

## API Integration

Bulk delete uses parallel DELETE requests:
```typescript
const deletePromises = selectedIds.map(id =>
    fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
        },
    })
);

await Promise.all(deletePromises);
```

## Styling

### Button Styles
- **Select All**: White background, slate border (matches Refresh button)
- **Delete Selected**: Red gradient background, white text
- **Checkboxes**: Blue accent color with focus ring

### States
- **Normal**: Unchecked checkbox
- **Checked**: Blue checkbox with checkmark
- **Hover**: Slight background change on row
- **Disabled**: Opacity 50% when deleting

## Benefits

1. **Efficiency**: Delete multiple items at once
2. **User Control**: Clear visual feedback of selection
3. **Safety**: Confirmation dialog prevents accidents
4. **Consistency**: Same pattern across all sections
5. **Performance**: Parallel API calls for bulk operations

## Next Steps

To complete the implementation:

1. Apply the same pattern to remaining 6 table components
2. Test bulk delete for each entity type
3. Verify selection state clears when switching entities
4. Test with large datasets (100+ items)
5. Add keyboard shortcuts (Ctrl+A for select all)

## Files Modified

- `resources/js/pages/monitor/configuration.tsx` - Main configuration page
  - Added state management
  - Added bulk action functions
  - Added UI controls
  - Updated BranchesTable component
  - Props passed to all table components

## Testing Checklist

- [ ] Select All works for each entity
- [ ] Individual selection works
- [ ] Bulk delete works for each entity
- [ ] Selection clears when switching entities
- [ ] Confirmation dialog appears
- [ ] Success/error messages show
- [ ] Data refreshes after delete
- [ ] Disabled state works during deletion
- [ ] Works with filtered data (devices/alerts)
- [ ] Checkbox styling matches design
