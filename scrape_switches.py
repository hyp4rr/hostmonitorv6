import re
import csv

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Pattern to find input buttons with device info
# Looking for: <input type=button ... value='Device Name Ping: IP' ...>
input_pattern = r'<input\s+type=button[^>]*value=[\'"]([^\'"]*)[\'"][^>]*>'

# Find all input buttons
input_matches = re.findall(input_pattern, html_content, re.IGNORECASE)

devices = []

for value in input_matches:
    # Pattern to extract IP: "Ping: 10.8.3.239" or "Ping:10.8.3.239"
    ip_pattern = r'Ping:\s*(\d+\.\d+\.\d+\.\d+)'
    
    # Extract device name (everything before "Ping:")
    if 'Ping:' in value:
        device_name = value.split('Ping:')[0].strip()
    else:
        device_name = value.strip()
    
    # Extract IP address
    ip_match = re.search(ip_pattern, value)
    if ip_match:
        ip_address = ip_match.group(1)
        
        if device_name and ip_address:
            devices.append({
                'device_name': device_name,
                'ip_address': ip_address
            })

# Also check for IPs in onclick attributes (some devices might have IPs there)
onclick_pattern = r'onclick=[\'"][^\'"]*Ping:\s*(\d+\.\d+\.\d+\.\d+)[^\'"]*[\'"]'
onclick_matches = re.findall(onclick_pattern, html_content, re.IGNORECASE)

# Find corresponding device names for onclick IPs
for ip in onclick_matches:
    # Find the input button that contains this onclick
    button_pattern = rf'<input[^>]*onclick=[\'"][^\'"]*Ping:\s*{re.escape(ip)}[^\'"]*[\'"][^>]*value=[\'"]([^\'"]*)[\'"]'
    button_match = re.search(button_pattern, html_content, re.IGNORECASE)
    
    if button_match:
        device_name = button_match.group(1).split('Ping:')[0].strip() if 'Ping:' in button_match.group(1) else button_match.group(1).strip()
        
        # Check if this IP is already in our list
        if not any(d['ip_address'] == ip for d in devices):
            devices.append({
                'device_name': device_name,
                'ip_address': ip
            })

# Remove duplicates based on IP address
seen_ips = set()
unique_devices = []
for device in devices:
    if device['ip_address'] not in seen_ips:
        seen_ips.add(device['ip_address'])
        unique_devices.append(device)

# Sort by IP address
unique_devices.sort(key=lambda x: tuple(map(int, x['ip_address'].split('.'))))

# Write to CSV
output_file = 'switches_extracted.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['device_name', 'ip_address'])
    writer.writeheader()
    writer.writerows(unique_devices)

print(f"Extracted {len(unique_devices)} devices")
print(f"Results saved to {output_file}")

# Display first 20 entries
print("\nFirst 20 entries:")
for i, device in enumerate(unique_devices[:20], 1):
    print(f"{i}. {device['device_name']} - {device['ip_address']}")
