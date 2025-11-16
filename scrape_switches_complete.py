import re
import csv

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Pattern to find all input buttons with onclick showInfo (these are the device buttons)
# We'll extract each button's full HTML
button_pattern = r'<input\s+type=button[^>]*onclick=["\']javascript:showInfo[^>]*>'

# Find all device buttons
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

devices = []
ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'

print(f"Found {len(button_matches)} device buttons")

for button_html in button_matches:
    # Extract value attribute
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title attribute
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    # Extract onclick attribute - this is critical
    onclick_match = re.search(r"onclick=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    onclick = onclick_match.group(1) if onclick_match else ''
    
    # Extract device name and IP from onclick showInfo
    # Format: showInfo('DeviceName','DeviceName<br>...<br>Ping: IP<br>...')
    showinfo_match = re.search(r"showInfo\(['\"]([^'\"]*)['\"],\s*['\"]([^'\"]*)['\"]", onclick, re.IGNORECASE)
    
    device_name = None
    ip_address = None
    
    if showinfo_match:
        # First parameter is usually the device name
        device_name = showinfo_match.group(1)
        # Second parameter contains the full info including IP
        info_content = showinfo_match.group(2)
        
        # Look for IP in the info content (usually after "Ping: " or "Ping ")
        ip_match = re.search(r'Ping[:\s]+' + ip_pattern, info_content, re.IGNORECASE)
        if ip_match:
            ip_address = ip_match.group(1)
    
    # Fallback: if we didn't get name from showInfo, use value or title
    if not device_name:
        if value:
            device_name = value
        elif title:
            device_name = title
    
    # Fallback: if we didn't get IP from onclick, try value/title
    if not ip_address:
        # Try value
        if value:
            ping_match = re.search(r'Ping:\s*' + ip_pattern, value, re.IGNORECASE)
            if ping_match:
                ip_address = ping_match.group(1)
                device_name = value.split('Ping:')[0].strip()
            else:
                # Check if IP is at end of value
                ip_at_end = re.search(r'\s+' + ip_pattern + r'$', value)
                if ip_at_end:
                    ip_address = ip_at_end.group(1)
                    device_name = value.replace(ip_address, '').strip()
        
        # Try title if still no IP
        if not ip_address and title:
            ping_match = re.search(r'Ping:\s*' + ip_pattern, title, re.IGNORECASE)
            if ping_match:
                ip_address = ping_match.group(1)
                if not device_name:
                    device_name = title.split('Ping:')[0].strip()
    
    # Clean up device name
    if device_name:
        # Remove HTML entities
        device_name = device_name.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
        # Remove trailing "Ping:" or "Ping" if any
        device_name = re.sub(r'\s+Ping:?\s*$', '', device_name, flags=re.IGNORECASE)
        # Remove any trailing IP address
        device_name = re.sub(r'\s+' + ip_pattern + r'$', '', device_name)
        device_name = device_name.strip()
    
    # Only add if we have both name and IP
    if device_name and ip_address:
        devices.append({
            'device_name': device_name,
            'ip_address': ip_address
        })
    else:
        # Debug: print what we're missing
        if not device_name:
            print(f"Missing name: {button_html[:100]}")
        if not ip_address:
            print(f"Missing IP: {button_html[:100]}")

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
output_file = 'switches_extracted_complete.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['device_name', 'ip_address'])
    writer.writeheader()
    writer.writerows(unique_devices)

print(f"\nExtracted {len(unique_devices)} unique devices")
print(f"Results saved to {output_file}")

# Display first 20 entries
print("\nFirst 20 entries:")
for i, device in enumerate(unique_devices[:20], 1):
    print(f"{i}. {device['device_name']} - {device['ip_address']}")

