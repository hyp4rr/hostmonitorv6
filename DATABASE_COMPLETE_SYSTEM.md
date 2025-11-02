# Complete Database System - All Pages

## ✅ **Database Tables Created**

### 1. **Devices Table** (Main table for all network devices)
```sql
- id
- name
- ip_address (unique)
- type (server, router, switch, firewall, wifi, access_point)
- status (online, offline, warning)
- location
- brand
- cpu (0-100%)
- memory (0-100%)
- disk (0-100%)
- uptime_days
- uptime_hours
- description
- created_at, updated_at
```

### 2. **Alerts Table** (System notifications)
```sql
- id
- device_id (foreign key)
- severity (critical, warning, info)
- title
- message
- is_read (boolean)
- is_resolved (boolean)
- resolved_at
- created_at, updated_at
```

### 3. **Network Stats Table** (Analytics data)
```sql
- id
- device_id (foreign key)
- bytes_in
- bytes_out
- packets_in
- packets_out
- errors
- latency
- recorded_at
- created_at, updated_at
```

### 4. **Switches Table** (Original switches data)
```sql
- id
- name
- ip_address (unique)
- location
- brand
- status
- uptime_days
- uptime_hours
- created_at, updated_at
```

## 📊 **Current Database Content**

### Devices (367 total)
- **355 Switches** (from switches table)
- **5 Servers** (Main, Backup, Database, Web, File)
- **3 Routers** (Core, Edge 1, Edge 2)
- **4 WiFi Access Points** (Floor 1-3, Cafeteria)

### Alerts
- **Critical alerts** for offline devices
- **Warning alerts** for high CPU usage devices
- Linked to specific devices

### Device Types Breakdown
```
Switches: 355
Servers: 5
Routers: 3
WiFi: 4
Total: 367 devices
```

## 🔌 **API Endpoints Needed**

### Devices
```
GET  /api/devices              - All devices
GET  /api/devices/stats        - Device statistics
GET  /api/devices/{id}         - Single device
GET  /api/devices/type/{type}  - Devices by type
POST /api/devices/ping-all     - Ping all devices
```

### Alerts
```
GET  /api/alerts               - All alerts
GET  /api/alerts/unread        - Unread alerts
POST /api/alerts/{id}/read     - Mark as read
POST /api/alerts/{id}/resolve  - Resolve alert
```

### Dashboard
```
GET  /api/dashboard/stats      - Dashboard statistics
GET  /api/dashboard/recent     - Recent activity
```

### Analytics
```
GET  /api/analytics/network    - Network statistics
GET  /api/analytics/uptime     - Uptime data
GET  /api/analytics/devices    - Device metrics
```

## 🎯 **Pages That Need Database Integration**

### 1. **Dashboard** (`/monitor/dashboard`)
**Data Needed:**
- Total devices count
- Online/Offline/Warning counts
- Recent alerts
- Network traffic summary
- Top devices by CPU/Memory

**API Calls:**
```typescript
fetch('/api/dashboard/stats')
fetch('/api/alerts?limit=5')
fetch('/api/devices/stats')
```

### 2. **Devices** (`/monitor/devices`) ✅ DONE
**Data Needed:**
- All devices with real-time status
- Filter by type, location, brand
- Sort by any column

**API Calls:**
```typescript
fetch('/api/devices')  // Already implemented
```

### 3. **Alerts** (`/monitor/alerts`)
**Data Needed:**
- All alerts with severity
- Filter by read/unread, resolved
- Device information
- Mark as read/resolved actions

**API Calls:**
```typescript
fetch('/api/alerts')
POST /api/alerts/{id}/read
POST /api/alerts/{id}/resolve
```

### 4. **Analytics** (`/monitor/analytics`)
**Data Needed:**
- Network traffic over time
- Device uptime statistics
- CPU/Memory/Disk usage trends
- Error rates

