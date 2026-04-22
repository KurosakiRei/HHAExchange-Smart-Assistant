"""
fix_fax_template.py - Fix fax_cover_sheet.docx template:
1. Add explicit font rPr to {command}, {body}, {signature_block} runs
2. Insert 'Good morning, CM.' paragraph between {command} and {body}
3. Insert 'Thank you.' paragraph between {body} and {signature_block}
"""
import zipfile, os

SRC = r"src\assets\fax_cover_sheet.docx"
TMP = r"src\assets\fax_cover_sheet_fixed.docx"

TNR12_RUN_RP = (
    "<w:rPr>"
    '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
    '<w:sz w:val="24"/>'
    "</w:rPr>"
)

TNR14_PARA = (
    "<w:p>"
    "<w:pPr>"
    '<w:spacing w:after="220" w:line="240" w:lineRule="auto"/>'
    '<w:jc w:val="both"/>'
    "<w:rPr>"
    '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
    '<w:sz w:val="28"/>'
    "</w:rPr>"
    "</w:pPr>"
    "<w:r>"
    "<w:rPr>"
    '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
    '<w:sz w:val="28"/>'
    "</w:rPr>"
    "<w:t>Thank you.</w:t>"
    "</w:r>"
    "</w:p>"
)

GREETING_PARA = (
    "<w:p>"
    "<w:pPr>"
    '<w:spacing w:after="220" w:line="240" w:lineRule="auto"/>'
    '<w:jc w:val="both"/>'
    "<w:rPr>"
    '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
    '<w:sz w:val="24"/>'
    "</w:rPr>"
    "</w:pPr>"
    "<w:r>"
    "<w:rPr>"
    '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
    '<w:sz w:val="24"/>'
    "</w:rPr>"
    "<w:t>Good morning, CM.</w:t>"
    "</w:r>"
    "</w:p>"
)

with zipfile.ZipFile(SRC) as z:
    xml = z.read("word/document.xml").decode("utf-8")

print("Original XML length:", len(xml))

# 1. Fix {command} run: add explicit rPr (Times New Roman 12pt)
OLD_CMD = "<w:r><w:t>Command: {command}</w:t></w:r>"
NEW_CMD = (
    "<w:r>"
    + TNR12_RUN_RP
    + '<w:t xml:space="preserve">Command: {command}</w:t>'
    + "</w:r>"
)
if OLD_CMD not in xml:
    raise ValueError("ERROR: {command} run not found!")
xml = xml.replace(OLD_CMD, NEW_CMD)
print("Fixed {command} run font.")

# 2. Fix {body} run: add explicit rPr (Times New Roman 12pt)
OLD_BODY = "<w:r><w:t>{body}</w:t></w:r>"
NEW_BODY = "<w:r>" + TNR12_RUN_RP + "<w:t>{body}</w:t>" + "</w:r>"
if OLD_BODY not in xml:
    raise ValueError("ERROR: {body} run not found!")
xml = xml.replace(OLD_BODY, NEW_BODY)
print("Fixed {body} run font.")

# 3. Fix {signature_block} run: add explicit rPr (Arial 11pt Bold)
OLD_SIG = "<w:r><w:t>{signature_block}</w:t></w:r>"
NEW_SIG = (
    "<w:r>"
    "<w:rPr>"
    '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>'
    "<w:b/>"
    '<w:sz w:val="22"/>'
    "</w:rPr>"
    "<w:t>{signature_block}</w:t>"
    "</w:r>"
)
if OLD_SIG not in xml:
    raise ValueError("ERROR: {signature_block} run not found!")
xml = xml.replace(OLD_SIG, NEW_SIG)
print("Fixed {signature_block} run font.")

# 4. Insert greeting paragraph after the {command} paragraph
CMD_PARA_END = NEW_CMD + "</w:p>"
if CMD_PARA_END not in xml:
    raise ValueError("ERROR: command para end not found!")
xml = xml.replace(CMD_PARA_END, CMD_PARA_END + GREETING_PARA, 1)
print("Inserted 'Good morning, CM.' paragraph.")

# 5. Insert 'Thank you.' paragraph before the {signature_block} paragraph
SIG_PARA_MARKER = '<w:p w14:paraId="574DC586"'
if SIG_PARA_MARKER in xml:
    xml = xml.replace(SIG_PARA_MARKER, TNR14_PARA + SIG_PARA_MARKER, 1)
    print("Inserted 'Thank you.' paragraph (by paraId).")
else:
    # Fallback: find the paragraph containing signature_block by backtracking
    idx = xml.find(NEW_SIG)
    if idx >= 0:
        para_start = xml.rfind("<w:p ", 0, idx)
        if para_start >= 0:
            xml = xml[:para_start] + TNR14_PARA + xml[para_start:]
            print("Inserted 'Thank you.' paragraph (by position fallback).")
        else:
            print("WARNING: Could not find signature para start.")
    else:
        print("WARNING: Could not insert Thank you paragraph.")

# Write back
with zipfile.ZipFile(SRC) as z_in:
    with zipfile.ZipFile(TMP, "w", zipfile.ZIP_DEFLATED) as z_out:
        for item in z_in.namelist():
            if item == "word/document.xml":
                z_out.writestr(item, xml.encode("utf-8"))
            else:
                z_out.writestr(item, z_in.read(item))

os.replace(TMP, SRC)
print(f"Done! New XML length: {len(xml)}")
