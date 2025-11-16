import re
import csv

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = r'<input\s+type=button[^>]*>'
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

devices = []
buttons_without_ip = []
ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'

print(f"Found {len(button_matches)} total input buttons\n")

for i, button_html in enumerate(button_matches, 1):
    # Extract value
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    # Extract title
    title_match = re.search(r"title=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    title = title_match.group(1) if title_match else ''
    
    # Extract onclick
    onclick_match = re.search(r'onclick="([^"]*)"', button_html, re.IGNORECASE | re.DOTALL)
    onclick = onclick_match.group(1) if onclick_match else ''
    
    # Extract class (to identify UI buttons)
    class_match = re.search(r"class=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    button_class = class_match.group(1) if class_match else ''
    
    device_name = None
    ip_address = None
    
    # Try to extract from onclick showInfo
    if onclick and 'showInfo' in onclick:
        showinfo_match = re.search(r"showInfo\('([^']*)',\s*'([^']*)'\)", onclick, re.IGNORECASE | re.DOTALL)
        if showinfo_match:
            device_name = showinfo_match.group(1)
            info_content = showinfo_match.group(2)
            ip_match = re.search(r'Ping[:\s]+' + ip_pattern, info_content, re.IGNORECASE)
            if ip_match:
                ip_address = ip_match.group(1)
    
    # Fallback: use value/title
    if not device_name:
        device_name = value or title
    
    if not ip_address:
        # Try value
        if value:
            ping_match = re.search(r'Ping:\s*' + ip_pattern, value, re.IGNORECASE)
            if ping_match:
                ip_address = ping_match.group(1)
                device_name = value.split('Ping:')[0].strip()
            else:
                ip_at_end = re.search(r'\s+' + ip_pattern + r'$', value)
                if ip_at_end:
                    ip_address = ip_at_end.group(1)
                    device_name = value.replace(ip_address, '').strip()
        
        # Try title
        if not ip_address and title:
            ping_match = re.search(r'Ping:\s*' + ip_pattern, title, re.IGNORECASE)
            if ping_match:
                ip_address = ping_match.group(1)
                if not device_name:
                    device_name = title.split('Ping:')[0].strip()
        
        # Try onclick more thoroughly - look for any IP pattern
        if not ip_address and onclick:
            # Look for IP anywhere in onclick
            ip_match = re.search(ip_pattern, onclick)
            if ip_match:
                ip_address = ip_match.group(1)
    
    # Clean up device name
    if device_name:
        device_name = device_name.replace('&amp;', '&')
        device_name = re.sub(r'\s+Ping:?\s*$', '', device_name, flags=re.IGNORECASE)
        device_name = re.sub(r'\s+' + ip_pattern + r'$', '', device_name)
        device_name = device_name.strip()
    
    if device_name and ip_address:
        devices.append({
            'device_name': device_name,
            'ip_address': ip_address
        })
    else:
        # This button doesn't have an IP - analyze it
        buttons_without_ip.append({
            'index': i,
            'value': value[:80],
            'title': title[:80],
            'class': button_class,
            'has_showInfo': 'showInfo' in onclick if onclick else False,
            'onclick_preview': onclick[:100] if onclick else '',
            'full_html': button_html[:150]
        })

# Remove duplicates based on IP
seen_ips = set()
unique_devices = []
for device in devices:
    if device['ip_address'] not in seen_ips:
        seen_ips.add(device['ip_address'])
        unique_devices.append(device)

# Sort by IP
unique_devices.sort(key=lambda x: tuple(map(int, x['ip_address'].split('.'))))

# Write devices to CSV
output_file = 'switches_all_extracted.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['device_name', 'ip_address'])
    writer.writeheader()
    writer.writerows(unique_devices)

print("=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total buttons found: {len(button_matches)}")
print(f"Devices with IPs extracted: {len(unique_devices)}")
print(f"Buttons without IPs: {len(buttons_without_ip)}")
print(f"\nResults saved to: {output_file}")

# Analyze buttons without IPs
print("\n" + "=" * 80)
print("BUTTONS WITHOUT IP ADDRESSES (31 buttons)")
print("=" * 80)

# Categorize them
ui_buttons = []
potential_devices = []

for btn in buttons_without_ip:
    # Check if it's a UI button (stats buttons at top)
    if btn['value'].strip() == ' ' or btn['value'].strip() == '':
        ui_buttons.append(btn)
    elif btn['has_showInfo']:
        # Has showInfo but no IP - might be a device
        potential_devices.append(btn)
    else:
        # No showInfo - likely UI
        ui_buttons.append(btn)

print(f"\nUI Buttons (likely not devices): {len(ui_buttons)}")
for btn in ui_buttons[:10]:
    print(f"  - Value: '{btn['value']}' | Class: {btn['class']}")

print(f"\nPotential Devices (have showInfo but no IP found): {len(potential_devices)}")
for btn in potential_devices:
    print(f"\n  {btn['index']}. {btn['value']}")
    print(f"     Title: {btn['title']}")
    print(f"     Class: {btn['class']}")
    print(f"     Onclick preview: {btn['onclick_preview'][:80]}...")

# Write detailed report
with open('buttons_analysis.txt', 'w', encoding='utf-8') as f:
    f.write("ANALYSIS OF ALL 355 BUTTONS\n")
    f.write("=" * 80 + "\n\n")
    f.write(f"Total buttons: {len(button_matches)}\n")
    f.write(f"Devices with IPs: {len(unique_devices)}\n")
    f.write(f"Buttons without IPs: {len(buttons_without_ip)}\n\n")
    f.write("\nBUTTONS WITHOUT IPs:\n")
    f.write("-" * 80 + "\n")
    for btn in buttons_without_ip:
        f.write(f"\nButton #{btn['index']}:\n")
        f.write(f"  Value: {btn['value']}\n")
        f.write(f"  Title: {btn['title']}\n")
        f.write(f"  Class: {btn['class']}\n")
        f.write(f"  Has showInfo: {btn['has_showInfo']}\n")
        f.write(f"  HTML: {btn['full_html']}\n")

print(f"\nDetailed analysis saved to: buttons_analysis.txt")

