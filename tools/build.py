#!/usr/bin/env python3
"""Build Pixel Pilot.

  python3 tools/build.py            src/app.html -> preview/index.html (new build stamp)
  python3 tools/build.py --promote  preview/index.html -> index.html (what the live link serves)

src/app.html is the only file to edit. It is written as page content (no <html>/<head>),
so it can also be published as a Claude artifact; this script wraps it into a full document.
"""
import sys, time, shutil, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, PREVIEW, LIVE = ROOT / "src/app.html", ROOT / "preview/index.html", ROOT / "index.html"

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Pixel Pilot">
<meta name="theme-color" content="#140a2e">
"""

def build():
    s = SRC.read_text()
    i = s.index("</style>") + len("</style>")
    doc = HEAD + s[:i] + "\n</head>\n<body>\n" + s[i:] + "\n</body>\n</html>\n"
    stamp = time.strftime("%Y%m%d-%H%M%S")
    if "const BUILD='__BUILD__'" not in doc:
        sys.exit("build stamp placeholder missing from src/app.html")
    doc = doc.replace("const BUILD='__BUILD__'", f"const BUILD='{stamp}'")
    PREVIEW.parent.mkdir(exist_ok=True)
    PREVIEW.write_text(doc)
    print(f"built preview/index.html  build={stamp}")

def promote():
    if not PREVIEW.exists():
        sys.exit("no preview build to promote")
    shutil.copyfile(PREVIEW, LIVE)
    m = re.search(r"const BUILD='([^']+)'", LIVE.read_text())
    print(f"promoted preview -> index.html  build={m.group(1) if m else '?'}")

if __name__ == "__main__":
    promote() if "--promote" in sys.argv else build()
