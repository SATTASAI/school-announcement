"""Render 5 PR news templates (1240x1754) + templates.json with locked slots.

Slots (headline / photos / body) are left empty on the template; the web app
draws headline, photos and body text into exactly these rectangles.
"""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent / "out"
OUT.mkdir(exist_ok=True)
W, H = 1240, 1754
SCHOOL = "โรงเรียนบ้านป่าเด็ง"
ADDRESS = "169 ม.2 ตำบลป่าเด็ง อำเภอแก่งกระจาน จังหวัดเพชรบุรี 76170"
FB = "Facebook : โรงเรียนบ้านป่าเด็ง"

BASE_CSS = f"""
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{W}px;height:{H}px;overflow:hidden}}
body{{position:relative;font-family:'Kanit','Noto Sans Thai',sans-serif;-webkit-font-smoothing:antialiased}}
.abs{{position:absolute}}
svg{{position:absolute;left:0;top:0}}
"""


def frame(slot, mat=12, radius=0, bg="#fff", shadow="0 10px 30px rgba(10,30,60,.18)", border="none"):
    """A mat/frame that sits just outside a slot rectangle."""
    x, y, w, h = slot["x"] - mat, slot["y"] - mat, slot["w"] + 2 * mat, slot["h"] + 2 * mat
    return (f'<div class="abs" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;'
            f'background:{bg};border-radius:{radius}px;box-shadow:{shadow};border:{border}"></div>')


def hole(slot, color):
    """Neutral fill inside the photo slot (photos cover it completely)."""
    return (f'<div class="abs" style="left:{slot["x"]}px;top:{slot["y"]}px;width:{slot["w"]}px;'
            f'height:{slot["h"]}px;background:{color}"></div>')


