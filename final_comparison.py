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
with open('switches_final_complete.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        ip = row['ip_address']
        name = row['device_name']
        new_devices[ip] = name

# Find differences
existing_ips = set(existing_devices.keys())
new_ips = set(new_devices.keys())

# Devices only in existing CSV
only_in_existing = existing_ips - new_ips

# Devices only in new HTML
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
print("FINAL COMPARISON RESULTS")
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
    print("Showing first 30 name changes:")
    for change in sorted(name_changes[:30], key=lambda x: tuple(map(int, x['ip'].split('.')))):
        print(f"  IP: {change['ip']}")
        print(f"    Old: {change['old_name']}")
        print(f"    New: {change['new_name']}")
        print()
    if len(name_changes) > 30:
        print(f"  ... and {len(name_changes) - 30} more")
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

# Write detailed report
with open('final_comparison_report.txt', 'w', encoding='utf-8') as f:
    f.write("FINAL SWITCHES COMPARISON REPORT\n")
    f.write("=" * 80 + "\n\n")
    
    f.write(f"NEW DEVICES IN HTML ({len(only_in_new)} devices):\n")
    f.write("-" * 80 + "\n")
    for ip in sorted(only_in_new, key=lambda x: tuple(map(int, x.split('.')))):
        f.write(f"{new_devices[ip]},{ip}\n")
    
    f.write(f"\n\nDEVICES ONLY IN EXISTING CSV ({len(only_in_existing)} devices):\n")
    f.write("-" * 80 + "\n")
    for ip in sorted(only_in_existing, key=lambda x: tuple(map(int, x.split('.')))):
        f.write(f"{existing_devices[ip]},{ip}\n")
    
    f.write(f"\n\nNAME CHANGES ({len(name_changes)} devices):\n")
    f.write("-" * 80 + "\n")
    for change in sorted(name_changes, key=lambda x: tuple(map(int, x['ip'].split('.')))):
        f.write(f"{change['ip']}\n")
        f.write(f"  Old: {change['old_name']}\n")
        f.write(f"  New: {change['new_name']}\n\n")

print("\nDetailed report saved to: final_comparison_report.txt")

