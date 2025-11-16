import csv
from collections import defaultdict

# Read existing switches.csv
existing_devices = {}
with open('database/seeders/data/switches.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        ip = row['ip_address']
        name = row['name']
        existing_devices[ip] = name

# Read newly extracted switches
new_devices = {}
with open('switches_extracted_improved.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        ip = row['ip_address']
        name = row['device_name']
        new_devices[ip] = name

# Find differences
existing_ips = set(existing_devices.keys())
new_ips = set(new_devices.keys())

# Devices only in existing CSV (might be removed)
only_in_existing = existing_ips - new_ips

# Devices only in new HTML (new devices)
only_in_new = new_ips - existing_ips

# Devices in both but with different names
name_changes = []
for ip in existing_ips & new_ips:
    if existing_devices[ip] != new_devices[ip]:
        name_changes.append({
            'ip': ip,
            'old_name': existing_devices[ip],
            'new_name': new_devices[ip]
        })

# Print results
print("=" * 80)
print("COMPARISON RESULTS (IMPROVED)")
print("=" * 80)
print(f"\nExisting CSV: {len(existing_devices)} devices")
print(f"New HTML: {len(new_devices)} devices")
print(f"Common IPs: {len(existing_ips & new_ips)} devices")

print("\n" + "=" * 80)
print(f"NEW DEVICES IN HTML (Not in existing CSV) - {len(only_in_new)} devices")
print("=" * 80)
if only_in_new:
    for ip in sorted(only_in_new, key=lambda x: tuple(map(int, x.split('.')))):
        print(f"  {new_devices[ip]:<60} {ip}")
else:
    print("  None")

print("\n" + "=" * 80)
print(f"DEVICES ONLY IN EXISTING CSV (Not in HTML) - {len(only_in_existing)} devices")
print("=" * 80)
if only_in_existing:
    for ip in sorted(only_in_existing, key=lambda x: tuple(map(int, x.split('.')))):
        print(f"  {existing_devices[ip]:<60} {ip}")
else:
    print("  None")

print("\n" + "=" * 80)
print(f"NAME CHANGES (Same IP, Different Name) - {len(name_changes)} devices")
print("=" * 80)
if name_changes:
    for change in sorted(name_changes[:20], key=lambda x: tuple(map(int, x['ip'].split('.')))):
        print(f"  IP: {change['ip']}")
        print(f"    Old: {change['old_name']}")
        print(f"    New: {change['new_name']}")
        print()
    if len(name_changes) > 20:
        print(f"  ... and {len(name_changes) - 20} more")
else:
    print("  None")

# Create summary report
print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total devices in existing CSV: {len(existing_devices)}")
print(f"Total devices in new HTML: {len(new_devices)}")
print(f"New devices to add: {len(only_in_new)}")
print(f"Devices to remove (not in HTML): {len(only_in_existing)}")
print(f"Name changes: {len(name_changes)}")
print(f"Unchanged devices: {len(existing_ips & new_ips) - len(name_changes)}")

