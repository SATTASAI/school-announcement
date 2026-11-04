import json,base64,glob
from pathlib import Path
from playwright.sync_api import sync_playwright
cfg=json.loads(Path('out/templates.json').read_text())['templates']
refs=sorted(glob.glob('/home/claude/ref/annoucement/*.jpg'))
from PIL import Image
import io
def crop(f,box):
    im=Image.open(f).convert('RGB');w,h=im.size;im=im.crop((int(box[0]*w),int(box[1]*h),int(box[2]*w),int(box[3]*h)))
    b=io.BytesIO();im.save(b,'JPEG',quality=80);return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
photos=[crop(refs[1],(.1,.38,.9,.58)),crop(refs[1],(.1,.6,.36,.7)),crop(refs[22],(.52,.22,.97,.34)),crop(refs[28],(.18,.47,.48,.6))]
head='ประชุมผู้ปกครองนักเรียน ภาคเรียนที่ 2 ปีการศึกษา 2569 เพื่อชี้แจงแนวทางการจัดการเรียนรู้'
body=('วันที่ 2 พฤศจิกายน 2569 โรงเรียนบ้านป่าเด็ง จัดประชุมผู้ปกครองนักเรียน ภาคเรียนที่ 2 ปีการศึกษา 2569 '
'เพื่อชี้แจงแนวทางการจัดการเรียนการสอน การดูแลช่วยเหลือนักเรียน และสร้างความร่วมมือระหว่างบ้านกับโรงเรียน '
'ในการพัฒนาคุณภาพผู้เรียนอย่างรอบด้าน โดยมีผู้ปกครองเข้าร่วมเป็นจำนวนมาก ณ หอประชุมโรงเรียนบ้านป่าเด็ง')
def html(t):
    img=base64.b64encode(Path('out/'+t['file']).read_bytes()).decode()
    p=t['photos'];g=14;cells=[]
    if p['layout']=='grid':
        w=(p['w']-g)/2;h=(p['h']-g)/2
        for i in range(4):cells.append((p['x']+(i%2)*(w+g),p['y']+(i//2)*(h+g),w,h))
    else:
        hh=round(p['h']*.64);sh=p['h']-hh-g;w=(p['w']-2*g)/3
        cells.append((p['x'],p['y'],p['w'],hh))
        for i in range(3):cells.append((p['x']+i*(w+g),p['y']+hh+g,w,sh))
    im=''.join(f'<img src="{photos[i]}" style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;object-fit:cover">' for i,(x,y,w,h) in enumerate(cells))
    hd,bd=t['headline'],t['body']
    return f'''<html><head><meta charset=utf-8><style>*{{margin:0}}body{{width:1240px;height:1754px;position:relative;font-family:'Noto Sans Thai'}}</style></head><body>
<img src="data:image/png;base64,{img}" style="position:absolute;inset:0;width:1240px">{im}
<div style="position:absolute;left:{hd['x']}px;top:{hd['y']}px;width:{hd['w']}px;font-weight:700;font-size:{hd['size']}px;line-height:1.45;color:{hd['color']}">{head}</div>
<div style="position:absolute;left:{bd['x']}px;top:{bd['y']}px;width:{bd['w']}px;height:{bd['h']}px;font-size:{bd['size']}px;line-height:1.55;color:{bd['color']}">{body}</div></body></html>'''
with sync_playwright() as pw:
    b=pw.chromium.launch();pg=b.new_page(viewport={'width':1240,'height':1754})
    shots=[]
    for t in cfg:
        pg.set_content(html(t));pg.evaluate('document.fonts.ready');pg.wait_for_timeout(100)
        f=f'out/preview-{t["file"]}';pg.screenshot(path=f);shots.append(f)
    b.close()
W,H=496,702;s=Image.new('RGB',(W*5+40,H),'white')
for i,f in enumerate(shots):s.paste(Image.open(f).convert('RGB').resize((W,H)),(i*(W+10),0))
s.save('out/preview-all.jpg',quality=88)
