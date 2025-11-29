# CSV Import - Minimum Requirements

## ✅ Minimum Required Columns

You only need **2 columns** to import devices:

```csv
name,ip_address
Switch 1,10.8.2.1
Switch 2,10.8.2.2
Server 1,10.8.3.1
```

That's it! Everything else is optional and will use sensible defaults.

## Default Values

If you don't provide optional columns, the system uses these defaults:

| Column | Default Value |
|--------|---------------|
| **category** | `switches` |
| **status** | `offline` |
| **is_active** | `Yes` (active) |
| **sla_target** | `99.9` |
| **branch** | Current branch |
| **location** | None |
| **brand** | None |
| **model** | None |
| **mac_address** | Empty |
| **barcode** | Auto-generated |
| **serial_number** | Empty |
| **building** | Empty |

## Simple Example

**Minimum CSV (just name and IP):**
```csv
name,ip_address
My Switch,192.168.1.1
My Server,192.168.1.2
```

This will create:
- 2 devices with default category "switches"
- Status "offline"
- Active = Yes
- SLA Target = 99.9%
- All other fields empty/default

## Where to Find Your Devices

Your devices are located in:

**Configuration Page → Devices Tab**

1. Go to **Configuration** (gear icon in sidebar)
2. Click the **"Devices"** tab
3. Your devices will be listed in a table

You can also find devices in:
- **Monitor → Devices** page (main devices view)
- **Monitor → Dashboard** (device counts)

## Quick Import Example

**Step 1: Create a simple CSV file**
```csv
name,ip_address
Switch A,10.8.2.1
Switch B,10.8.2.2
WiFi AP 1,10.8.3.1
```

**Step 2: Import**
1. Go to Configuration → Devices
2. Click "Import CSV"
3. Select your file
4. Choose import mode (OK = update existing, Cancel = skip existing)
5. Done!

The system will automatically:
- ✅ Create devices with name and IP
- ✅ Set category to "switches" (default)
- ✅ Set status to "offline" (default)
- ✅ Assign to current branch
- ✅ Make devices active

## Adding Optional Fields Later

You can always:
1. Export your devices to CSV
2. Edit the CSV in Excel
3. Import again with "Update Existing" mode

This lets you add details like location, brand, model, etc. later!

