# CSV Import/Export Guide for Devices

## Overview

The device configuration page now supports importing and exporting devices via CSV files. This makes it easy to:
- Bulk import devices from spreadsheets
- Export device data for backup or analysis
- Update multiple devices at once

## CSV Export

### How to Export

1. Go to **Configuration** → **Devices** tab
2. Apply any filters you want (category, status, etc.)
3. Click the **"Export CSV"** button (green button with download icon)
4. The CSV file will download automatically

### Export Format

The exported CSV includes the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| ID | Device database ID | 123 |
| Name | Device name | Switch Core 1 |
| IP Address | Device IP address | 10.8.2.1 |
| MAC Address | MAC address | 00:1B:44:11:3A:B7 |
| Barcode | Device barcode | SW-001 |
| Category | Device category | switches |
| Status | Current status | online |
| Branch | Branch name | UTHM Kampus Parit Raja |
| Location | Location name | Building A |
| Brand | Hardware brand | Cisco |
| Model | Hardware model | Catalyst 2960 |
| Serial Number | Device serial number | SN123456 |
| Managed By | Manager name | John Doe |
| Building | Building name | Block A |
| Uptime % | Uptime percentage | 99.9 |
| Response Time (ms) | Ping response time | 15 |
| Is Active | Active status | Yes/No |
| SLA Target % | SLA target percentage | 99.9 |
| Created At | Creation timestamp | 2025-11-25 10:00:00 |
| Updated At | Last update timestamp | 2025-11-25 15:30:00 |

### Export Filters

The export respects your current filters:
- **Branch**: Only exports devices from selected branch
- **Category**: Only exports devices of selected category
- **Status**: Only exports devices with selected status

## CSV Import

### How to Import

1. Go to **Configuration** → **Devices** tab
2. Click the **"Import CSV"** button (purple button with upload icon)
3. Select your CSV file
4. Choose import mode:
   - **OK**: Update existing devices (by IP address or ID)
   - **Cancel**: Skip existing devices (only import new ones)
5. Wait for import to complete
6. Review the import summary

### CSV Format for Import

Your CSV file must include these **required columns**:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| **name** | ✅ Yes | Device name | Switch Core 1 |
| **ip_address** | ✅ Yes | Device IP address | 10.8.2.1 |

**Optional columns** (will use defaults if not provided):

| Column | Optional | Description | Example | Default |
|--------|----------|-------------|---------|---------|
| id | Optional | Device ID (for updates) | 123 | Auto |
| mac_address | Optional | MAC address | 00:1B:44:11:3A:B7 | Empty |
| barcode | Optional | Device barcode | SW-001 | Auto-generated |
| category | Optional | Device category | switches | switches |
| status | Optional | Device status | online | offline |
| branch | Optional | Branch name | UTHM Kampus Parit Raja | Current branch |
| location | Optional | Location name | Building A | None |
| brand | Optional | Hardware brand | Cisco | None |
| model | Optional | Hardware model | Catalyst 2960 | None |
| serial_number | Optional | Serial number | SN123456 | Empty |
| managed_by | Optional | Manager name/email | John Doe | None |
| building | Optional | Building name | Block A | Empty |
| sla_target | Optional | SLA target % | 99.9 | 99.9 |
| is_active | Optional | Active status | Yes/No/True/False/1/0 | Yes |

### Column Name Variations

The import accepts alternative column names:

- **name**: `device_name`, `device name`, `hostname`
- **ip_address**: `ip`, `ip address`, `ipaddress`
- **category**: `type`, `device_type`
- **status**: `device_status`
- **branch**: `branch_name`
- **location**: `location_name`

### Sample CSV Template

```csv
name,ip_address,category,status,location,brand,model,serial_number
Switch Core 1,10.8.2.1,switches,online,Building A,Cisco,Catalyst 2960,SN001
Switch Core 2,10.8.2.2,switches,online,Building A,Cisco,Catalyst 2960,SN002
WiFi AP Lobby,10.8.3.1,wifi,online,Building B,Aruba,AP-515,SN101
Server Web,10.8.4.1,servers,online,Data Center,Dell,PowerEdge R740,SN201
```

