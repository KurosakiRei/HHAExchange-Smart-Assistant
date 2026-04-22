"""
verify_fax_template.py - Verify fonts and spacing in the patched fax_cover_sheet.docx
"""
import zipfile, re

SRC = r"src/assets/fax_cover_sheet.docx"

with zipfile.ZipFile(SRC) as z:
    xml = z.read("word/document.xml").decode("utf-8")

print("XML length:", len(xml))
print("has {pages}:      ", "{pages}" in xml)
print("has Good morning: ", "Good morning, CM." in xml)
print("has Thank you:    ", "Thank you." in xml)
print()

checks = [
    ("Good morning, CM.", "Times New Roman", "24", False),
    ("Thank you.",        "Times New Roman", "28", False),
    ("{command}",         "Times New Roman", "24", False),
    ("{body}",            "Times New Roman", "24", False),
    ("{signature_block}", "Arial",           "22", True),
]

for text, exp_font, exp_sz, exp_bold in checks:
    idx = xml.find(text)
    if idx < 0:
        print(f"MISSING  {text!r}")
        continue
    ctx = xml[max(0, idx - 300) : idx + len(text) + 100]
    sz_match   = re.search(r'<w:sz w:val="(\d+)"', ctx)
    font_match = re.search(r'w:ascii="([^"]+)"', ctx)
    bold_match = "<w:b/>" in ctx
    sz   = sz_match.group(1)   if sz_match   else "n/a"
    font = font_match.group(1) if font_match else "n/a"
    ok = font == exp_font and sz == exp_sz and bold_match == exp_bold
    status = "OK  " if ok else "WARN"
    print(f"{status}  {text!r:30s}  font={font}  sz={sz}  bold={bold_match}")

    sz_match = re.search(r'<w:sz w:val="(\d+)"', ctx)
    font_match = re.search(r'w:ascii="([^"]+)"', ctx)
    bold_match = "<w:b/>" in ctx
    sz = sz_match.group(1) if sz_match else "n/a"
    font = font_match.group(1) if font_match else "n/a"
    ok_font = font == exp_font
    ok_sz = sz == exp_sz
    ok_bold = bold_match == exp_bold
    status = "OK " if (ok_font and ok_sz and ok_bold) else "WARN"
    print(f"{status}  {text!r:30s}  font={font}({ok_font})  sz={sz}({ok_sz})  bold={bold_match}({ok_bold})")