**API Calls:**
```typescript
fetch('/api/analytics/network')
fetch('/api/analytics/uptime')
fetch('/api/analytics/devices')
```

### 5. **Reports** (`/monitor/reports`)
**Data Needed:**
- Device inventory report
- Uptime report
- Alert history
- Network performance

**API Calls:**
```typescript
fetch('/api/reports/inventory')
fetch('/api/reports/uptime')
fetch('/api/reports/alerts')
```

### 6. **Maps** (`/monitor/maps`)
**Data Needed:**
- Devices grouped by location
- Status per location
- Interactive map data

**API Calls:**
```typescript
fetch('/api/devices?group_by=location')
```

## 🚀 **Implementation Status**

### ✅ Completed
- [x] Database migrations
- [x] Models (Device, Alert, NetworkStat)
- [x] Relationships
- [x] Seeder with 367 devices
- [x] Devices API endpoint
- [x] Real-time updates for devices page

### 🔄 In Progress
- [ ] Dashboard API endpoints
- [ ] Alerts API endpoints
- [ ] Analytics API endpoints
- [ ] Frontend integration for all pages

### 📝 Next Steps
1. Create API controllers for:
   - Dashboard
   - Alerts
   - Analytics
   - Reports
2. Update frontend pages to use database
3. Add real-time polling for all pages
4. Implement WebSocket for instant updates

## 💾 **Database Queries**

### Check Current Data
```bash
php artisan tinker

# Total devices
>>> App\Models\Device::count()
=> 367

# By type
>>> App\Models\Device::select('type', DB::raw('count(*) as total'))
    ->groupBy('type')
    ->get()

# Online devices
>>> App\Models\Device::where('status', 'online')->count()

# Alerts
>>> App\Models\Alert::count()

# Unread alerts
>>> App\Models\Alert::where('is_read', false)->count()
```

### Update Device Status
```bash
# Update all switches from NetworkSwitch table
>>> $switches = App\Models\NetworkSwitch::all();
>>> foreach($switches as $switch) {
    App\Models\Device::where('ip_address', $switch->ip_address)
        ->update(['status' => $switch->status]);
}
```

## 🔧 **Sync Script**

Create a command to sync switches to devices:

```bash
php artisan make:command SyncDevices
```

```php
// In handle() method
$switches = NetworkSwitch::all();
foreach ($switches as $switch) {
    Device::updateOrCreate(
        ['ip_address' => $switch->ip_address],
        [
            'name' => $switch->name,
            'type' => 'switch',
            'status' => $switch->status,
            'location' => $switch->location,
            'brand' => $switch->brand,
            'uptime_days' => $switch->uptime_days,
            'uptime_hours' => $switch->uptime_hours,
        ]
    );
}
```

## 📈 **Real-Time Updates**

### Current Implementation
- Devices page: 60-second polling
- Switches: Ping every minute via scheduler

### Recommended
- Dashboard: 30-second polling
- Alerts: 15-second polling
- Analytics: 5-minute polling
- WebSocket for instant updates

## 🎨 **Frontend Integration**

### Example: Dashboard Stats
```typescript
const [stats, setStats] = useState({
    total: 0,
    online: 0,
    offline: 0,
    warning: 0
});

useEffect(() => {
    const fetchStats = async () => {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        setStats(data);
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
}, []);
```

### Example: Alerts
```typescript
const [alerts, setAlerts] = useState([]);

useEffect(() => {
    const fetchAlerts = async () => {
        const response = await fetch('/api/alerts?unread=true');
        const data = await response.json();
        setAlerts(data);
    };
    
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
}, []);
```

## ✨ **Summary**

Your system now has:

✅ **Complete database schema** for all device types  
✅ **367 devices** imported (355 switches + 12 other devices)  
✅ **Alerts system** with severity levels  
✅ **Network stats** table for analytics  
✅ **Models with relationships**  
✅ **Seeder** for easy data population  

**Next: Create API endpoints and integrate frontend pages!**
