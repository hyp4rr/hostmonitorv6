#!/usr/bin/env python3
"""
Debug script to test the regex patterns
"""

import re

# Test HTML line
html_line = '''<input type=button class=Alive value='B2 1st Floor Makmal Bahasa Ping: 10.8...' title="B2 1st Floor Makmal Bahasa Ping: 10.8.3.44" onmouseover="javascript:showHint('B2 1st Floor Makmal Bahasa Ping: 10.8.3.44<br>Host is alive<br>3 ms')" onclick="javascript:showInfo('B2 1st Floor Makmal Bahasa Ping: 10.8.3.44','B2 1st Floor Makmal Bahasa Ping: 10.8.3.44<br><br>8/10/2025 11:37:51 AM<br>Host is alive<br><br>5/11/2025 4:46:39 PM<br>00:10:00<br>Ping 10.8.3.44<br><br><br><br>')">'''

# Test pattern 2
pattern2 = r"<input[^>]*value=['\"]([^'\"]*Ping:\s*[^'\"]*\.\.\.\.\.?)['\"][^>]*title=['\"]([^'\"]*Ping:\s*([^'\"]+))['\"][^>]*>"
matches2 = re.findall(pattern2, html_line)

print("Pattern 2 matches:")
for match in matches2:
    print(f"  Name: {match[0].split(' Ping:')[0].strip()}")
    print(f"  IP: {match[2]}")

# Test simpler pattern
simple_pattern = r"value='([^']*Ping:\s*[^'\']*\.\.\.)'[^>]*title=\"([^\"]*Ping:\s*([^\"]+))\""
simple_matches = re.findall(simple_pattern, html_line)

print("\nSimple pattern matches:")
for match in simple_matches:
    print(f"  Name: {match[0].split(' Ping:')[0].strip()}")
    print(f"  IP: {match[2]}")

# Test pattern 3
pattern3 = r"onclick=\"javascript:showInfo\([^']*'([^']*Ping:\s*([^'\"]+))[^']*'\)\""
matches3 = re.findall(pattern3, html_line)

print("\nPattern 3 matches:")
for match in matches3:
    print(f"  Full: {match[0]}")
    print(f"  IP: {match[1]}")
