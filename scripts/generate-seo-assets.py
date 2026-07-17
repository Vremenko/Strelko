#!/usr/bin/env python3
"""Generira OG slike po straneh in PWA ikone v public/."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
OG_DIR = PUBLIC / "og"
PWA_DIR = PUBLIC / "pwa"

W, H = 1200, 630
BG = (26, 26, 26)
ACCENT = (251, 176, 6)
CYAN = (5, 165, 206)
TEXT = (242, 242, 242)
MUTED = (153, 153, 153)

OG_PAGES: list[tuple[str, str, str]] = [
    ("home", "Strelko", "Pregled udarov strel v Sloveniji"),
    ("zavarovalnica", "Zavarovalnica", "Preverjanje udarov strel v bližini naslova"),
    ("statistika", "Statistika", "Arhiv in statistika strel v Sloveniji"),
    ("widget", "Widget", "Udari strel za spletno stran občine"),
    ("cenik", "Cenik", "Žetoni in paket Podpornik"),
    ("impressum", "Impressum", "Podatki o ponudniku storitve"),
    ("pogoji", "Pogoji uporabe", "Pravila uporabe storitve Strelko"),
    ("zasebnost", "Zasebnost", "Politika varstva osebnih podatkov"),
    ("piskotki", "Piškotki", "Politika piškotkov in shrambe"),
    ("viri-podatkov", "Viri podatkov", "Izvor in omejitve podatkov o strelah"),
    ("pravice", "Pravice potrošnikov", "Povzetek potrošniških pravic"),
]


def load_fonts() -> tuple:
    try:
        title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 34)
        brand = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
        return title, sub, brand
    except OSError:
        default = ImageFont.load_default()
        return default, default, default


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        trial = " ".join([*current, word]) if current else word
        if draw.textlength(trial, font=font) <= max_width:
            current.append(word)
        else:
            if current:
                lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines[:3]


def render_og(slug: str, title: str, subtitle: str, title_font, sub_font, brand_font) -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    for y in range(H):
        t = y / H
        shade = int(26 + (51 - 26) * (1 - t) * 0.35)
        draw.line([(0, y), (W, y)], fill=(shade, shade, shade))

    bolt = [(700, 120), (560, 360), (650, 360), (520, 520), (820, 250), (710, 250), (760, 120)]
    draw.polygon(bolt, fill=ACCENT)
    draw.polygon(bolt, outline=(255, 255, 255), width=4)
    draw.ellipse((620, 90, 860, 330), outline=CYAN, width=3)

    draw.text((80, 150), title, font=title_font, fill=TEXT)
    y = 250
    for line in wrap_text(draw, subtitle, sub_font, 560):
        draw.text((80, y), line, font=sub_font, fill=MUTED)
        y += 44
    draw.text((80, 520), "strelko.meteoinfo.si", font=brand_font, fill=CYAN)

    out = OG_DIR / f"{slug}.png"
    img.save(out, format="PNG", optimize=True)
    print(f"og: {out.relative_to(ROOT)} ({out.stat().st_size} bytes)")


def render_pwa_icon(size: int, mark_path: Path, out_path: Path) -> None:
    mark = Image.open(mark_path).convert("RGBA")
    canvas = Image.new("RGBA", (size, size), (*BG, 255))
    mark.thumbnail((int(size * 0.62), int(size * 0.62)), Image.Resampling.LANCZOS)
    x = (size - mark.width) // 2
    y = (size - mark.height) // 2
    canvas.paste(mark, (x, y), mark)
    canvas.convert("RGB").save(out_path, format="PNG", optimize=True)
    print(f"pwa: {out_path.relative_to(ROOT)} ({out_path.stat().st_size} bytes)")


def main() -> None:
    OG_DIR.mkdir(parents=True, exist_ok=True)
    PWA_DIR.mkdir(parents=True, exist_ok=True)

    title_font, sub_font, brand_font = load_fonts()
    for slug, title, subtitle in OG_PAGES:
        render_og(slug, title, subtitle, title_font, sub_font, brand_font)

    mark = PUBLIC / "assets" / "strelko-logo-mark.png"
    if mark.exists():
        render_pwa_icon(180, mark, PWA_DIR / "apple-touch-icon.png")
        render_pwa_icon(192, mark, PWA_DIR / "icon-192.png")
        render_pwa_icon(512, mark, PWA_DIR / "icon-512.png")
    else:
        print(f"pwa: preskočeno, manjka {mark}")

    # Legacy privzeta OG slika (fallback)
    default = OG_DIR / "home.png"
    legacy = PUBLIC / "og-image.png"
    if default.exists():
        legacy.write_bytes(default.read_bytes())
        print(f"og: {legacy.relative_to(ROOT)} (kopija home.png)")


if __name__ == "__main__":
    main()
