#!/usr/bin/env python3
"""
Final Clean Switch Data Scraper
Extracts and cleans switch names and IP addresses from Switch.html file
"""

import re
import json
from datetime import datetime

def clean_name(name):
    """Clean switch name by removing HTML artifacts and standardizing"""
    
    if not name:
        return ""
    
    # Remove HTML entities
    name = name.replace('&amp;', '&')
    
    # Remove HTML tags and artifacts
    name = re.sub(r'<[^>]*>', '', name)
    name = re.sub(r'<br>', '', name)
    name = re.sub(r'&nbsp;', ' ', name)
    name = re.sub(r'&quot;', '"', name)
    
    # Remove everything after <br> or <br/> tags
    name = re.sub(r'<br[^>]*>.*$', '', name, flags=re.IGNORECASE)
    
    # Remove HTML comments and artifacts
    name = re.sub(r'<!--.*?-->', '', name)
    name = re.sub(r'&[a-zA-Z]+;', '', name)
    
    # Remove multiple spaces and trim
    name = re.sub(r'\s+', ' ', name).strip()
    
    # Remove trailing artifacts like <br> followed by any content
    name = re.sub(r'\s*<.*$', '', name)
    
    # Remove any remaining HTML-like content
    name = re.sub(r'<.*?>', '', name)
    
    return name.strip()

def parse_switch_data(html_file_path):
    """Parse switch data from the HTML file"""
    
    # Read the HTML file
    with open(html_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    switches = {}
    
    # Pattern 1: Extract from onclick attribute (most reliable)
    pattern1 = r"onclick=\"javascript:showInfo\([^,]*,'([^']*Ping:\s*([^'\"]+))[^']*'\)\""
    matches1 = re.findall(pattern1, content)
    
    for match in matches1:
        onclick_text = match[0]
        ip_address = match[1]
        
        # Extract name from onclick text (everything before "Ping:")
        name = clean_name(onclick_text.split(' Ping:')[0].strip())
        
        # Skip if no IP or name
        if not ip_address or ip_address == '' or not name:
            continue
            
        # Use IP as key to avoid duplicates
        if ip_address not in switches:
            switches[ip_address] = {
                'name': name,
                'ip_address': ip_address.strip(),
                'category': 'switch',
                'status': 'unknown',
                'location': '',
                'brand': '',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
    
    # Pattern 2: Extract from value attribute (complete IPs)
    pattern2 = r"<input[^>]*value=['\"]([^'\"]*Ping:\s*([^'\"]+))['\"][^>]*>"
    matches2 = re.findall(pattern2, content)
    
    for match in matches2:
        full_value = match[0]
        ip_address = match[1]
        
        # Extract name (everything before "Ping:")
        name = clean_name(full_value.split(' Ping:')[0].strip())
        
        # Skip if no IP, incomplete IP, or no name
        if not ip_address or ip_address == '' or '...' in ip_address or not name:
            continue
            
        # Use IP as key to avoid duplicates
        if ip_address not in switches:
            switches[ip_address] = {
                'name': name,
                'ip_address': ip_address.strip(),
                'category': 'switch',
                'status': 'unknown',
                'location': '',
                'brand': '',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
    
    # Pattern 3: Extract from title attribute for truncated values
    pattern3 = r"title=\"([^\"]*Ping:\s*([^\"]+))\""
    matches3 = re.findall(pattern3, content)
    
    for match in matches3:
        title_text = match[0]
        ip_address = match[1]
        
        # Extract name from title text (everything before "Ping:")
        name = clean_name(title_text.split(' Ping:')[0].strip())
        
        # Skip if no IP or already have it
        if not ip_address or ip_address == '' or ip_address in switches:
            continue
            
        # Use IP as key to avoid duplicates
        switches[ip_address] = {
            'name': name,
            'ip_address': ip_address.strip(),
            'category': 'switch',
            'status': 'unknown',
            'location': '',
            'brand': '',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
    
    # Convert to list and sort
    switch_list = list(switches.values())
    switch_list.sort(key=lambda x: (x['name'], x['ip_address']))
    
    return switch_list

def main():
    """Main function to parse and save switch data"""
    
    input_file = 'database/seeders/data/Switch.html'
    output_file = 'database/seeders/data/switches.json'
    
    try:
        # Parse the switch data
        switches = parse_switch_data(input_file)
        
        # Save to JSON file
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(switches, file, indent=2, ensure_ascii=False)
        
        # Print summary
        print(f"✅ Successfully parsed {len(switches)} unique switches from {input_file}")
        print(f"📁 Data saved to {output_file}")
        print("\n📊 Summary:")
        print(f"   Total unique switches: {len(switches)}")
        
        # Count by building
        buildings = {}
        for switch in switches:
            building = switch['name'][0] if switch['name'] and switch['name'][0].isalpha() else 'Other'
            buildings[building] = buildings.get(building, 0) + 1
        
        print(f"\n🏢 Distribution by building:")
        for building in sorted(buildings.keys()):
            print(f"   Building {building}: {buildings[building]} switches")
        
        # Show first few examples
        print("\n🔍 Sample data:")
        for i, switch in enumerate(switches[:10]):
            print(f"   {i+1}. {switch['name']} -> {switch['ip_address']}")
        
        if len(switches) > 10:
            print(f"   ... and {len(switches) - 10} more switches")
            
        # Create CSV format as well
        csv_file = 'database/seeders/data/switches.csv'
        with open(csv_file, 'w', encoding='utf-8') as file:
            file.write('name,ip_address,category,status,location,brand\n')
            for switch in switches:
                # Escape commas in names for CSV
                safe_name = switch['name'].replace(',', ';')
                file.write(f"{safe_name},{switch['ip_address']},{switch['category']},{switch['status']},{switch['location']},{switch['brand']}\n")
        
        print(f"\n📊 CSV also saved to {csv_file}")
        
        # Check for any incomplete IPs
        incomplete_ips = [s for s in switches if '...' in s['ip_address']]
        if incomplete_ips:
            print(f"\n⚠️  Warning: {len(incomplete_ips)} switches still have incomplete IPs")
        else:
            print(f"\n✅ All IP addresses are complete!")
        
        # Check for empty names
        empty_names = [s for s in switches if not s['name'] or s['name'].strip() == '']
        if empty_names:
            print(f"\n⚠️  Warning: {len(empty_names)} switches have empty names")
        else:
            print(f"\n✅ All switches have valid names!")
        
    except FileNotFoundError:
        print(f"❌ Error: File {input_file} not found")
        print("   Please make sure the Switch.html file exists in the correct location")
    except Exception as e:
        print(f"❌ Error parsing file: {str(e)}")

if __name__ == "__main__":
    main()
