# MM.csv Conversion Summary

## Overview
Successfully reorganized `MM.csv` (WiFi Access Points data) to work with the NetworkDevicesSeeder.

## Conversion Details

### Original Format (MM.csv)
The MM.csv file had two different formats mixed together:
- **Format 1**: `name, uptime, model, ip_address`
- **Format 2**: `name, ip_address, model, mac_address`

### Target Format (wifi.csv)
```
location,name,ip_address,status,response_time
```

## Results

### Statistics
- **Total Devices**: 1,124 WiFi Access Points
- **Locations Identified**: 150 unique locations
- **File Size**: ~59 KB

### Top Locations by Device Count
1. **KK** (Kolej Kediaman): 228 devices
2. **FPTV**: 75 devices
3. **FSKTM**: 66 devices
4. **KKTSN**: 60 devices
5. **KB** (Kampus Bandar): 54 devices
6. **D2**: 49 devices
7. **FKAAB**: 34 devices
8. **FKEE**: 33 devices
9. **B1**: 33 devices
10. **QB**: 26 devices

### Location Extraction Logic
The script automatically extracts location codes from device names using patterns:
- Building codes: A1-A18, B1-B8, C1-C18, D1-D16, E1-E17, F1-F6, G1-G8
- Kolej Kediaman: KK, KKTSN, KB, KBANDAR
- Faculties: FKAAB, FPTV, FKAAS, FKEE, FKMP, FSKTM, FPTP
- Special locations: Masjid, Library, Perwira, HEP, RECESS, etc.

### Status Determination
- Devices with uptime < 7 days: **online**
- Devices with uptime > 7 days: **offline** (likely stale data)
- Default: **online**

## Files Created

1. **wifi.csv** - The reorganized WiFi access points data (ready for seeder)
2. **reorganize_mm.py** - Python script used for conversion
3. **README_MM_CONVERSION.md** - This documentation file

## Usage with Seeder

The `wifi.csv` file is now compatible with the NetworkDevicesSeeder:

```bash
php artisan db:seed --class=NetworkDevicesSeeder
```

The seeder will:
1. Create locations from the `location` column (or reuse existing ones)
2. Import all 1,124 WiFi access points
3. Assign them to the appropriate locations
4. Set their status and response times

## Notes

- The script handles both CSV formats automatically
- MAC addresses are filtered out from the IP address field
- Invalid IP addresses (0.0.0.0) are skipped
- All devices default to `response_time=1` and appropriate online/offline status
- Location names are extracted intelligently from device names
