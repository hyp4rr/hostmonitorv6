# HostMonitor Device Import

This directory contains CSV data files for importing network devices from HostMonitor reports.

## Files

- **`hostmonitor_devices.csv`** - Contains all network devices extracted from the HostMonitor HTML report

## CSV Format

The CSV file has the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| `location` | Physical location/area name | `A5`, `DMZ`, `Internet` |
| `name` | Device name/description | `eoffice.uthm.edu.my` |
| `ip_address` | IP address of the device | `161.139.246.177` |
| `status` | Device status | `online` or `offline` |
| `response_time` | Ping response time in ms | `1`, `15`, empty for offline |

## Usage

### Import All Devices

Run the seeder to import all devices from the CSV:

```bash
php artisan db:seed --class=HostMonitorCsvImportSeeder
```

### What Gets Created

The seeder will automatically create:

1. **Branch**: UTHM Parit Raja (code: `UTHM-PR`)
2. **Locations**: All unique locations from the CSV (A5, A01-05, DMZ, etc.)
3. **Brand**: Generic brand for network devices
4. **Model**: Network Server model
5. **Devices**: All devices as servers with:
   - Generated MAC addresses based on IP
   - Barcode format: `HM-{ip_without_dots}`
   - Category: `servers`
   - Location format: `UTHM Kampus Parit Raja - {location_name}`
   - Uptime: 99.9% for online, 0% for offline

### Import Summary

After running, you'll see a detailed summary:

```
═══════════════════════════════════════════════════════
           📊 IMPORT SUMMARY
═══════════════════════════════════════════════════════
🌐 Total Devices Processed: 195
✅ Online Devices: 165
❌ Offline Devices: 30
🆕 Devices Created: 195
🔄 Devices Updated: 0
📍 Total Locations: 24
═══════════════════════════════════════════════════════

📍 Devices by Location:
   • A5: 6 devices
   • A01-05: 29 devices
   • DMZ: 15 devices
   • HCI Sangfor: 2 devices
   • C2: 7 devices
   • EMC A5: 9 devices
   • EMC C2: 7 devices
   • Internet: 13 devices
   • Infra HQ: 5 devices
   • SSO: 13 devices
   • MSA: 2 devices
   • Pagoh: 7 devices
   • PDSA: 1 device
   • Pumas Tg. Labuh: 4 devices
   • BCB: 9 devices
   • Perwira: 2 devices
   • myren upstream: 4 devices
   • FKAAS: 1 device
   • FSKTM: 10 devices
   • FTK: 1 device
   • PTTA: 6 devices
   • Switch Rack A5: 16 devices
   • Switch Rack C2: 7 devices
   • DNS: 4 devices
```

## Device Statistics

### Total Devices: **195**

### By Location:
- **A5**: 6 devices (eoffice, epayment, eplm, lpu, saas idrac, telefon)
- **A01-05**: 29 devices (servers, VMs, network infrastructure)
- **DMZ**: 15 devices (firewalls, hypergrids, sangfor)
- **HCI Sangfor**: 2 nodes
- **C2**: 7 devices (acronis, author, vmha hosts)
- **EMC A5**: 9 devices (storage controllers, switches)
- **EMC C2**: 7 devices (storage controllers, switches)
- **Internet**: 13 devices (firewalls, BGP, eduroam)
- **Infra HQ**: 5 devices (DNS servers, AD)
- **SSO**: 13 devices (keycloak, RKE clusters)
- **MSA**: 2 devices
- **Pagoh**: 7 devices (campus network)
- **PDSA**: 1 device
- **Pumas Tg. Labuh**: 4 devices
- **BCB**: 9 devices (VLANs, gateways)
- **Perwira**: 2 devices
- **myren upstream**: 4 devices
- **FKAAS**: 1 device (ansys license)
- **FSKTM**: 10 devices (faculty network)
- **FTK**: 1 device (ansys license)
- **PTTA**: 6 devices (library servers)
- **Switch Rack A5**: 16 switches
- **Switch Rack C2**: 7 switches
- **DNS**: 4 DNS servers

### By Status:
- **Online**: ~165 devices (85%)
- **Offline**: ~30 devices (15%)

## Customization

### Modify CSV Data

You can edit `hostmonitor_devices.csv` to:
- Add new devices
- Update device information
- Change device status
- Modify locations

### Change Device Category

By default, all devices are imported as `servers`. To change this, edit the seeder:

```php
'category' => 'servers', // Change to: 'switches', 'wifi', 'cctv', etc.
```

### Custom MAC Addresses

The seeder generates MAC addresses based on IP addresses. To use real MAC addresses, add a `mac_address` column to the CSV.

## Re-running the Seeder

The seeder uses `updateOrCreate()` based on IP address, so:
- **Existing devices** (same IP) will be updated
- **New devices** will be created
- **No duplicates** will be created

Safe to run multiple times!

## Source Data

Data extracted from: **HostMonitor Report** (Generated on 5/11/2025 at 4:53:16 PM)
- Time zone: GMT +08:00 Malaysia, Singapore, Western Australia
- Source: UTHM Network Infrastructure Monitoring System
