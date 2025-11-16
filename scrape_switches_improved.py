import re
import csv

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Pattern to find all input buttons
input_pattern = r'<input\s+type=button[^>]*>'

# Find all input buttons
input_matches = re.findall(input_pattern, html_content, re.IGNORECASE)

devices = []
ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'

for button_html in input_matches:
    # Extract value attribute
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title attribute
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    # Extract onclick attribute (this often has the IP)
    onclick_match = re.search(r"onclick=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    onclick = onclick_match.group(1) if onclick_match else ''
    
    # Try to find IP address in different places
    ip_address = None
    
    # First, try to find IP in value (with or without "Ping:")
    if value:
        # Check for "Ping: IP" pattern
        ping_match = re.search(r'Ping:\s*' + ip_pattern, value, re.IGNORECASE)
        if ping_match:
            ip_address = ping_match.group(1)
            # Device name is everything before "Ping:"
            device_name = value.split('Ping:')[0].strip()
        else:
            # Check if IP is at the end of value (like "A1-DTMI 10.8.3.6")
            ip_at_end = re.search(r'\s+' + ip_pattern + r'$', value)
            if ip_at_end:
                ip_address = ip_at_end.group(1)
                device_name = value.replace(ip_address, '').strip()
            else:
                device_name = value.strip()
    
    # If no IP found in value, try title
    if not ip_address and title:
        ping_match = re.search(r'Ping:\s*' + ip_pattern, title, re.IGNORECASE)
        if ping_match:
            ip_address = ping_match.group(1)
            if not device_name:
                device_name = title.split('Ping:')[0].strip()
    
    # If still no IP, try onclick (this is often where the IP is)
    if not ip_address and onclick:
        # Look for "Ping IP" or "Ping: IP" in onclick
        ping_match = re.search(r'Ping[:\s]+' + ip_pattern, onclick, re.IGNORECASE)
        if ping_match:
            ip_address = ping_match.group(1)
            # Try to get device name from value or title
            if not device_name:
                if value:
                    device_name = value.split('Ping:')[0].split('Ping')[0].strip()
                elif title:
                    device_name = title.split('Ping:')[0].split('Ping')[0].strip()
    
    # Clean up device name - remove HTML entities
    if device_name:
        device_name = device_name.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
        # Remove trailing "Ping:" if any
        device_name = re.sub(r'\s+Ping:?\s*$', '', device_name, flags=re.IGNORECASE)
        device_name = device_name.strip()
    
    # Only add if we have both name and IP
    if device_name and ip_address:
        devices.append({
            'device_name': device_name,
            'ip_address': ip_address
        })

# Remove duplicates based on IP address (keep first occurrence)
seen_ips = set()
unique_devices = []
for device in devices:
    if device['ip_address'] not in seen_ips:
        seen_ips.add(device['ip_address'])
        unique_devices.append(device)

# Sort by IP address
unique_devices.sort(key=lambda x: tuple(map(int, x['ip_address'].split('.'))))

# Write to CSV
output_file = 'switches_extracted_improved.csv'
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

