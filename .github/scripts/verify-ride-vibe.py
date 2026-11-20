"""Verify the live Ride & Vibe page and its self-hosted assets."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote
import time

BASE = "https://vinitsingh-del.github.io/DUREX_BUZZYR/ride-vibe/"
expected = Path("ride-vibe/index.html").read_bytes()
for attempt in range(12):
    try:
        with urlopen(Request(BASE + "?verify=" + str(time.time_ns()), headers={"Cache-Control": "no-cache"}), timeout=30) as response:
            live = response.read()
        if live == expected:
            break
    except Exception as error:
        print("Waiting for current deployment:", error, flush=True)
    time.sleep(10)
else:
    raise RuntimeError("Live HTML does not match the committed website")

files = [p for p in Path("ride-vibe").rglob("*") if p.is_file() and p.name not in {"README.md", ".nojekyll"}]
def check(path):
    url = BASE + quote(path.relative_to("ride-vibe").as_posix())
    with urlopen(Request(url, method="HEAD"), timeout=45) as response:
        if response.status != 200:
            raise RuntimeError("Asset failed: " + url)
        if path.suffix != ".html" and response.headers.get_content_type() == "text/html":
            raise RuntimeError("Unexpected HTML for asset: " + url)
    return path
with ThreadPoolExecutor(max_workers=8) as pool:
    checked = list(pool.map(check, files))
print("Verified public URL:", BASE)
print("Verified files:", len(checked))
print("Live HTML exactly matches the committed website.")
