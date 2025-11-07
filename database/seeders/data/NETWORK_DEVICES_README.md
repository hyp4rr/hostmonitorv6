# Network Devices Import

This directory contains CSV files for importing network devices by category.

## CSV Files

| File | Category | Description | Sample Devices |
|------|----------|-------------|----------------|
| `hostmonitor_devices.csv` | Servers | Network servers | eoffice, epayment, vmware hosts, firewalls |
| `switches.csv` | Switches | Network switches | Core, Distribution, Access switches |
| `wifi.csv` | WiFi | WiFi Access Points | Floor APs, Lobby AP, Conference Room AP |
| `tas.csv` | TAS | Time Attendance Systems | Building entrance TAS, Parking gates |
| `cctv.csv` | CCTV | CCTV Cameras | Entrance cameras, Corridor cameras |

## CSV Format

All CSV files follow the same format:

```csv
location,name,ip_address,status,response_time
A5,Device Name,10.8.2.1,online,1
```

### Columns

| Column | Description | Example |
|--------|-------------|---------|
| `location` | Physical location/area | `A5`, `Building A`, `Floor 1` |
| `name` | Device name/description | `Switch Core 1`, `WiFi AP Lobby` |
| `ip_address` | IP address | `10.8.2.1` |
| `status` | Device status | `online` or `offline` |
| `response_time` | Ping response time (ms) | `1`, `15`, empty for offline |

## Usage

### Import All Categories

Run the unified seeder to import all device categories at once:

```bash
php artisan db:seed --class=NetworkDevicesSeeder
```

This will import:
- ✅ 181 Servers (from HostMonitor)
- ✅ 10 Switches
- ✅ 10 WiFi Access Points
- ✅ 10 TAS Devices
- ✅ 10 CCTV Cameras
- **Total: 221 devices**

### What Gets Created

The seeder automatically creates:

1. **Branch**: Uses existing UTHM Kampus Parit Raja (code: `PR`)
2. **Locations**: All unique locations from the CSVs
3. **Brand**: Generic brand
4. **Models**: 
   - Network Server
   - Network Switch
   - WiFi Access Point
   - Time Attendance System
   - CCTV Camera
5. **Devices**: All devices with:
   - Generated MAC addresses based on IP
   - Barcode format: `HM-{ip}` for servers, `{CATEGORY}-{ip}` for others
   - Category: `servers`, `switches`, `wifi`, `tas`, or `cctv`
   - Location: `UTHM Kampus Parit Raja - {location_name}`
   - Uptime: 99.9% for online, 0% for offline

### Import Summary

After running, you'll see:

```
═══════════════════════════════════════════════════════
           📊 IMPORT SUMMARY
═══════════════════════════════════════════════════════
🌐 Total Devices Processed: 221
✅ Online Devices: 199
❌ Offline Devices: 22
🆕 Devices Created: 221
🔄 Devices Updated: 0
═══════════════════════════════════════════════════════

📦 Devices by Category:
   • SERVERS: 181 devices (159 online, 22 offline)
   • SWITCHES: 10 devices (10 online, 0 offline)
   • WIFI: 10 devices (10 online, 0 offline)
   • TAS: 10 devices (10 online, 0 offline)
   • CCTV: 10 devices (10 online, 0 offline)
```

## Customization

### Add More Devices

Edit any CSV file to add more devices:

```csv
location,name,ip_address,status,response_time
A5,New Switch,10.8.2.99,online,2
```

### Change Locations

Update the `location` column to organize devices by different areas:

```csv
Building A,Switch Floor 1,10.8.2.30,online,3
Building B,Switch Floor 2,10.8.2.31,online,3
```

### Modify Device Status

Change status to `offline` for devices that are down:

```csv
A5,Old Switch,10.8.2.50,offline,
```

### Custom Barcode Format

Barcodes are automatically generated as:
- Switches: `SWITCHES-{ip}` (e.g., `SWITCHES-10821`)
- WiFi: `WIFI-{ip}` (e.g., `WIFI-108101`)
- TAS: `TAS-{ip}` (e.g., `TAS-108201`)
- CCTV: `CCTV-{ip}` (e.g., `CCTV-108301`)

## Re-running the Seeder

The seeder uses `updateOrCreate()` based on IP address:
- **Existing devices** (same IP) will be updated
- **New devices** will be created
- **No duplicates** will be created

Safe to run multiple times!

## Sample Data

### Switches (10 devices)
- Switch Core 1-2
- Switch Distribution 1-2
- Switch Access 1-6

### WiFi (10 devices)
- WiFi AP Floor 1-1, 1-2
- WiFi AP Floor 2-1, 2-2
- WiFi AP Floor 3-1, 3-2
- WiFi AP Lobby, Conference Room, Library, Cafeteria

### TAS (10 devices)
- TAS Main Entrance
- TAS Building A, B, C
- TAS Staff Area
- TAS Parking Gate 1-2
- TAS Server Room, Admin Office, Security Post

### CCTV (10 devices)
- CCTV Main Entrance, Lobby
- CCTV Corridor Floor 1-3
- CCTV Parking Area, Server Room
- CCTV Emergency Exit
- CCTV Perimeter 1-2

## IP Address Ranges

| Category | IP Range | Example |
|----------|----------|---------|
| Switches | 10.8.2.x | 10.8.2.1 - 10.8.2.25 |
| WiFi | 10.8.10.x | 10.8.10.1 - 10.8.10.13 |
| TAS | 10.8.20.x | 10.8.20.1 - 10.8.20.10 |
| CCTV | 10.8.30.x | 10.8.30.1 - 10.8.30.10 |

## Notes

- All devices are set to `online` status by default
- Response times are realistic estimates (1-27ms)
- All devices are located in `A5` location
- MAC addresses are auto-generated from IP addresses
- All devices belong to UTHM Kampus Parit Raja branch

## Troubleshooting

### Branch Not Found Error

If you see "Branch PR not found", run the branch seeder first:

```bash
php artisan db:seed --class=BranchSeeder
```

### CSV File Not Found

Ensure all CSV files exist in `database/seeders/data/`:
- switches.csv
- wifi.csv
- tas.csv
- cctv.csv

### Duplicate IP Address

If you get a duplicate IP error, check your CSV files for duplicate IP addresses and update them to be unique.
