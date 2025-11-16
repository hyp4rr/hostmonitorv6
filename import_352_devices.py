import csv
import re

# Read the extracted devices
extracted_devices = []
with open('all_355_devices_complete.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        extracted_devices.append({
            'name': row['device_name'],
            'ip_address': row['ip_address']
        })

# Clean up device names - remove "Ping:" suffixes and extra formatting
ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'

for device in extracted_devices:
    name = device['name']
    
    # Remove "Ping:" or "Ping" at the end
    name = re.sub(r'\s+Ping:?\s*$', '', name, flags=re.IGNORECASE)
    
    # Remove trailing IP addresses
    name = re.sub(r'\s+' + ip_pattern + r'$', '', name)
    
    # Remove HTML entities
    name = name.replace('&amp;', '&')
    name = name.replace('&lt;', '<')
    name = name.replace('&gt;', '>')
    
    # Clean up whitespace
    name = name.strip()
    
    # Remove trailing dots/ellipsis
    name = re.sub(r'\.{2,}$', '', name)
    name = name.rstrip('.')
    
    device['name'] = name

# Sort by IP address
extracted_devices.sort(key=lambda x: tuple(map(int, x['ip_address'].split('.'))))

# Write to CSV in the correct format
output_file = 'database/seeders/data/switches_updated.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['name', 'ip_address', 'category', 'status', 'location', 'brand'])
    writer.writeheader()
    
    for device in extracted_devices:
        writer.writerow({
            'name': device['name'],
            'ip_address': device['ip_address'],
            'category': 'switches',
            'status': 'unknown',
            'location': '',
            'brand': ''
        })

print("=" * 80)
print("IMPORT SUMMARY")
print("=" * 80)
print(f"Total devices imported: {len(extracted_devices)}")
print(f"Output file: {output_file}")
print()
print("First 10 devices:")
for i, device in enumerate(extracted_devices[:10], 1):
    print(f"  {i:3}. {device['name']:<50} {device['ip_address']}")
print()
print(f"... and {len(extracted_devices) - 10} more devices")
print()
print(f"All {len(extracted_devices)} devices have been formatted and saved to:")
print(f"  {output_file}")
print()
print("The file is ready to replace your existing switches.csv")

