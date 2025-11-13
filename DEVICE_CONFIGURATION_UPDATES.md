# Device Configuration Updates

## ✅ Completed Backend Changes

### 1. Database Migrations
- ✅ Added `role` column to `users` table (enum: 'admin', 'staff', default: 'staff')
- ✅ Added `managed_by` column to `devices` table (foreign key to users)
- ✅ Added `serial_number` column to `devices` table (string, nullable)

### 2. Models Updated
- ✅ `User` model: Added 'role' to fillable fields
- ✅ `Device` model: Added 'managed_by' and 'serial_number' to fillable fields
- ✅ `Device` model: Added `managedBy()` relationship method

### 3. API Controller Updated
- ✅ `DeviceController`: Added 'managedBy' to eager loading
- ✅ `DeviceController`: Updated `transformDevice()` to include:
  - `managed_by` (user ID)
  - `managed_by_user` (full user object with name, email, role)
  - `serial_number`

### 4. TypeScript Interfaces Updated
- ✅ `Device` interface: Added managed_by, managed_by_user, serial_number
- ✅ `UserData` interface: Added role field

## 🔄 Frontend Changes Needed

### Changes to Make in `configuration.tsx`:

#### 1. Add View Button to DevicesTable Component

**Location**: Line 1260-1277 (Actions column)

**Add this button BEFORE the Edit button**:
```tsx
<button 
    onClick={() => onView(device)} 
    className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
    title="View Details"
>
    <Eye className="size-4" />
</button>
```

**Update DevicesTable props** (Line 1066-1086):
```tsx
function DevicesTable({
    devices,
    onView,      // ADD THIS
    onEdit,
    onDelete,
    onAcknowledgeOffline,
    sortField,
    sortDirection,
    onSort,
    selectedIds,
    onToggleSelection,
}: {
    devices: Device[];
    onView: (device: Device) => void;      // ADD THIS
    onEdit: (device: Device) => void;
    onDelete: (device: Device) => void;
    onAcknowledgeOffline: (device: Device) => void;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    onSort: (field: string) => void;
    selectedIds: number[];
    onToggleSelection: (id: number) => void;
}) {
```

#### 2. Add Eye Icon Import

**Location**: Line 2-22 (imports)

**Add to lucide-react imports**:
```tsx
import {
    AlertTriangle,
    Edit,
    Eye,        // ADD THIS
    Plus,
    Save,
    // ... rest of imports
} from 'lucide-react';
```

#### 3. Add View Modal State

**Location**: Around line 172 (after other modal states)

**Add**:
```tsx
const [showViewModal, setShowViewModal] = useState(false);
const [viewDevice, setViewDevice] = useState<Device | null>(null);
```

#### 4. Add View Handler Function

**Location**: Around line 350 (near other handlers)

**Add**:
```tsx
const handleViewDevice = (device: Device) => {
    setViewDevice(device);
    setShowViewModal(true);
};
```

#### 5. Add View Modal Component

**Location**: After the main modal (around line 3000+)

**Add**:
```tsx
{/* View Device Modal */}
{showViewModal && viewDevice && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Device Details
                </h2>
                <button
                    onClick={() => setShowViewModal(false)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                    <X className="size-5" />
                </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto p-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Basic Information
                        </h3>
                        
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Device Name
                            </label>
                            <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.name}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                IP Address
                            </label>
                            <p className="mt-1 font-mono text-slate-900 dark:text-white">{viewDevice.ip_address}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                MAC Address
                            </label>
                            <p className="mt-1 font-mono text-slate-900 dark:text-white">{viewDevice.mac_address || '-'}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Barcode
                            </label>
                            <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.barcode}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Serial Number
                            </label>
                            <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.serial_number || '-'}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Category
                            </label>
                            <p className="mt-1 text-slate-900 dark:text-white">{formatCategory(viewDevice.category)}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Status
                            </label>
                            <p className="mt-1">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                    viewDevice.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    viewDevice.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                    {viewDevice.status}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Location & Management */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Location & Management
                        </h3>

                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Branch
                            </label>
                            <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.branch?.name || '-'}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Location
                            </label>
                            <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.location?.name || '-'}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Managed By
                            </label>
                            {viewDevice.managed_by_user ? (
                                <div className="mt-1">
                                    <p className="text-slate-900 dark:text-white">{viewDevice.managed_by_user.name}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{viewDevice.managed_by_user.email}</p>
                                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                        viewDevice.managed_by_user.role === 'admin' 
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                        {viewDevice.managed_by_user.role}
                                    </span>
                                </div>
                            ) : (
                                <p className="mt-1 text-slate-400 dark:text-slate-600">Not assigned</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Hardware
                            </label>
                            {viewDevice.hardware_detail ? (
                                <div className="mt-1">
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {viewDevice.hardware_detail.brand}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {viewDevice.hardware_detail.model}
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-1 text-slate-400 dark:text-slate-600">-</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Uptime
                            </label>
                            <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.uptime_percentage}%</p>
                        </div>

                        {viewDevice.response_time && (
                            <div>
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Response Time
                                </label>
                                <p className="mt-1 text-slate-900 dark:text-white">{viewDevice.response_time}ms</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
                <button
                    onClick={() => {
                        setShowViewModal(false);
                        handleEdit(viewDevice);
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Edit Device
                </button>
                <button
                    onClick={() => setShowViewModal(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
)}
```

#### 6. Update DevicesTable Call

**Location**: Around line 1000 (where DevicesTable is rendered)

**Update to include onView**:
```tsx
<DevicesTable
    devices={filteredDevices}
    onView={handleViewDevice}     // ADD THIS
    onEdit={handleEdit}
    onDelete={handleDelete}
    onAcknowledgeOffline={handleAcknowledgeOffline}
    sortField={deviceSortField}
    sortDirection={deviceSortDirection}
    onSort={handleDeviceSort}
    selectedIds={selectedIds}
    onToggleSelection={toggleSelection}
/>
```

#### 7. Update Device Form to Include New Fields

**Location**: Around line 2525 (device form)

**Add after barcode field**:
```tsx
<div>
    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Serial Number
    </label>
    <input 
        type="text" 
        name="serial_number" 
        defaultValue={deviceData?.serial_number || ''} 
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white" 
        placeholder="Enter serial number" 
    />
</div>

<div>
    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Managed By
    </label>
    <select 
        name="managed_by" 
        defaultValue={deviceData?.managed_by || ''} 
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
    >
        <option value="">Not Assigned</option>
        {users.map(user => (
            <option key={user.id} value={user.id}>
                {user.name} ({user.role})
            </option>
        ))}
    </select>
</div>
```

#### 8. Update Users Table to Show Role

**Location**: Find the UsersTable component

**Add a column for Role** between email and actions:
```tsx
<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300">
    Role
</th>

// In the table body:
<td className="px-6 py-4">
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
        user.role === 'admin' 
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    }`}>
        {user.role}
    </span>
</td>
```

#### 9. Update User Form to Include Role

**Location**: User form modal

**Add role field**:
```tsx
<div>
    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Role *
    </label>
    <select 
        name="role" 
        defaultValue={userData?.role || 'staff'} 
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        required
    >
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
    </select>
</div>
```

## Summary

All backend changes are complete. The frontend changes require manual editing of the `configuration.tsx` file to:
1. Add view button and modal
2. Display managed_by and serial_number fields
3. Show user roles in user table
4. Add form fields for the new data

The database is ready and the API is returning all the necessary data!
