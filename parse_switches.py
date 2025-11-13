#!/usr/bin/env python3
"""
Switch Data Scraper
Extracts switch names and IP addresses from Switch.html file
"""

import re
import json
from datetime import datetime

def parse_switch_data(html_file_path):
    """Parse switch data from the HTML file"""
    
    # Read the HTML file
    with open(html_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    switches = []
    
    # Pattern 1: Extract from value attribute (complete IPs)
    pattern1 = r"<input[^>]*value=['\"]([^'\"]*Ping:\s*([^'\"]+))['\"][^>]*>"
    matches1 = re.findall(pattern1, content)
    
    for match in matches1:
        full_value = match[0]
        ip_address = match[1]
        
        # Extract name (everything before "Ping:")
        name = full_value.split(' Ping:')[0].strip()
        
        # Clean up the name
        name = name.replace('&amp;', '&')
        
        # Skip if no IP found or IP is incomplete
        if not ip_address or ip_address == '' or '...' in ip_address:
            continue
            
        switches.append({
            'name': name,
            'ip_address': ip_address.strip(),
            'category': 'switch',
            'status': 'unknown',
            'location': '',
            'brand': '',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        })
    
    # Pattern 2: Extract from title attribute (for truncated values)
    pattern2a = r"value='([^']*Ping:\s*[^']*\\\.\\\.\\\.\\\.?)'[^>]*title=\"([^\"]*Ping:\s*([^\"]+))\""
    pattern2b = r"value=\"([^\"]*Ping:\s*[^\"]*\\\.\\\.\\\.\\\.?)\"[^>]*title='([^']*Ping:\s*([^']+))'"
    
    matches2 = re.findall(pattern2a, content) + re.findall(pattern2b, content)
    
    for match in matches2:
        full_value = match[0]
        title_text = match[1]
        ip_address = match[2]
        
        # Extract name from value (everything before "Ping:")
        name = full_value.split(' Ping:')[0].strip()
        
        # Clean up the name
        name = name.replace('&amp;', '&')
        
        # Skip if no IP found
        if not ip_address or ip_address == '':
            continue
            
        # Check if we already have this switch (avoid duplicates)
        existing_ip = any(s['ip_address'] == ip_address.strip() for s in switches)
        if existing_ip:
            continue
            
        switches.append({
            'name': name,
            'ip_address': ip_address.strip(),
            'category': 'switch',
            'status': 'unknown',
            'location': '',
            'brand': '',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        })
    
    # Pattern 3: Extract from onclick attribute (for switches without Ping: in value)
    pattern3 = r"<input[^>]*value=['\"]([^'\"]+)['\"][^>]*onclick=\"javascript:showInfo\([^']*'([^']*Ping:\s*([^'\"]+))[^']*'\)\""
    matches3 = re.findall(pattern3, content)
    
    for match in matches3:
        name = match[0].strip()
        onclick_text = match[1]
        ip_address = match[2]
        
        # Clean up the name
        name = name.replace('&amp;', '&')
        
        # Skip if no IP found
        if not ip_address or ip_address == '':
            continue
            
        # Check if we already have this switch (avoid duplicates)
        existing_ip = any(s['ip_address'] == ip_address.strip() for s in switches)
        if existing_ip:
            continue
            
        switches.append({
            'name': name,
            'ip_address': ip_address.strip(),
            'category': 'switch',
            'status': 'unknown',
            'location': '',
            'brand': '',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        })
    
    return switches

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
        print(f"✅ Successfully parsed {len(switches)} switches from {input_file}")
        print(f"📁 Data saved to {output_file}")
        print("\n📊 Summary:")
        print(f"   Total switches: {len(switches)}")
        
        # Show first few examples
        print("\n🔍 Sample data:")
        for i, switch in enumerate(switches[:5]):
            print(f"   {i+1}. {switch['name']} -> {switch['ip_address']}")
        
        if len(switches) > 5:
            print(f"   ... and {len(switches) - 5} more switches")
            
        # Create CSV format as well
        csv_file = 'database/seeders/data/switches.csv'
        with open(csv_file, 'w', encoding='utf-8') as file:
            file.write('name,ip_address,category,status,location,brand\n')
            for switch in switches:
                file.write(f"{switch['name']},{switch['ip_address']},{switch['category']},{switch['status']},{switch['location']},{switch['brand']}\n")
        
        print(f"\n📊 CSV also saved to {csv_file}")
        
    except FileNotFoundError:
        print(f"❌ Error: File {input_file} not found")
        print("   Please make sure the Switch.html file exists in the correct location")
    except Exception as e:
        print(f"❌ Error parsing file: {str(e)}")

if __name__ == "__main__":
    main()