def dots(x, y, w, h, color, step=22, r=2.2, opacity=.35):
    pid = f"d{x}{y}"
    return (f'<svg width="{W}" height="{H}"><defs><pattern id="{pid}" width="{step}" height="{step}" patternUnits="userSpaceOnUse">'
            f'<circle cx="{step/2}" cy="{step/2}" r="{r}" fill="{color}" opacity="{opacity}"/></pattern></defs>'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#{pid})"/></svg>')


def petal_flower(cx, cy, r, color, petals=8, opacity=1, center=None):
    import math
    out = []
    for i in range(petals):
        a = 360 / petals * i
        out.append(f'<ellipse cx="{cx}" cy="{cy - r*0.55}" rx="{r*0.28}" ry="{r*0.55}" fill="{color}" opacity="{opacity}" transform="rotate({a} {cx} {cy})"/>')
    out.append(f'<circle cx="{cx}" cy="{cy}" r="{r*0.22}" fill="{center or color}"/>')
    return "".join(out)


def leaf(cx, cy, l, angle, color, opacity=1):
    return (f'<path d="M{cx},{cy} q{l*0.45},{-l*0.32} {l},0 q{-l*0.45},{l*0.32} {-l},0z" fill="{color}" opacity="{opacity}" '
            f'transform="rotate({angle} {cx} {cy})"/>'
            f'<path d="M{cx},{cy} l{l},0" stroke="rgba(255,255,255,.35)" stroke-width="2" transform="rotate({angle} {cx} {cy})"/>')


def footer(y, h, bg, fg, accent):
    return f"""
<div class="abs" style="left:0;top:{y}px;width:{W}px;height:{h}px;background:{bg}"></div>
<div class="abs" style="left:0;top:{y}px;width:{W}px;height:5px;background:{accent}"></div>
<div class="abs" style="left:80px;top:{y+22}px;width:{W-160}px;display:flex;justify-content:space-between;align-items:center;color:{fg};font-size:21px;font-weight:300;letter-spacing:.2px">
  <span>{ADDRESS}</span><span style="font-weight:400">{FB}</span></div>"""


# ---------------------------------------------------------------- templates
def t_navy():
    s = dict(headline=dict(x=80, y=372, w=1080, size=44, color="#0f2f5e"),
             photos=dict(x=80, y=520, w=1080, h=650, layout="hero"),
             body=dict(x=104, y=1236, w=1032, h=360, size=30, color="#1e2c42"))
    gold = "#d9b45a"
    html = f"""
<div class="abs" style="inset:0;background:#f4f7fc"></div>
{dots(0, 330, W, 1320, '#9fb3d1', step=26, r=1.6, opacity=.45)}
<svg width="{W}" height="340"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
<stop offset="0" stop-color="#0c2650"/><stop offset="1" stop-color="#173f7c"/></linearGradient></defs>
<rect width="{W}" height="330" fill="url(#g)"/>
<polygon points="820,0 1240,0 1240,330 1010,330" fill="#ffffff" opacity=".05"/>
<polygon points="930,0 1240,0 1240,330 1120,330" fill="#ffffff" opacity=".06"/>
<rect x="0" y="322" width="{W}" height="8" fill="{gold}"/>
<rect x="0" y="334" width="{W}" height="2" fill="{gold}" opacity=".7"/></svg>
<div class="abs" style="left:80px;top:46px;padding:8px 26px;border-radius:40px;background:{gold};color:#0c2650;font-size:24px;font-weight:600">{SCHOOL}</div>
<div class="abs" style="left:78px;top:100px;color:#fff;font-size:100px;font-weight:700;line-height:1.1;letter-spacing:-1px">จดหมายข่าว</div>
<div class="abs" style="left:80px;top:212px;color:{gold};font-size:58px;font-weight:500;line-height:1.1">ประชาสัมพันธ์</div>
<div class="abs" style="right:80px;top:250px;color:#c7d4ea;font-size:18px;font-weight:300;letter-spacing:6px">SCHOOL NEWSLETTER</div>
<div class="abs" style="left:80px;top:354px;width:120px;height:4px;background:{gold}"></div>
{frame(s['photos'], mat=12, bg='#fff')}
<div class="abs" style="left:{s['photos']['x']-12}px;top:{s['photos']['y']-12}px;width:{s['photos']['w']+24}px;height:{s['photos']['h']+24}px;border:2px solid {gold}"></div>
{hole(s['photos'], '#dde5f1')}
<div class="abs" style="left:80px;top:1212px;width:1080px;height:408px;background:#fff;border-radius:6px;box-shadow:0 6px 22px rgba(12,38,80,.10);border-left:6px solid #0f2f5e"></div>
{footer(1654, 100, '#0c2650', '#dbe4f3', gold)}"""
    return "navy-official.png", "น้ำเงินทอง · ทางการ", s, html


def t_sky():
    s = dict(headline=dict(x=96, y=380, w=1048, size=44, color="#0b4a96"),
             photos=dict(x=96, y=520, w=1048, h=640, layout="grid"),
             body=dict(x=120, y=1226, w=1000, h=360, size=30, color="#1d3557"))
    clouds = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" opacity="{o}"/>' for x, y, r, o in [
        (60, 300, 70, .9), (140, 320, 60, .9), (1120, 60, 80, .35), (1190, 120, 60, .3), (980, 40, 40, .25)])
    html = f"""
<svg width="{W}" height="{H}"><defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e8fe6"/><stop offset=".55" stop-color="#7cc4ff"/><stop offset="1" stop-color="#d9f0ff"/></linearGradient></defs>
<rect width="{W}" height="{H}" fill="url(#sky)"/>
{clouds}
<path d="M0,1600 C200,1560 360,1640 620,1600 S1040,1560 1240,1610 L1240,1754 L0,1754Z" fill="#ffffff" opacity=".55"/>
<path d="M0,1640 C240,1600 420,1680 680,1640 S1060,1610 1240,1650 L1240,1754 L0,1754Z" fill="#ffd23f"/>
</svg>
{dots(0, 0, W, 340, '#ffffff', step=30, r=2, opacity=.25)}
<div class="abs" style="left:0;width:{W}px;top:50px;text-align:center;color:#fff;font-size:104px;font-weight:700;line-height:1.05;text-shadow:0 6px 0 #0b4a96, 0 10px 24px rgba(0,40,100,.35)">จดหมายข่าว</div>
<div class="abs" style="left:50%;transform:translateX(-50%) rotate(-2deg);top:178px;background:#ffd23f;color:#0b4a96;font-size:54px;font-weight:600;padding:2px 46px 6px;border-radius:16px;box-shadow:0 8px 0 #e3a800">ประชาสัมพันธ์</div>
<div class="abs" style="left:50%;transform:translateX(-50%);top:280px;background:#0b4a96;color:#fff;font-size:28px;font-weight:500;padding:4px 34px 6px;border-radius:40px">{SCHOOL}</div>
<div class="abs" style="left:64px;top:352px;width:1112px;height:1250px;background:#fff;border-radius:40px;box-shadow:0 18px 40px rgba(11,74,150,.22)"></div>
<div class="abs" style="left:78px;top:366px;width:1084px;height:1222px;border-radius:30px;border:3px dashed #b5dcff"></div>
{hole(s['photos'], '#e3f2ff')}
<div class="abs" style="left:96px;top:1196px;width:1048px;height:2px;background:repeating-linear-gradient(90deg,#ffd23f 0 18px,transparent 18px 30px)"></div>
<div class="abs" style="left:0;top:1676px;width:{W}px;text-align:center;color:#0b4a96;font-size:21px;font-weight:400">{ADDRESS} · {FB}</div>"""
    return "sky-bright.png", "ฟ้าใส · สดใส", s, html


