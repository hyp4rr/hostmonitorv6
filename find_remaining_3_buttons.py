import re
import csv

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = r'<input\s+type=button[^>]*>'
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

# Read extracted devices to get their IPs
extracted_ips = set()
with open('switches_all_355_final.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        extracted_ips.add(row['ip_address'])

# The 13 missing devices we found
missing_13_ips = {
    '10.8.3.43',  # B4-Surau
    '10.8.3.36',  # C10-Makmal FKEE
    '10.8.3.22',  # C13-Makmal Bahasa Disti
    '10.8.3.152', # C15-1stFloor
    '10.8.3.151', # C16-1stfloor
    '10.8.3.150', # C17-1stfloor
    '10.8.3.41',  # C2-Makmal Bahasa
    '10.8.3.40',  # C2-Makmal CAD FKEE
    '10.8.3.26',  # C7-Kabin
    '10.8.3.25',  # C8-Bilik Pensyarah
    '10.8.3.37',  # C9-Bilik Pensyarah
    '10.8.3.175', # G1-A-Server UCiTV
    '10.8.3.177'  # G2-G Makmal CADCAM2
}

all_known_ips = extracted_ips | missing_13_ips

ip_pattern = r'(\d+\.\d+\.\d+\.\d+)'
remaining_buttons = []

print("=" * 80)
print("FINDING THE REMAINING 3 BUTTONS")
print("=" * 80)
print()

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
    
    # Extract class
    class_match = re.search(r"class=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    button_class = class_match.group(1) if class_match else ''
    
    # Find IP in value, title, or onclick
    ip_address = None
    
    # Check value
    if value:
        ip_match = re.search(ip_pattern, value)
        if ip_match:
            ip_address = ip_match.group(1)
    
    # Check title
    if not ip_address and title:
        ip_match = re.search(ip_pattern, title)
        if ip_match:
            ip_address = ip_match.group(1)
    
    # Check onclick
    if not ip_address and onclick:
        ip_match = re.search(r'Ping[:\s]+' + ip_pattern, onclick, re.IGNORECASE)
        if ip_match:
            ip_address = ip_match.group(1)
        else:
            # Try any IP in onclick
            ip_match = re.search(ip_pattern, onclick)
            if ip_match:
                ip_address = ip_match.group(1)
    
    # If this button has an IP that we know about, skip it
    if ip_address and ip_address in all_known_ips:
        continue
    
    # This is a remaining button
    device_name = value or title or 'Unknown'
    remaining_buttons.append({
        'index': i,
        'device_name': device_name,
        'value': value,
        'title': title,
        'class': button_class,
        'ip': ip_address,
        'has_showInfo': 'showInfo' in onclick if onclick else False,
        'onclick_preview': onclick[:200] if onclick else 'No onclick',
        'full_html': button_html[:200]
    })

print(f"Total buttons: {len(button_matches)}")
print(f"Known devices with IPs: {len(all_known_ips)}")
print(f"Remaining buttons: {len(remaining_buttons)}")
print()

if remaining_buttons:
    print("=" * 80)
    print("THE REMAINING BUTTONS:")
    print("=" * 80)
    for btn in remaining_buttons:
        print(f"\nButton #{btn['index']}:")
        print(f"  Device Name: {btn['device_name']}")
        print(f"  Value: '{btn['value']}'")
        print(f"  Title: '{btn['title']}'")
        print(f"  Class: {btn['class']}")
        print(f"  IP Address: {btn['ip'] if btn['ip'] else 'NO IP FOUND'}")
        print(f"  Has showInfo: {btn['has_showInfo']}")
        if btn['onclick_preview']:
            print(f"  Onclick: {btn['onclick_preview'][:150]}...")
        print(f"  HTML: {btn['full_html']}")
else:
    print("No remaining buttons found - all accounted for!")

# Write to file
with open('remaining_3_buttons.txt', 'w', encoding='utf-8') as f:
    f.write("REMAINING 3 BUTTONS ANALYSIS\n")
    f.write("=" * 80 + "\n\n")
    f.write(f"Total buttons: {len(button_matches)}\n")
    f.write(f"Known devices: {len(all_known_ips)}\n")
    f.write(f"Remaining: {len(remaining_buttons)}\n\n")
    
    for btn in remaining_buttons:
        f.write(f"\nButton #{btn['index']}:\n")
        f.write(f"  Device Name: {btn['device_name']}\n")
        f.write(f"  Value: {btn['value']}\n")
        f.write(f"  Title: {btn['title']}\n")
        f.write(f"  Class: {btn['class']}\n")
        f.write(f"  IP: {btn['ip'] if btn['ip'] else 'NO IP'}\n")
        f.write(f"  Has showInfo: {btn['has_showInfo']}\n")
        f.write(f"  Onclick: {btn['onclick_preview']}\n")
        f.write(f"  HTML: {btn['full_html']}\n")

print(f"\nDetailed analysis saved to: remaining_3_buttons.txt")

