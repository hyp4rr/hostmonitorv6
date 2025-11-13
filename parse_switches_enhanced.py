#!/usr/bin/env python3
"""
Enhanced Switch Data Scraper
Extracts switch names and IP addresses from Switch.html file with multiple patterns
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
    seen_ips = set()
    
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
            
        if ip_address not in seen_ips:
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
            seen_ips.add(ip_address)
    
    # Pattern 2: Extract from onclick attribute (most reliable)
    pattern2 = r"onclick=\"javascript:showInfo\([^,]*,'([^']*Ping:\s*([^'\"]+))[^']*'\)\""
    matches2 = re.findall(pattern2, content)
    
    for match in matches2:
        onclick_text = match[0]
        ip_address = match[1]
        
        # Extract name from onclick text (everything before "Ping:")
        name = onclick_text.split(' Ping:')[0].strip()
        
        # Clean up the name
        name = name.replace('&amp;', '&')
        
        # Skip if no IP found or already seen
        if not ip_address or ip_address == '' or ip_address in seen_ips:
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
        seen_ips.add(ip_address)
    
    # Pattern 3: Extract from title attribute for truncated values
    pattern3 = r"title=\"([^\"]*Ping:\s*([^\"]+))\""
    matches3 = re.findall(pattern3, content)
    
    for match in matches3:
        title_text = match[0]
        ip_address = match[1]
        
        # Extract name from title text (everything before "Ping:")
        name = title_text.split(' Ping:')[0].strip()
        
        # Clean up the name
        name = name.replace('&amp;', '&')
        
        # Skip if no IP found or already seen
        if not ip_address or ip_address == '' or ip_address in seen_ips:
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
        seen_ips.add(ip_address)
    
    # Pattern 4: Extract from onmouseover attribute
    pattern4 = r"onmouseover=\"javascript:showHint\('([^']*Ping:\s*([^'\"]+))[^']*'\)\""
    matches4 = re.findall(pattern4, content)
    
    for match in matches4:
        hint_text = match[0]
        ip_address = match[1]
        
        # Extract name from hint text (everything before "Ping:")
        name = hint_text.split(' Ping:')[0].strip()
        
        # Clean up the name
        name = name.replace('&amp;', '&')
        
        # Skip if no IP found or already seen
        if not ip_address or ip_address == '' or ip_address in seen_ips:
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
        seen_ips.add(ip_address)
    
    return switches

def main():
    """Main function to parse and save switch data"""
    
    input_file = 'database/seeders/data/Switch.html'
    output_file = 'database/seeders/data/switches.json'
    
    try:
        # Parse the switch data
        switches = parse_switch_data(input_file)
        
        # Sort switches by name for better organization
        switches.sort(key=lambda x: x['name'])
        
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
        for i, switch in enumerate(switches[:10]):
            print(f"   {i+1}. {switch['name']} -> {switch['ip_address']}")
        
        if len(switches) > 10:
            print(f"   ... and {len(switches) - 10} more switches")
            
        # Create CSV format as well
        csv_file = 'database/seeders/data/switches.csv'
        with open(csv_file, 'w', encoding='utf-8') as file:
            file.write('name,ip_address,category,status,location,brand\n')
            for switch in switches:
                file.write(f"{switch['name']},{switch['ip_address']},{switch['category']},{switch['status']},{switch['location']},{switch['brand']}\n")
        
        print(f"\n📊 CSV also saved to {csv_file}")
        
        # Check for any incomplete IPs
        incomplete_ips = [s for s in switches if '...' in s['ip_address']]
        if incomplete_ips:
            print(f"\n⚠️  Warning: {len(incomplete_ips)} switches still have incomplete IPs")
            for switch in incomplete_ips[:5]:
                print(f"   - {switch['name']}: {switch['ip_address']}")
        else:
            print(f"\n✅ All IP addresses are complete!")
        
    except FileNotFoundError:
        print(f"❌ Error: File {input_file} not found")
        print("   Please make sure the Switch.html file exists in the correct location")
    except Exception as e:
        print(f"❌ Error parsing file: {str(e)}")

if __name__ == "__main__":
    main()