def t_cream():
    gold, brown = "#b8893b", "#6b4a1e"
    s = dict(headline=dict(x=110, y=392, w=1020, size=42, color=brown),
             photos=dict(x=110, y=532, w=1020, h=630, layout="hero"),
             body=dict(x=110, y=1214, w=1020, h=370, size=30, color="#3f3326"))
    fl = "".join(petal_flower(cx, cy, r, c, 8, o, cc) for cx, cy, r, c, o, cc in [
        (70, 70, 120, "#f3d9a4", .9, gold), (190, 40, 60, "#f7c9c9", .9, gold), (40, 200, 50, "#f7c9c9", .8, gold),
        (1170, 1680, 120, "#f3d9a4", .9, gold), (1050, 1712, 60, "#f7c9c9", .9, gold), (1200, 1550, 50, "#f7c9c9", .8, gold),
        (1190, 80, 44, "#f3d9a4", .8, gold), (50, 1690, 44, "#f3d9a4", .8, gold)])
    html = f"""
<div class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 30%,#fffaf0 0%,#f6ead2 100%)"></div>
{dots(0, 0, W, H, '#c9a868', step=34, r=1.4, opacity=.35)}
<div class="abs" style="left:44px;top:44px;right:44px;bottom:44px;border:3px solid {gold}"></div>
<div class="abs" style="left:56px;top:56px;right:56px;bottom:56px;border:1px solid {gold};opacity:.7"></div>
<svg width="{W}" height="{H}">{fl}</svg>
<div class="abs" style="left:0;width:{W}px;top:104px;text-align:center;color:{gold};font-size:22px;font-weight:300;letter-spacing:10px">BAN PA DENG SCHOOL</div>
<div class="abs" style="left:0;width:{W}px;top:140px;text-align:center;font-family:Mitr;color:{brown};font-size:92px;font-weight:600;line-height:1.1">จดหมายข่าว</div>
<div class="abs" style="left:0;width:{W}px;top:250px;text-align:center;font-family:Mitr;color:{gold};font-size:48px;font-weight:400">ประชาสัมพันธ์ · {SCHOOL}</div>
<div class="abs" style="left:420px;top:340px;width:400px;height:2px;background:linear-gradient(90deg,transparent,{gold},transparent)"></div>
<svg width="{W}" height="{H}">{petal_flower(620, 341, 26, '#f3d9a4', 6, 1, gold)}</svg>
{frame(s['photos'], mat=14, bg='#fffdf8', shadow='0 10px 26px rgba(107,74,30,.20)', border=f'1px solid {gold}')}
{hole(s['photos'], '#efe2c6')}
<div class="abs" style="left:110px;top:1190px;width:1020px;height:1px;background:{gold}"></div>
<div class="abs" style="left:0;width:{W}px;top:1612px;text-align:center;color:{brown};font-size:20px;font-weight:300">{ADDRESS} · {FB}</div>"""
    return "cream-gold.png", "ครีมทอง · ดอกไม้", s, html


