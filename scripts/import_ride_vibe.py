"""Copy the public Ride & Vibe site into its independent GitHub Pages folder."""
from collections import deque
from pathlib import Path, PurePosixPath
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
from urllib.request import Request, urlopen
import html
import re

ORIGIN = "https://durex-ride-vibe.vinit-singh482832.chatgpt.site"
DEST = Path("ride-vibe")
DEST.mkdir(exist_ok=True)
pending = deque([(ORIGIN + "/", "index.html")])
seen = set()
downloaded = []
total_bytes = 0

def enqueue(value, base):
    value = html.unescape(value.strip())
    if not value or value.startswith(("#", "data:", "blob:", "mailto:", "tel:")):
        return
    address = urljoin(base, value)
    parts = urlsplit(address)
    if parts.scheme != "https" or parts.netloc != urlsplit(ORIGIN).netloc:
        return
    name = unquote(parts.path).lstrip("/")
    if not name:
        name = "index.html"
    path = PurePosixPath(name)
    if ".." in path.parts or "\\" in name or name.endswith("/"):
        return
    if name != "index.html" and not (name.startswith("assets/") or path.suffix in {".css", ".js", ".ico", ".png", ".svg", ".webp", ".woff", ".woff2"}):
        return
    if name not in seen:
        pending.append((address.split("#", 1)[0], name))

class Assets(HTMLParser):
    def __init__(self, base):
        super().__init__()
        self.base = base
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        for key in ("src", "poster", "data-src"):
            if data.get(key):
                enqueue(data[key], self.base)
        if tag == "link" and data.get("href"):
            enqueue(data["href"], self.base)
        if data.get("srcset"):
            for candidate in data["srcset"].split(","):
                enqueue(candidate.strip().split(" ")[0], self.base)

while pending:
    address, name = pending.popleft()
    if name in seen:
        continue
    seen.add(name)
    if len(seen) > 300:
        raise RuntimeError("Unexpectedly large asset list")
    request = Request(address, headers={"User-Agent": "RideVibeGitHubPublisher/1.0"})
    with urlopen(request, timeout=90) as response:
        if urlsplit(response.url).netloc != urlsplit(ORIGIN).netloc:
            raise RuntimeError("Unexpected download redirect")
        content = response.read(25 * 1024 * 1024 + 1)
        mime = response.headers.get_content_type()
    if len(content) > 25 * 1024 * 1024:
        raise RuntimeError("Asset exceeds the expected file size")
    total_bytes += len(content)
    if total_bytes > 200 * 1024 * 1024:
        raise RuntimeError("Website exceeds the expected total size")
    suffix = PurePosixPath(name).suffix
    if name != "index.html" and mime == "text/html":
        raise RuntimeError("Received HTML instead of asset: " + name)
    if name == "index.html":
        page = content.decode("utf-8")
        if "Durex Play Ride" not in page or 'id="mainImage"' not in page:
            raise RuntimeError("The public Ride & Vibe page did not load")
        Assets(address).feed(page)
    if suffix in {".css", ".js", ".html"}:
        text = content.decode("utf-8")
        for value in re.findall(r"url\(\s*['\"]?([^'\"\)]+)", text):
            enqueue(value, address)
        for value in re.findall(r"""assets/[^'"\s<>\)]+""", text):
            enqueue(value, ORIGIN + "/")
        text = text.replace(ORIGIN + "/assets/", "assets/")
        content = text.encode("utf-8")
    target = DEST / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)
    downloaded.append(name)
    print("Saved", name, len(content), flush=True)

if len(downloaded) < 40:
    raise RuntimeError("Website asset copy appears incomplete")
(DEST / ".nojekyll").write_text("")
(DEST / "README.md").write_text(
    "# Durex Play Ride & Vibe\n\n"
    "Independent static website hosted on GitHub Pages. "
    "Uses the locked Buzzy Rabbit theme and official Ride & Vibe product assets.\n\n"
    "HTML, styles, scripts, fonts and media are stored in this folder. "
    "Checkout actions continue on the official Durex India store.\n"
)
print("Published files:", len(downloaded), "Total bytes:", total_bytes)