### Import Modes

#### Mode 1: Update Existing (Click OK)
- Updates devices that match by **IP address** or **ID**
- Creates new devices for non-matching rows
- Use this when you want to update existing device information

#### Mode 2: Skip Existing (Click Cancel)
- Only creates **new devices**
- Skips devices that already exist (by IP or ID)
- Use this when you only want to add new devices

### Import Validation

The import process validates:
- ✅ **IP Address**: Must be a valid IP format
- ✅ **Required Fields**: Name and IP address must not be empty
- ✅ **Category**: Must be one of: switches, servers, wifi, tas, cctv
- ✅ **Status**: Must be one of: online, offline, warning, offline_ack
- ✅ **File Size**: Maximum 10MB

### Import Results

After import, you'll see a summary:

```
Import completed!

✅ Imported: 50
🔄 Updated: 10
⏭️ Skipped: 5

⚠️ Errors:
Row 12: Invalid IP address '192.168.1'
Row 25: Device name cannot be empty
```

## Best Practices

### For Export
1. **Filter before export**: Use filters to export only the devices you need
2. **Backup regularly**: Export your devices periodically for backup
3. **Edit in Excel**: Open CSV in Excel/LibreOffice for easy editing

### For Import
1. **Test with small file**: Import a few devices first to verify format
2. **Backup first**: Export current devices before importing
3. **Check column names**: Ensure required columns are present
4. **Validate IPs**: Make sure all IP addresses are valid
5. **Review errors**: Check the error list after import

## Troubleshooting

### Import Fails
- **Check file format**: Must be CSV (.csv or .txt)
- **Check file size**: Maximum 10MB
- **Check column names**: Required columns must be present
- **Check IP addresses**: All IPs must be valid

### Import Skips Devices
- **Check IP addresses**: Devices with duplicate IPs are skipped
- **Check import mode**: "Skip Existing" mode skips all existing devices
- **Check required fields**: Rows with empty name or IP are skipped

### Export is Empty
- **Check filters**: Make sure filters match your devices
- **Check branch**: Ensure you're viewing the correct branch
- **Check active status**: Inactive devices might be filtered out

## Example Use Cases

### 1. Bulk Import New Devices
```csv
name,ip_address,category,location
New Switch 1,192.168.1.1,switches,Building A
New Switch 2,192.168.1.2,switches,Building A
New Server 1,192.168.2.1,servers,Data Center
```

### 2. Update Existing Devices
Include the `id` column to update specific devices:
```csv
id,name,ip_address,status
123,Switch Core 1 Updated,10.8.2.1,online
124,Switch Core 2 Updated,10.8.2.2,offline
```

### 3. Import with Full Details
```csv
name,ip_address,category,status,location,brand,model,serial_number,building,sla_target
Switch A,10.8.2.1,switches,online,Building A,Cisco,Catalyst 2960,SN001,Block A,99.9
Switch B,10.8.2.2,switches,online,Building B,Cisco,Catalyst 2960,SN002,Block B,99.5
```

## Technical Details

### File Requirements
- **Format**: CSV (Comma-Separated Values)
- **Encoding**: UTF-8 (with BOM for Excel compatibility)
- **Max Size**: 10MB
- **Line Endings**: Windows (CRLF) or Unix (LF)

### Supported Locations
- Locations are matched by **name** (case-insensitive)
- If location doesn't exist, device is created without location
- Location must exist in the same branch

### Supported Brands/Models
- Brands and models are **auto-created** if they don't exist
- Matched by **name** (case-insensitive)
- If brand/model doesn't exist, it's created automatically

### Duplicate Handling
- **IP Address**: Must be unique (duplicates are skipped)
- **Barcode**: Can be empty (auto-generated if not provided)
- **ID**: Used for updates if provided

## Support

If you encounter issues:
1. Check the import error messages
2. Verify your CSV format matches the template
3. Ensure all required columns are present
4. Check that IP addresses are valid

