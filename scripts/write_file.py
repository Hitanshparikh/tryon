import sys
import base64

if len(sys.argv) < 3:
    print('Usage: write_file.py <target_path> <b64_content>')
    sys.exit(1)

target = sys.argv[1]
b64_data = sys.argv[2]
content = base64.b64decode(b64_data.encode('utf-8')).decode('utf-8')

with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print('OK')
