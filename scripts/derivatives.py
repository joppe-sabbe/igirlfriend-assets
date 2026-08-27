"""
Turns the PNG masters into the JPEGs the app actually downloads.

The app does not bundle any of this. It fetches `web/<id>/<shot>.jpg` over
HTTPS from GitHub Pages, so what matters here is bytes on a phone connection:
a 1.7 MB master becomes a ~180 KB progressive JPEG that is indistinguishable
on a 6-inch screen. The masters stay in `companions/` — they are the negatives,
and every future crop or re-encode comes from them, never from a JPEG.

Two sizes per shot, because the same photograph is used at wildly different
scales: full-bleed heroes at 393pt wide, and 118pt gallery tiles. Sending the
hero file to a tile costs about eight times the bytes for pixels no one sees.
Avatars get one size — 512px covers the largest circle in the app (62pt at 3x)
with room to spare, and at ~40 KB a second variant would not pay for itself.

    python3 scripts/derivatives.py            # everything, skipping what exists
    python3 scripts/derivatives.py --force    # re-encode from the masters
"""

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MASTERS = ROOT / "companions"
OUT = ROOT / "web"

# master stem -> (public name, full width, thumb width or None)
SHOTS = {
    "01-anchor": ("avatar", 512, None),
    "02-card": ("card", 864, 432),
    "03-casual": ("casual", 864, 432),
    "04-selfie": ("selfie", 864, 432),
    "05-evening": ("evening", 864, 432),
}

FULL_Q = 82
THUMB_Q = 78

force = "--force" in sys.argv


def encode(src: Image.Image, path: Path, width: int, quality: int) -> None:
    if path.exists() and not force:
        print(f"{path.relative_to(ROOT)}  exists, skipped")
        return
    im = src
    if im.width != width:
        height = round(im.height * width / im.width)
        im = im.resize((width, height), Image.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    # `progressive` so a slow connection paints a whole blurry photo rather
    # than a sharp top third; `optimize` is a few percent for free.
    im.convert("RGB").save(
        path, "JPEG", quality=quality, progressive=True, optimize=True
    )
    print(f"{path.relative_to(ROOT)}  {im.width}x{im.height}  {path.stat().st_size // 1024} KB")


def main() -> None:
    total = 0
    for master in sorted(MASTERS.glob("*/*.png")):
        spec = SHOTS.get(master.stem)
        if not spec:
            print(f"{master.name}: no mapping, ignored")
            continue
        name, full_w, thumb_w = spec
        with Image.open(master) as src:
            src.load()
            encode(src, OUT / master.parent.name / f"{name}.jpg", full_w, FULL_Q)
            if thumb_w:
                encode(
                    src,
                    OUT / master.parent.name / f"{name}-sm.jpg",
                    thumb_w,
                    THUMB_Q,
                )
    for f in OUT.rglob("*.jpg"):
        total += f.stat().st_size
    print(f"\nweb/ is {total / 1024 / 1024:.1f} MB")


main()
