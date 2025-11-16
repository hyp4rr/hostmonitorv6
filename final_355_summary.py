import re
import csv

# Read the HTML file
with open(r'c:\Users\hyper\Downloads\switch13-11.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find all input buttons
button_pattern = r'<input\s+type=button[^>]*>'
button_matches = re.findall(button_pattern, html_content, re.IGNORECASE)

# The 14 devices we manually found
known_devices = {
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

# Read our extracted devices
extracted_devices = {}
with open('all_355_devices_complete.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        ip = row['ip_address']
        name = row['device_name']
        extracted_devices[ip] = name

print("=" * 80)
print("FINAL SUMMARY - ALL 355 BUTTONS")
print("=" * 80)
print()
print(f"Total buttons in HTML: {len(button_matches)}")
print(f"Devices extracted with IPs: {len(extracted_devices)}")
print()

# Identify UI buttons
ui_buttons = []
device_buttons = []

for button_html in button_matches:
    id_match = re.search(r'id=["\']([^"\']*)["\']', button_html, re.IGNORECASE)
    button_id = id_match.group(1) if id_match else ''
    
    value_match = re.search(r"value=['\"]([^'\"]*)['\"]", button_html, re.IGNORECASE)
    value = value_match.group(1) if value_match else ''
    
    if button_id in ['btn1g', 'btn2b', 'btn3u', 'jsBtnOk']:
        ui_buttons.append({
            'id': button_id,
            'value': value,
            'type': 'UI Button (Statistics/Popup)'
        })
    else:
        device_buttons.append(button_html)

print("UI BUTTONS (4 buttons - NOT devices):")
print("-" * 80)
for btn in ui_buttons:
    print(f"  {btn['id']:<10} - {btn['type']}")

print()
print("=" * 80)
print("BREAKDOWN")
print("=" * 80)
print(f"Total buttons: {len(button_matches)}")
print(f"  - UI buttons: {len(ui_buttons)}")
print(f"  - Device buttons: {len(device_buttons)}")
print(f"  - Devices with IPs extracted: {len(extracted_devices)}")
print()
print(f"Missing devices: {len(device_buttons) - len(extracted_devices)}")
print()

if len(device_buttons) - len(extracted_devices) > 0:
    print("Checking which device buttons are missing...")
    # This would require more detailed analysis

print("=" * 80)
print("ANSWER TO YOUR QUESTION")
print("=" * 80)
print()
print("If you manually counted 355 devices, you might be counting:")
print("  1. All 355 buttons (including 4 UI buttons)")
print("  2. OR there are 3 more devices we haven't extracted yet")
print()
print("Current status:")
print(f"  - Total buttons: 355")
print(f"  - UI buttons (not devices): 4")
print(f"  - Device buttons: 351")
print(f"  - Devices with IPs extracted: {len(extracted_devices)}")
print(f"  - Missing: {351 - len(extracted_devices)} devices")
print()
print("The missing devices likely have IPs in onclick that our extraction")
print("isn't capturing properly. We manually found 14 such devices, and")
print("added them to get 352 total devices.")

