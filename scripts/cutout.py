#!/usr/bin/env python3
"""
Cuts the green screen off the gift renders and writes the shipped PNGs.

    python3 scripts/cutout.py            # every gifts/<id>-raw.png
    python3 scripts/cutout.py rose ring  # only these

nano-banana has no alpha channel, so the gifts are generated on a flat green
field and keyed here. Three things this has to get right, and each of them is
visible on a dark background if it does not:

  * the field is *not* #00FF00 — the model paints whatever green it feels like,
    so the key colour is sampled from the border rather than assumed;
  * a rose has green leaves and a weekend bag has none. Colour distance alone
    would punch the leaves out, so the background is found by flooding inwards
    from the frame edge: green that no path connects to the border is part of
    the object;
  * an antialiased edge is a blend of object and screen, so it stays green on
    a plum background unless the spill is pulled out of the partial pixels.
    That is the difference between a photograph and a sticker.

Writes the trimmed master next to the raw file and two web sizes.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "gifts"
WEB = ROOT / "web" / "gifts"

# How far a pixel's *hue* may sit from the key colour's before it counts as
# object. Chromaticity, not RGB distance: the model likes to lay a shadow
# across its own green screen, and a shadow is the same green at a lower
# brightness — under an RGB metric it reads as a new colour and survives the
# key as a grey smear under the object. Between the two thresholds the alpha
# ramps, which is what keeps the edge soft.
SOLID = 0.020
OBJECT = 0.065

# Some renders come back with the screen lit unevenly — a bloom around a glass
# bottle, a band of light under a bag. That is the key colour mixed with white,
# which moves it in chromaticity as surely as a different colour would, and it
# survives the key as a grey cloud. WIDE keys on the *direction* of the colour
# instead of its position: green plus any amount of white or black still points
# at green. It is off by default because a rose's leaves point at green too,
# and only turned on for the pictures that need it.
WIDE = {"perfume", "trip"}
WIDE_SOLID = 9.0
WIDE_OBJECT = 30.0
# Below this much green in the pixel there is no hue to judge — white paper,
# a passport, a diamond — so it is object, whatever direction the noise points.
WIDE_MIN_GREEN = 14.0

# Padding around the trimmed object, as a fraction of the square side. The
# object is drawn to fill its box in the app, so the margin lives here.
MARGIN = 0.04

SIZES = {"": 512, "-sm": 192}


def key_colour(rgb: np.ndarray) -> np.ndarray:
    """Median of a one-pixel frame — robust to an object that touches an edge."""
    border = np.concatenate(
        [rgb[0, :], rgb[-1, :], rgb[:, 0], rgb[:, -1]], axis=0
    )
    return np.median(border, axis=0)


def chromaticity(rgb: np.ndarray) -> np.ndarray:
    """Colour with the brightness divided out, so shadow and screen agree."""
    return rgb / (rgb.sum(axis=-1, keepdims=True) + 1e-6)


def flood(candidate: np.ndarray, seed: np.ndarray) -> np.ndarray:
    """
    Everything in `candidate` reachable from `seed`, 4-connected.

    Plain iterative dilation. scipy is not installed here and the alternative —
    trusting colour distance alone — costs a rose its leaves, so a couple of
    seconds of numpy is the cheap option.
    """
    reached = seed & candidate

    while True:
        grown = reached.copy()
        grown[1:, :] |= reached[:-1, :]
        grown[:-1, :] |= reached[1:, :]
        grown[:, 1:] |= reached[:, :-1]
        grown[:, :-1] |= reached[:, 1:]
        grown &= candidate
        if np.array_equal(grown, reached):
            return reached
        reached = grown


def wide_distance(rgb: np.ndarray, key: np.ndarray) -> np.ndarray:
    """How far the pixel's hue is from the key's, ignoring white and black."""
    chroma = rgb - rgb.mean(axis=-1, keepdims=True)
    axis = key - key.mean()
    axis = axis / np.linalg.norm(axis)
    along = chroma @ axis
    across = np.linalg.norm(chroma - along[..., None] * axis, axis=-1)
    # A neutral pixel has no hue to compare, so push it well clear of the key.
    return np.where(along < WIDE_MIN_GREEN, WIDE_OBJECT * 2, across)


def cut(path: Path, wide: bool = False) -> Image.Image:
    src = Image.open(path).convert("RGB")
    rgb = np.asarray(src).astype(np.float32)
    key = key_colour(rgb)

    if wide:
        dist = wide_distance(rgb, key)
        solid, obj = WIDE_SOLID, WIDE_OBJECT
    else:
        dist = np.linalg.norm(chromaticity(rgb) - chromaticity(key), axis=2)
        solid, obj = SOLID, OBJECT
    alpha = np.clip((dist - solid) / (obj - solid), 0.0, 1.0)

    # Colour says "screen"; connectivity says whether it is *the* screen.
    candidate = alpha < 1.0
    border = np.zeros_like(candidate)
    border[0, :] = border[-1, :] = True
    border[:, 0] = border[:, -1] = True
    background = flood(candidate, border)

    # A gap the object closes around — between a leaf and its stem — has no
    # path to the frame, and left opaque it is a green shard in the middle of
    # the picture. Anything sitting on the exact key colour is a hole no
    # matter what surrounds it, so it seeds a second flood; that keeps the
    # soft ramp around the hole instead of stamping it out.
    holes = flood(candidate, ~background & (dist < solid))
    background |= holes

    alpha = np.where(background, alpha, 1.0)

    # Despill: on the partial pixels the screen is mixed into the colour, so
    # hold green down to the level of the other two channels. Only there —
    # doing it everywhere would drain the leaves and the ribbon.
    out = rgb.copy()
    edge = (alpha > 0.0) & (alpha < 1.0)
    ceiling = (out[:, :, 0] + out[:, :, 2]) / 2.0
    spill = edge & (out[:, :, 1] > ceiling)
    out[:, :, 1] = np.where(spill, ceiling, out[:, :, 1])

    rgba = np.dstack([out, alpha * 255.0]).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")

    box = img.getbbox()  # alpha-aware
    if box is None:
        raise SystemExit(f"{path.name}: keyed away to nothing")
    img = img.crop(box)

    side = int(max(img.size) * (1 + 2 * MARGIN))
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    return square


def main() -> None:
    wanted = [a for a in sys.argv[1:] if not a.startswith("--")]
    files = sorted(RAW.glob("*-raw.png"))
    if wanted:
        files = [f for f in files if f.name[: -len("-raw.png")] in wanted]
    if not files:
        raise SystemExit("nothing to cut — run scripts/gifts.mjs first")

    WEB.mkdir(parents=True, exist_ok=True)
    for f in files:
        gift = f.name[: -len("-raw.png")]
        square = cut(f, wide=gift in WIDE)
        master = RAW / f"{gift}.png"
        square.save(master)
        line = [f"{gift:<10} {square.width}px master"]
        for suffix, size in SIZES.items():
            small = square.resize((size, size), Image.LANCZOS)
            out = WEB / f"{gift}{suffix}.png"
            small.save(out, optimize=True)
            line.append(f"{suffix or 'full':>5}: {out.stat().st_size // 1024}KB")
        print("  ".join(line))


if __name__ == "__main__":
    main()