def t_forest():
    s = dict(headline=dict(x=96, y=388, w=1048, size=44, color="#14523f"),
             photos=dict(x=96, y=530, w=1048, h=640, layout="grid"),
             body=dict(x=120, y=1232, w=1000, h=360, size=30, color="#21352d"))
    leaves = "".join(leaf(x, y, l, a, c, o) for x, y, l, a, c, o in [
        (1240, 40, 230, 160, "#2f8a5c", .9), (1240, 140, 200, 195, "#4fae6f", .9), (1130, 0, 170, 120, "#7cc77e", .85),
        (0, 260, 200, -20, "#4fae6f", .7), (0, 320, 160, 15, "#2f8a5c", .6),
        (1240, 1600, 220, 200, "#4fae6f", .9), (0, 1640, 220, -15, "#2f8a5c", .9), (60, 1754, 180, -60, "#7cc77e", .85)])
    html = f"""
<div class="abs" style="inset:0;background:linear-gradient(180deg,#eef8f0 0%,#e2f2e6 100%)"></div>
{dots(0, 340, W, 1300, '#7cc77e', step=28, r=1.6, opacity=.35)}
<svg width="{W}" height="{H}"><defs><linearGradient id="fg" x1="0" x2="1"><stop offset="0" stop-color="#0f4a37"/><stop offset="1" stop-color="#1f7a52"/></linearGradient></defs>
<path d="M0,0 H{W} V300 C1000,360 760,300 620,330 C420,372 200,320 0,350Z" fill="url(#fg)"/>
<path d="M0,350 C200,320 420,372 620,330 C760,300 1000,360 {W},300 V316 C1000,376 760,316 620,346 C420,388 200,336 0,366Z" fill="#c9e86b"/>
{leaves}</svg>
<div class="abs" style="left:84px;top:52px;color:#c9e86b;font-size:26px;font-weight:500;letter-spacing:1px">{SCHOOL}</div>
<div class="abs" style="left:80px;top:90px;color:#fff;font-size:98px;font-weight:700;line-height:1.08">จดหมายข่าว</div>
<div class="abs" style="left:84px;top:204px;color:#e9f7d1;font-size:54px;font-weight:400">ประชาสัมพันธ์</div>
{frame(dict(x=96, y=530, w=1048, h=640), mat=14, radius=18, bg='#fff', shadow='0 12px 30px rgba(15,74,55,.18)')}
{hole(s['photos'], '#d7ecdc')}
<div class="abs" style="left:96px;top:1208px;width:1048px;height:408px;background:#fff;border-radius:18px;box-shadow:0 8px 24px rgba(15,74,55,.12)"></div>
<div class="abs" style="left:96px;top:1208px;width:10px;height:408px;background:#c9e86b;border-radius:18px 0 0 18px"></div>
{footer(1660, 94, '#0f4a37', '#e2f2e6', '#c9e86b')}"""
    return "forest-green.png", "เขียวป่าเด็ง · ธรรมชาติ", s, html


