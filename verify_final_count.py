import csv

# The 14 devices we found
found_14 = {
    'B4-Surau': '10.8.3.43',
    'C10-Makmal FKEE': '10.8.3.36',
    'C13-Makmal Bahasa Disti': '10.8.3.22',
    'C15-1stFloor': '10.8.3.152',
    'C16-1stfloor': '10.8.3.151',
    'C17-1stfloor': '10.8.3.150',
    'C2-CCTV Rack Server': '10.8.3.16',
    'C2-Makmal Bahasa': '10.8.3.41',
    'C2-Makmal CAD FKEE': '10.8.3.40',
    'C7-Kabin': '10.8.3.26',
    'C8-Bilik Pensyarah': '10.8.3.25',
    'C9-Bilik Pensyarah': '10.8.3.37',
    'G1-A-Server UCiTV': '10.8.3.175',
    'G2-G Makmal CADCAM2': '10.8.3.177'
}

# Read extracted devices
extracted_devices = {}
with open('switches_all_355_final.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        ip = row['ip_address']
        name = row['device_name']
        extracted_devices[ip] = name

print("=" * 80)
print("VERIFICATION: Are the 14 devices in our extracted list?")
print("=" * 80)
print()

missing = []
found = []

for device_name, ip in found_14.items():
    if ip in extracted_devices:
        found.append((device_name, ip, extracted_devices[ip]))
    else:
        missing.append((device_name, ip))

print(f"Found in extracted list: {len(found)}")
print(f"Missing from extracted list: {len(missing)}")
print()

if found:
    print("Devices already in extracted list:")
    for device_name, ip, extracted_name in found:
        print(f"  {device_name:<40} {ip:<15} (extracted as: {extracted_name[:50]})")

if missing:
    print("\nDevices MISSING from extracted list:")
    for device_name, ip in missing:
        print(f"  {device_name:<40} {ip}")

print("\n" + "=" * 80)
print("FINAL SUMMARY")
print("=" * 80)
print(f"Total buttons in HTML: 355")
print(f"Devices successfully extracted: {len(extracted_devices)}")
print(f"14 devices checked: All have IPs")
print(f"Missing from extraction: {len(missing)}")
print(f"\nActual total devices with IPs: {len(extracted_devices) + len(missing)}")

