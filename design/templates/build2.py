"""Ornate set: same palettes and locked slots as build.py, richer patterning."""
import json, math, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from build import W, H, SCHOOL, ADDRESS, FB, BASE_CSS, OUT, frame, hole, dots, petal_flower, leaf, footer, \
    t_navy, t_sky, t_cream, t_forest, t_violet


def lattice(x, y, w, h, color, step=36, opacity=.18, sw=1.2):
    pid = f"l{x}{y}{step}"
    return (f'<svg width="{W}" height="{H}"><defs><pattern id="{pid}" width="{step}" height="{step}" patternUnits="userSpaceOnUse">'
            f'<path d="M{step/2},0 L{step},{step/2} L{step/2},{step} L0,{step/2}Z" fill="none" stroke="{color}" stroke-width="{sw}" opacity="{opacity}"/>'
            f'<circle cx="{step/2}" cy="{step/2}" r="{step*0.07}" fill="{color}" opacity="{opacity*1.6}"/></pattern></defs>'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#{pid})"/></svg>')


def diamond_band(x, y, length, color, size=10, gap=26, vertical=False, opacity=1):
    out = []
    n = int(length // gap)
    for i in range(n + 1):
        cx, cy = (x, y + i * gap) if vertical else (x + i * gap, y)
        out.append(f'<path d="M{cx},{cy-size} L{cx+size*.6},{cy} L{cx},{cy+size} L{cx-size*.6},{cy}Z" fill="{color}" opacity="{opacity}"/>')
        mx, my = (cx, cy + gap / 2) if vertical else (cx + gap / 2, cy)
        if i < n:
            out.append(f'<circle cx="{mx}" cy="{my}" r="{size*.22}" fill="{color}" opacity="{opacity}"/>')
    return "".join(out)


def rosette(cx, cy, r, color, ring=None, opacity=1):
    """Layered line-flower medallion."""
    s = []
    for k, rr in enumerate((r, r * .68, r * .4)):
        petals = 12 if k == 0 else 8
        for i in range(petals):
            a = 360 / petals * i + (15 if k == 1 else 0)
            s.append(f'<ellipse cx="{cx}" cy="{cy-rr*.55}" rx="{rr*.2}" ry="{rr*.5}" fill="none" stroke="{color}" stroke-width="{2 if k==0 else 1.6}" opacity="{opacity}" transform="rotate({a} {cx} {cy})"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{r*.13}" fill="{color}" opacity="{opacity}"/>')
    if ring:
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{r*1.08}" fill="none" stroke="{ring}" stroke-width="1.5" stroke-dasharray="2 6" opacity="{opacity}"/>')
    return "".join(s)


def scallop(y, color, r=18, flip=False):
    d = f"M0,{y} "
    x = 0
    while x < W:
        d += f"a{r},{r} 0 0 {0 if flip else 1} {2*r},0 "
        x += 2 * r
    d += f"L{W},{y} Z"
    return f'<path d="{d}" fill="{color}"/>'


def star(cx, cy, r, color, opacity=1):
    pts = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * .42
        a = math.pi / 5 * i - math.pi / 2
        pts.append(f"{cx+rr*math.cos(a):.1f},{cy+rr*math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{color}" opacity="{opacity}"/>'


def sparkle(cx, cy, r, color, opacity=1):
    return (f'<path d="M{cx},{cy-r} Q{cx+r*.15},{cy-r*.15} {cx+r},{cy} Q{cx+r*.15},{cy+r*.15} {cx},{cy+r} '
            f'Q{cx-r*.15},{cy+r*.15} {cx-r},{cy} Q{cx-r*.15},{cy-r*.15} {cx},{cy-r}Z" fill="{color}" opacity="{opacity}"/>')


def svg(inner):
    return f'<svg width="{W}" height="{H}">{inner}</svg>'


# ------------------------------------------------------------------ ornate set
def o_navy():
    _, _, s, _ = t_navy()
    gold, navy = "#d9b45a", "#0c2650"
    medal = rosette(1080, 160, 110, gold, ring=gold, opacity=.55) + rosette(1080, 160, 60, "#fff", opacity=.35)
    side = diamond_band(26, 380, 1250, gold, size=9, gap=30, vertical=True, opacity=.75) + diamond_band(W - 26, 380, 1250, gold, size=9, gap=30, vertical=True, opacity=.75)
    html = f"""
<div class="abs" style="inset:0;background:#f4f7fc"></div>
{lattice(48, 360, W-96, 1290, '#8ea6cb', step=40, opacity=.22)}
<svg width="{W}" height="{H}"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#0a2148"/><stop offset="1" stop-color="#1a4588"/></linearGradient></defs>
<rect width="{W}" height="330" fill="url(#g)"/></svg>
{lattice(0, 0, W, 330, gold, step=44, opacity=.16, sw=1)}
{svg(medal + scallop(330, navy, r=16) + f'<rect x="0" y="322" width="{W}" height="4" fill="{gold}"/>' + diamond_band(20, 352, W-40, gold, size=7, gap=24, opacity=.9) + side)}
<div class="abs" style="left:80px;top:46px;padding:8px 26px;border-radius:40px;background:{gold};color:{navy};font-size:24px;font-weight:600">{SCHOOL}</div>
<div class="abs" style="left:78px;top:100px;color:#fff;font-size:100px;font-weight:700;line-height:1.1;letter-spacing:-1px">จดหมายข่าว</div>
<div class="abs" style="left:80px;top:212px;color:{gold};font-size:58px;font-weight:500;line-height:1.1">ประชาสัมพันธ์</div>
{frame(s['photos'], mat=14, bg='#fff')}
<div class="abs" style="left:{s['photos']['x']-14}px;top:{s['photos']['y']-14}px;width:{s['photos']['w']+28}px;height:{s['photos']['h']+28}px;border:2px solid {gold};outline:1px solid {gold};outline-offset:5px"></div>
{svg(''.join(rosette(x, y, 22, gold) for x, y in [(66, 506), (W-66, 506), (66, 1184), (W-66, 1184)]))}
{hole(s['photos'], '#dde5f1')}
<div class="abs" style="left:80px;top:1212px;width:1080px;height:408px;background:#fff;border-radius:6px;box-shadow:0 6px 22px rgba(12,38,80,.10);border-left:6px solid #0f2f5e;border-right:6px solid #0f2f5e"></div>
{footer(1654, 100, navy, '#dbe4f3', gold)}
{svg(diamond_band(40, 1740, W-80, gold, size=5, gap=20, opacity=.6))}"""
    return "navy-ornate.png", "น้ำเงินทอง · ลายประจำยาม", s, html


def o_sky():
    _, _, s, _ = t_sky()
    cols = ["#ff6b6b", "#ffd23f", "#4ecdc4", "#ffffff", "#ff9f43", "#a29bfe"]
    flags = ""
    for row, (y0, sag) in enumerate([(6, 18), (30, 28)]):
        n = 15
        for i in range(n):
            t0, t1 = i / n, (i + 1) / n
            x0, x1 = t0 * W, t1 * W
            yy0 = y0 + sag * math.sin(math.pi * t0)
            yy1 = y0 + sag * math.sin(math.pi * t1)
            if row == 0:
                flags += f'<polygon points="{x0+6:.0f},{yy0:.0f} {x1-6:.0f},{yy1:.0f} {(x0+x1)/2:.0f},{(yy0+yy1)/2+30:.0f}" fill="{cols[i%len(cols)]}" opacity=".95"/>'
        if row == 0:
            flags += f'<path d="M0,{y0} Q{W/2},{y0+sag*2} {W},{y0}" stroke="#ffffff" stroke-width="2" fill="none"/>'
    rainbow = "".join(f'<path d="M{170+i*22},330 A{450-i*22},{250-i*14} 0 0 1 {1070-i*22},330" stroke="{c}" stroke-width="20" fill="none" opacity=".55"/>'
                      for i, c in enumerate(["#ff6b6b", "#ffb347", "#ffe66d", "#7bd389", "#6ec6ff"]))
    clouds = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" opacity="{o}"/>' for x, y, r, o in [
        (40, 300, 70, .95), (120, 322, 58, .95), (190, 336, 40, .95), (1200, 300, 70, .95), (1120, 322, 52, .95), (1060, 338, 36, .95)])
    sparks = "".join(sparkle(x, y, r, "#fff", .9) for x, y, r in [(90, 110, 16), (1150, 130, 20), (230, 200, 10), (1010, 210, 12)])
    margin = "".join(star(x, y, r, c, .9) for x, y, r, c in [(36, 700, 14, "#ffd23f"), (1204, 820, 14, "#ffd23f"), (34, 1100, 11, "#ffffff"), (1206, 1250, 11, "#ffffff"), (36, 1450, 14, "#ffd23f"), (1204, 560, 11, "#ffffff")])
    html = f"""
<svg width="{W}" height="{H}"><defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e8fe6"/><stop offset=".55" stop-color="#7cc4ff"/><stop offset="1" stop-color="#d9f0ff"/></linearGradient></defs>
<rect width="{W}" height="{H}" fill="url(#sky)"/>{rainbow}{clouds}{sparks}{flags}{margin}
<path d="M0,1600 C200,1560 360,1640 620,1600 S1040,1560 1240,1610 L1240,1754 L0,1754Z" fill="#ffffff" opacity=".55"/>
<path d="M0,1640 C240,1600 420,1680 680,1640 S1060,1610 1240,1650 L1240,1754 L0,1754Z" fill="#ffd23f"/>
{dots(0,0,1,1,'#fff')[0:0]}</svg>
{dots(0, 360, W, 1260, '#ffffff', step=26, r=2, opacity=.35)}
<div class="abs" style="left:0;width:{W}px;top:62px;text-align:center;color:#fff;font-size:100px;font-weight:700;line-height:1.05;text-shadow:0 6px 0 #0b4a96, 0 10px 24px rgba(0,40,100,.35)">จดหมายข่าว</div>
<div class="abs" style="left:50%;transform:translateX(-50%) rotate(-2deg);top:184px;background:#ffd23f;color:#0b4a96;font-size:52px;font-weight:600;padding:2px 46px 6px;border-radius:16px;box-shadow:0 8px 0 #e3a800">ประชาสัมพันธ์</div>
<div class="abs" style="left:50%;transform:translateX(-50%);top:282px;background:#0b4a96;color:#fff;font-size:28px;font-weight:500;padding:4px 34px 6px;border-radius:40px">{SCHOOL}</div>
<div class="abs" style="left:64px;top:352px;width:1112px;height:1250px;background:#fff;border-radius:40px;box-shadow:0 18px 40px rgba(11,74,150,.22)"></div>
<div class="abs" style="left:78px;top:366px;width:1084px;height:1222px;border-radius:30px;border:3px dashed #b5dcff"></div>
{svg(''.join(star(x, y, 9, c) for x, y, c in [(86, 372, '#ffd23f'), (1154, 372, '#ff6b6b'), (86, 1580, '#4ecdc4'), (1154, 1580, '#ffd23f')]))}
{hole(s['photos'], '#e3f2ff')}
{svg(''.join(f'<circle cx="{96+i*24}" cy="1197" r="4" fill="{cols[i%5]}"/>' for i in range(44)))}
<div class="abs" style="left:0;top:1676px;width:{W}px;text-align:center;color:#0b4a96;font-size:21px;font-weight:400">{ADDRESS} · {FB}</div>"""
    return "sky-ornate.png", "ฟ้าใส · ธงราวสายรุ้ง", s, html


def o_cream():
    _, _, s, _ = t_cream()
    gold, brown = "#b8893b", "#6b4a1e"

    def corner(cx, cy, rot):
        g = rosette(0, 0, 70, gold, opacity=.9) + "".join(
            petal_flower(dx, dy, r, c, 8, .95, gold) for dx, dy, r, c in [(95, 10, 46, "#f3d9a4"), (10, 95, 46, "#f7c9c9"), (150, 40, 26, "#f7c9c9"), (40, 150, 26, "#f3d9a4")])
        g += "".join(leaf(dx, dy, 60, a, "#9bb57a", .8) for dx, dy, a in [(70, 60, 20), (60, 70, 70)])
        return f'<g transform="translate({cx},{cy}) rotate({rot})">{g}</g>'
    chain = (diamond_band(70, 70, W-140, gold, size=6, gap=22, opacity=.8) + diamond_band(70, H-70, W-140, gold, size=6, gap=22, opacity=.8)
             + diamond_band(70, 70, H-140, gold, size=6, gap=22, vertical=True, opacity=.8) + diamond_band(W-70, 70, H-140, gold, size=6, gap=22, vertical=True, opacity=.8))
    garland = "".join(petal_flower(300 + i * 80, 1650 + 10 * math.sin(i), 20 if i % 2 else 26, "#f7c9c9" if i % 2 else "#f3d9a4", 8, .95, gold) for i in range(9))
    html = f"""
<div class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 30%,#fffaf0 0%,#f3e4c4 100%)"></div>
{lattice(0, 0, W, H, '#c9a868', step=46, opacity=.22)}
<div class="abs" style="left:44px;top:44px;right:44px;bottom:44px;border:3px solid {gold}"></div>
<div class="abs" style="left:82px;top:82px;right:82px;bottom:82px;border:1px solid {gold};opacity:.8"></div>
{svg(chain + corner(48, 48, 0) + corner(W-48, 48, 90) + corner(W-48, H-48, 180) + corner(48, H-48, 270) + garland)}
<div class="abs" style="left:0;width:{W}px;top:112px;text-align:center;color:{gold};font-size:22px;font-weight:300;letter-spacing:10px">BAN PA DENG SCHOOL</div>
<div class="abs" style="left:0;width:{W}px;top:146px;text-align:center;font-family:Mitr;color:{brown};font-size:90px;font-weight:600;line-height:1.1">จดหมายข่าว</div>
<div class="abs" style="left:0;width:{W}px;top:254px;text-align:center;font-family:Mitr;color:{gold};font-size:46px;font-weight:400">ประชาสัมพันธ์ · {SCHOOL}</div>
{svg(diamond_band(380, 344, 480, gold, size=6, gap=24) + rosette(620, 344, 18, gold))}
{frame(s['photos'], mat=16, bg='#fffdf8', shadow='0 10px 26px rgba(107,74,30,.20)', border=f'1px solid {gold}')}
<div class="abs" style="left:{s['photos']['x']-8}px;top:{s['photos']['y']-8}px;width:{s['photos']['w']+16}px;height:{s['photos']['h']+16}px;border:1px solid {gold}"></div>
{hole(s['photos'], '#efe2c6')}
{svg(diamond_band(110, 1192, 1020, gold, size=5, gap=20, opacity=.8))}
<div class="abs" style="left:0;width:{W}px;top:1596px;text-align:center;color:{brown};font-size:20px;font-weight:300">{ADDRESS} · {FB}</div>"""
    return "cream-ornate.png", "ครีมทอง · ดอกไม้ประดับมุม", s, html


def o_forest():
    _, _, s, _ = t_forest()
    lime = "#c9e86b"

    def hexes(color, opacity):
        out, r = [], 30
        for row in range(30):
            for col in range(15):
                cx = col * r * 1.75 * 1.0 + (r * .87 if row % 2 else 0)
                cy = 360 + row * r * 1.5
                if cy > 1660:
                    continue
                pts = " ".join(f"{cx + r*math.cos(math.radians(60*k+30)):.1f},{cy + r*math.sin(math.radians(60*k+30)):.1f}" for k in range(6))
                out.append(f'<polygon points="{pts}" fill="none" stroke="{color}" stroke-width="1" opacity="{opacity}"/>')
        return "".join(out)

    def vine(x, y0, y1, flip):
        d = f"M{x},{y0} " + " ".join(f"Q{x + (24 if (i % 2) ^ flip else -24)},{y0 + (i + .5) * 90} {x},{y0 + (i + 1) * 90}" for i in range(int((y1 - y0) // 90)))
        lv = "".join(leaf(x, y0 + i * 90 + 45, 34, (-30 if i % 2 else 210) + (180 if flip else 0), "#4fae6f", .85) for i in range(int((y1 - y0) // 90)))
        fl = "".join(petal_flower(x, y0 + i * 180 + 90, 9, "#ffffff", 5, .95, "#ffd23f") for i in range(int((y1 - y0) // 180)))
        return f'<path d="{d}" stroke="#2f8a5c" stroke-width="3" fill="none"/>{lv}{fl}'
    big = "".join(leaf(x, y, l, a, c, o) for x, y, l, a, c, o in [
        (1240, 40, 260, 160, "#2f8a5c", .95), (1240, 150, 220, 195, "#4fae6f", .95), (1120, 0, 190, 120, "#7cc77e", .9), (1240, 250, 150, 215, "#a6dc7a", .9),
        (0, 250, 220, -20, "#4fae6f", .8), (0, 320, 170, 15, "#2f8a5c", .7),
        (1240, 1590, 240, 200, "#4fae6f", .95), (1240, 1650, 180, 170, "#7cc77e", .9),
        (0, 1630, 240, -15, "#2f8a5c", .95), (60, 1754, 190, -60, "#7cc77e", .9), (0, 1560, 150, 20, "#a6dc7a", .85)])
    flowers = "".join(petal_flower(x, y, r, "#ffffff", 6, .95, "#ffd23f") for x, y, r in [(1150, 210, 16), (1190, 270, 11), (70, 1600, 14), (1170, 1560, 14)])
    html = f"""
<div class="abs" style="inset:0;background:linear-gradient(180deg,#eef8f0 0%,#ddf0e2 100%)"></div>
{svg(hexes('#7cc77e', .28))}
<svg width="{W}" height="{H}"><defs><linearGradient id="fg" x1="0" x2="1"><stop offset="0" stop-color="#0f4a37"/><stop offset="1" stop-color="#1f7a52"/></linearGradient></defs>
<path d="M0,0 H{W} V300 C1000,360 760,300 620,330 C420,372 200,320 0,350Z" fill="url(#fg)"/>
<path d="M0,350 C200,320 420,372 620,330 C760,300 1000,360 {W},300 V316 C1000,376 760,316 620,346 C420,388 200,336 0,366Z" fill="{lime}"/>
{vine(40, 420, 1560, 0)}{vine(W-40, 420, 1560, 1)}{big}{flowers}</svg>
{lattice(0, 0, W, 300, '#ffffff', step=40, opacity=.08)}
<div class="abs" style="left:84px;top:52px;color:{lime};font-size:26px;font-weight:500">{SCHOOL}</div>
<div class="abs" style="left:80px;top:90px;color:#fff;font-size:98px;font-weight:700;line-height:1.08">จดหมายข่าว</div>
<div class="abs" style="left:84px;top:204px;color:#e9f7d1;font-size:54px;font-weight:400">ประชาสัมพันธ์</div>
{frame(s['photos'], mat=14, radius=18, bg='#fff', shadow='0 12px 30px rgba(15,74,55,.18)')}
{hole(s['photos'], '#d7ecdc')}
<div class="abs" style="left:96px;top:1208px;width:1048px;height:408px;background:#fff;border-radius:18px;box-shadow:0 8px 24px rgba(15,74,55,.12)"></div>
<div class="abs" style="left:96px;top:1208px;width:10px;height:408px;background:{lime};border-radius:18px 0 0 18px"></div>
{footer(1660, 94, '#0f4a37', '#e2f2e6', lime)}"""
    return "forest-ornate.png", "เขียวป่าเด็ง · เถาวัลย์ใบไม้", s, html


def o_violet():
    _, _, s, _ = t_violet()
    gold = "#e2c27a"
    curtain = "".join(f'<path d="M{x},0 q{-18 if i%2 else 18},180 0,360" stroke="#ffffff" stroke-opacity=".08" stroke-width="18" fill="none"/>' for i, x in enumerate(range(20, W, 46)))
    swags = ""
    n = 6
    for i in range(n):
        x0, x1 = W / n * i, W / n * (i + 1)
        swags += f'<path d="M{x0},0 Q{(x0+x1)/2},120 {x1},0 Z" fill="#7c4fc4" opacity=".9"/>'
        swags += f'<path d="M{x0},0 Q{(x0+x1)/2},120 {x1},0" stroke="{gold}" stroke-width="4" fill="none"/>'
        swags += f'<path d="M{x0+14},0 Q{(x0+x1)/2},96 {x1-14},0" stroke="{gold}" stroke-width="1.5" fill="none" opacity=".8"/>'
    tassels = "".join(f'<g><circle cx="{W/n*i}" cy="14" r="9" fill="{gold}"/><path d="M{W/n*i-7},20 L{W/n*i+7},20 L{W/n*i+10},58 L{W/n*i-10},58Z" fill="{gold}"/></g>' for i in range(1, n))
    orchid = lambda cx, cy, r: petal_flower(cx, cy, r, "#c9a7f0", 5, .95, gold) + petal_flower(cx, cy, r * .55, "#efe1ff", 5, 1, gold)
    clusters = "".join(orchid(x, y, r) for x, y, r in [(40, 1610, 80), (140, 1690, 56), (30, 1500, 46), (1200, 1620, 80), (1100, 1700, 54), (1210, 1500, 46)])
    body = s['body']
    html = f"""
<div class="abs" style="inset:0;background:linear-gradient(180deg,#f6f0ff 0%,#ece0fc 100%)"></div>
{lattice(0, 360, W, 1300, '#b79be0', step=42, opacity=.26)}
<svg width="{W}" height="{H}"><defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b1d6e"/><stop offset="1" stop-color="#6a3fb0"/></linearGradient></defs>
<rect width="{W}" height="340" fill="url(#vg)"/>{curtain}{swags}{tassels}
<path d="M0,336 Q{W/4},388 {W/2},342 T{W},336" stroke="{gold}" stroke-width="5" fill="none"/>
<path d="M0,348 Q{W/4},400 {W/2},354 T{W},348" stroke="{gold}" stroke-width="1.5" fill="none" opacity=".8"/>
{clusters}{''.join(sparkle(x, y, r, gold, .9) for x, y, r in [(150, 250, 12), (1090, 250, 12), (210, 170, 8), (1030, 170, 8)])}</svg>
<div class="abs" style="left:0;width:{W}px;top:96px;text-align:center;color:{gold};font-size:26px;font-weight:400">{SCHOOL}</div>
<div class="abs" style="left:0;width:{W}px;top:126px;text-align:center;font-family:Mitr;color:#fff;font-size:92px;font-weight:600;line-height:1.1">จดหมายข่าว</div>
<div class="abs" style="left:0;width:{W}px;top:236px;text-align:center;font-family:Mitr;color:{gold};font-size:48px;font-weight:400">ประชาสัมพันธ์</div>
{frame(s['photos'], mat=12, radius=10, bg='#fff', shadow='0 12px 30px rgba(59,29,110,.22)')}
<div class="abs" style="left:84px;top:518px;width:1072px;height:654px;border-radius:10px;border:2px solid {gold}"></div>
{svg(''.join(rosette(x, y, 20, gold) for x, y in [(84, 518), (1156, 518), (84, 1172), (1156, 1172)]))}
{hole(s['photos'], '#e6dbf7')}
<div class="abs" style="left:96px;top:1202px;width:1048px;height:408px;background:rgba(255,255,255,.94);border-radius:14px;box-shadow:0 8px 24px rgba(59,29,110,.12);border-top:5px solid {gold}"></div>
{svg(diamond_band(130, 1600, 980, gold, size=5, gap=20, opacity=.8))}
<div class="abs" style="left:0;width:{W}px;top:1648px;text-align:center;color:#4b2a7b;font-size:20px;font-weight:400">{ADDRESS} · {FB}</div>"""
    return "violet-ornate.png", "ม่วงทอง · ระบายม่านพิธี", s, html


ORNATE = [o_navy, o_sky, o_cream, o_forest, o_violet]

if __name__ == "__main__":
    guides = "--guides" in sys.argv
    cfg = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": W, "height": H})
        for fn in ORNATE:
            file, name, slots, html = fn()
            g = ""
            if guides:
                for k, c in (("headline", "#e11"), ("photos", "#1a1"), ("body", "#11e")):
                    sl = slots[k]; h = sl["h"] if "h" in sl else int(sl["size"] * 1.45 * 2)
                    g += f'<div class="abs" style="left:{sl["x"]}px;top:{sl["y"]}px;width:{sl["w"]}px;height:{h}px;outline:3px dashed {c};z-index:9"></div>'
            pg.set_content(f"<!doctype html><html><head><meta charset='utf-8'><style>{BASE_CSS}</style></head><body>{html}{g}</body></html>")
            pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(150)
            pg.screenshot(path=str(OUT / (("guide-" if guides else "") + file)), clip={"x": 0, "y": 0, "width": W, "height": H})
            cfg.append({"file": file, "name": name, **slots})
        b.close()
    if not guides:
        (OUT / "templates-ornate.json").write_text(json.dumps({"templates": cfg}, ensure_ascii=False, indent=1), encoding="utf-8")
