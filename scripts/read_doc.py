import zipfile
import xml.etree.ElementTree as ET
import glob
import os

def get_docx_text(path):
    try:
        with zipfile.ZipFile(path) as z:
            xml_content = z.read('word/document.xml')
            root = ET.fromstring(xml_content)
            texts = [elem.text for elem in root.iter() if elem.tag.endswith('t') and elem.text]
            return "".join(texts)
    except Exception as e:
        return f"Error {path}: {e}"

files = glob.glob('c:/Users/11869/Desktop/文档/buss/*.docx')
output_path = 'c:/Users/11869/Desktop/文档/buss/docx_contents.txt'

with open(output_path, 'w', encoding='utf-8') as out:
    for f in files:
        txt = get_docx_text(f)
        out.write(f"=== File: {os.path.basename(f)} ===\n")
        out.write(txt)
        out.write("\n\n" + "="*80 + "\n\n")

print("Done extracting docx files to docx_contents.txt.")
