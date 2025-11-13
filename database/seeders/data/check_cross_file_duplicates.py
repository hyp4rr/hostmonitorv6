import csv
import os
from collections import defaultdict

def check_cross_file_duplicates():
    """Check for duplicate IPs across all CSV files."""
    
    print("🔍 Checking for duplicate IPs across all CSV files...")
    print("=" * 60)
    
    csv_files = [
        'cctv.csv',
        'switches.csv',
        'wifi.csv',
        'server.csv',
        'tas.csv',
    ]
    
    # Track IPs and which files they appear in
    ip_to_files = defaultdict(list)
    
    for csv_file in csv_files:
        if not os.path.exists(csv_file):
            continue
        
        with open(csv_file, 'r', encoding='utf-8') as infile:
            reader = csv.reader(infile)
            header = next(reader)
            
            # Find IP column
            ip_col_index = None
            for i, col in enumerate(header):
                if 'ip' in col.lower() or 'address' in col.lower():
                    ip_col_index = i
                    break
            
            if ip_col_index is None:
                continue
            
            for row in reader:
                if len(row) <= ip_col_index:
                    continue
                
                ip_address = row[ip_col_index].strip().strip('"')
                
                if ip_address and ip_address != '0.0.0.0':
                    ip_to_files[ip_address].append((csv_file, row))
    
    # Find duplicates
    duplicates = {ip: files for ip, files in ip_to_files.items() if len(files) > 1}
    
    if duplicates:
        print(f"\n❌ Found {len(duplicates)} duplicate IPs across files:\n")
        for ip, occurrences in sorted(duplicates.items()):
            print(f"   IP: {ip}")
            for file, row in occurrences:
                print(f"      - {file}: {row[1] if len(row) > 1 else 'N/A'}")
            print()
    else:
        print("\n✅ No duplicate IPs found across files!")
    
    print("=" * 60)
    print(f"📊 Total unique IPs: {len(ip_to_files)}")
    print(f"📊 Total files checked: {len(csv_files)}")

if __name__ == '__main__':
    check_cross_file_duplicates()
