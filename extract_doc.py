import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

p = Path('大学生期末焦虑智能察觉与个性化疏导系统.docx')
with zipfile.ZipFile(p) as z:
    root = ET.fromstring(z.read('word/document.xml'))
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
texts = []
for para in root.findall('.//w:p', ns):
    parts = []
    for t in para.findall('.//w:t', ns):
        parts.append(t.text or '')
    txt = ''.join(parts)
    if txt.strip():
        texts.append(txt)
Path('doc_text.txt').write_text('\n'.join(texts[:1500]), encoding='utf-8')
print('extracted', len(texts), 'paragraphs')