def t_violet():
    gold = "#e2c27a"
    s = dict(headline=dict(x=96, y=392, w=1048, size=44, color="#4b2a7b"),
             photos=dict(x=96, y=530, w=1048, h=630, layout="hero"),
             body=dict(x=120, y=1226, w=1000, h=360, size=30, color="#2e2342"))
    curtain = "".join(f'<path d="M{x},0 q{-18 if i%2 else 18},{180} 0,{360} q{18 if i%2 else -18},120 0,{0}" stroke="#ffffff" stroke-opacity=".08" stroke-width="18" fill="none"/>' for i, x in enumerate(range(20, W, 46)))
    fl = "".join(petal_flower(cx, cy, r, c, 10, o, gold) for cx, cy, r, c, o in [
        (40, 1620, 90, "#c9a7f0", .9), (150, 1700, 60, "#e8d6ff", .9), (1200, 1640, 90, "#c9a7f0", .9), (1090, 1714, 56, "#e8d6ff", .9)])
    html = f"""
<div class="abs" style="inset:0;background:linear-gradient(180deg,#f6f0ff 0%,#efe5fd 100%)"></div>
{dots(0, 360, W, 1300, '#b79be0', step=26, r=1.5, opacity=.35)}
<svg width="{W}" height="{H}"><defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b1d6e"/><stop offset="1" stop-color="#6a3fb0"/></linearGradient></defs>
<rect width="{W}" height="340" fill="url(#vg)"/>{curtain}
<path d="M0,340 Q{W/4},392 {W/2},346 T{W},340 V340 H0Z" fill="url(#vg)"/>
<path d="M0,336 Q{W/4},388 {W/2},342 T{W},336" stroke="{gold}" stroke-width="5" fill="none"/>
<path d="M0,348 Q{W/4},400 {W/2},354 T{W},348" stroke="{gold}" stroke-width="1.5" fill="none" opacity=".8"/>
{fl}</svg>
<div class="abs" style="left:0;width:{W}px;top:46px;text-align:center;color:{gold};font-size:26px;font-weight:400;letter-spacing:.5px">{SCHOOL}</div>
<div class="abs" style="left:0;width:{W}px;top:84px;text-align:center;font-family:Mitr;color:#fff;font-size:96px;font-weight:600;line-height:1.1">จดหมายข่าว</div>
<div class="abs" style="left:0;width:{W}px;top:200px;text-align:center;font-family:Mitr;color:{gold};font-size:52px;font-weight:400">ประชาสัมพันธ์</div>
{frame(s['photos'], mat=12, radius=10, bg='#fff', shadow='0 12px 30px rgba(59,29,110,.22)')}
<div class="abs" style="left:{96-12}px;top:{530-12}px;width:{1048+24}px;height:{630+24}px;border-radius:10px;border:2px solid {gold}"></div>
{hole(s['photos'], '#e6dbf7')}
<div class="abs" style="left:96px;top:1202px;width:1048px;height:408px;background:rgba(255,255,255,.92);border-radius:14px;box-shadow:0 8px 24px rgba(59,29,110,.12);border-top:5px solid {gold}"></div>
<div class="abs" style="left:0;width:{W}px;top:1648px;text-align:center;color:#4b2a7b;font-size:20px;font-weight:400">{ADDRESS} · {FB}</div>"""
    return "violet-ceremony.png", "ม่วงทอง · งานพิธี", s, html


TEMPLATES = [t_navy, t_sky, t_cream, t_forest, t_violet]


def build(preview=False):
    cfg = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        for fn in TEMPLATES:
            file, name, slots, html = fn()
            guides = ""
            if preview:  # draw slot outlines to check placement
                for k, c in (("headline", "#e11"), ("photos", "#1a1"), ("body", "#11e")):
                    sl = slots[k]; h = sl["h"] if "h" in sl else int(sl["size"] * 1.45 * 2)
                    guides += f'<div class="abs" style="left:{sl["x"]}px;top:{sl["y"]}px;width:{sl["w"]}px;height:{h}px;outline:3px dashed {c};z-index:9"></div>'
            pg.set_content(f"<!doctype html><html><head><meta charset='utf-8'><style>{BASE_CSS}</style></head><body>{html}{guides}</body></html>")
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(150)
            target = OUT / (("guide-" if preview else "") + file)
            pg.screenshot(path=str(target), clip={"x": 0, "y": 0, "width": W, "height": H})
            cfg.append({"file": file, "name": name, **slots})
        b.close()
    if not preview:
        (OUT / "templates.json").write_text(json.dumps({"templates": cfg}, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    build(preview="--guides" in sys.argv)
