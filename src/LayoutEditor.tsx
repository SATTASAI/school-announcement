import {useEffect,useRef,useState} from 'react';
import {X,Move,Maximize2,Save,RotateCcw,Crop as CropIcon} from 'lucide-react';
import {getNewsLayout,png,isTemplateLocked} from '../lib/news-render';
import {clamp,safeRect,safeCrop,type PageLayout,type Rect,type TextSlot,type DirectorProfile,type Crop} from '../lib/design-layout';
type Part='headline'|'body'|'director'|`photo:${number}`;
type EditableNews={id:string;theme:string;selected:number[];headline:string;body:string;layout?:PageLayout;crop?:Record<string,Crop>};
const box=(layout:PageLayout,key:Part):Rect=>key.startsWith('photo:')?layout.photos[Number(key.split(':')[1])]:layout[key as 'headline'|'body'|'director'];
function withBox(layout:PageLayout,key:Part,value:Rect):PageLayout{
 if(key.startsWith('photo:'))return {...layout,photos:layout.photos.map((r,i)=>i===Number(key.split(':')[1])?value:r)};
 return {...layout,[key]:{...layout[key as 'headline'|'body'|'director'],...value}};
}
export default function LayoutEditor({news,school,director,onClose,onApply,onSave}:{news:EditableNews;school:string;director:DirectorProfile;onClose:()=>void;onApply:(layout:PageLayout,crop:Record<string,Crop>)=>void;onSave:(layout:PageLayout,name:string)=>void}){
 const locked=isTemplateLocked(news.theme);
 const [layout,setLayout]=useState<PageLayout>(()=>getNewsLayout(news)),[crops,setCrops]=useState<Record<string,Crop>>(news.crop||{}),[part,setPart]=useState<Part>('headline'),[mode,setMode]=useState<'move'|'crop'>('move');
 const [src,setSrc]=useState(''),[error,setError]=useState(''),[name,setName]=useState(''),[rendering,setRendering]=useState(false);
 const sheet=useRef<HTMLDivElement>(null);
 const drag=useRef<{part:Part;x:number;y:number;rect:Rect;mode:'move'|'resize'|'crop';crop:Crop;id:number}|null>(null);
 useEffect(()=>{let cancelled=false,url='';setRendering(true);const timer=setTimeout(async()=>{try{const blob=await png({...news,layout,crop:crops},school,director);if(cancelled)return;url=URL.createObjectURL(blob);setSrc(url);setError('');}catch(e){if(!cancelled)setError((e as Error).message);}finally{if(!cancelled)setRendering(false);}},180);return()=>{cancelled=true;clearTimeout(timer);if(url)URL.revokeObjectURL(url);};},[layout,crops,news,school,director]);
 const current=box(layout,part),textPart=part==='headline'||part==='body',selectedText=textPart?layout[part as 'headline'|'body']:null;
 const photoIndex=part.startsWith('photo:')?Number(part.split(':')[1]):-1,photoId=news.selected[photoIndex],crop=safeCrop(crops[photoId]);
 const updateRect=(key:Part,changes:Partial<Rect>)=>!locked&&setLayout(l=>withBox(l,key,safeRect({...box(l,key),...changes},box(l,key))));
 const updateText=(changes:Partial<TextSlot>)=>{if(textPart&&!locked)setLayout(l=>({...l,[part]:{...l[part as 'headline'|'body'],...changes}}));};
 const start=(ev:React.PointerEvent,key:Part,resize=false)=>{
  ev.preventDefault();ev.stopPropagation();setPart(key);ev.currentTarget.setPointerCapture(ev.pointerId);
  const i=key.startsWith('photo:')?Number(key.split(':')[1]):-1;
  if(locked&&(!key.startsWith('photo:')||resize))return;
  drag.current={part:key,x:ev.clientX,y:ev.clientY,rect:{...box(layout,key)},mode:resize?'resize':(locked||mode==='crop')&&i>=0?'crop':'move',crop:safeCrop(crops[news.selected[i]]),id:news.selected[i]};
 };
 const move=(ev:React.PointerEvent)=>{
  const d=drag.current;if(!d||!sheet.current)return;
  const scale=1240/sheet.current.getBoundingClientRect().width,dx=(ev.clientX-d.x)*scale,dy=(ev.clientY-d.y)*scale;
  if(d.mode==='crop')setCrops(c=>({...c,[d.id]:safeCrop({...d.crop,x:d.crop.x-dx/d.rect.w*2,y:d.crop.y-dy/d.rect.h*2})}));
  else updateRect(d.part,d.mode==='resize'?{w:Math.max(40,d.rect.w+dx),h:Math.max(40,d.rect.h+dy)}:{x:clamp(d.rect.x+dx,0,1240-d.rect.w),y:clamp(d.rect.y+dy,0,1754-d.rect.h)});
 };
 const keys:Part[]=['headline','body','director',...layout.photos.map((_,i)=>`photo:${i}` as Part)];
 const label=(key:Part)=>key==='headline'?'พาดหัว':key==='body'?'เนื้อข่าว':key==='director'?'รูป ผอ.':'ภาพ '+(Number(key.split(':')[1])+1);
 return <div className="overlay design-overlay"><section className="design-modal" role="dialog" aria-modal="true" aria-label="ปรับแต่งแม่แบบ"><header className="design-top"><div><h2>ปรับแต่งแม่แบบ</h2><p>{locked?'ล็อกตำแหน่งและขนาด · เลือกกรอบภาพเพื่อเลื่อนและซูมภาพภายใน':'ลากย้าย · ดึงมุมเพื่อปรับขนาด · ใช้ลูกศรขยับทีละนิด'}</p></div><button className="icon-button" onClick={onClose} aria-label="ปิดตัวแก้ไข"><X/></button></header>
 <div className="design-content"><div className="design-canvas-wrap"><div className="canvas-status">{rendering?'กำลังปรับตัวอย่าง…':'ตัวอย่างตรงกับไฟล์ส่งออก'}<span>1240 × 1754</span></div><div ref={sheet} className="canvas-sheet" onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
 {src?<img src={src} alt="ตัวอย่างแม่แบบที่กำลังปรับแต่ง" draggable={false}/>:<div className="canvas-loading">กำลังโหลดตัวอย่าง…</div>}
 {keys.map(key=>{const r=box(layout,key);return <div role="button" tabIndex={0} aria-label={(locked?'เลือก':'ย้าย')+label(key)} aria-pressed={part===key} key={key} className={'drag-box '+(part===key?'selected':'')} style={{left:r.x/12.4+'%',top:r.y/17.54+'%',width:r.w/12.4+'%',height:r.h/17.54+'%'}} onPointerDown={ev=>start(ev,key)} onKeyDown={ev=>{const n=ev.shiftKey?10:1;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key)){ev.preventDefault();setPart(key);updateRect(key,{x:clamp(r.x+(ev.key==='ArrowRight'?n:ev.key==='ArrowLeft'?-n:0),0,1240-r.w),y:clamp(r.y+(ev.key==='ArrowDown'?n:ev.key==='ArrowUp'?-n:0),0,1754-r.h)});}}}><span>{label(key)}</span>{part===key&&!locked&&<button className="resize-handle" aria-label={'ปรับขนาด'+label(key)} onPointerDown={ev=>start(ev,key,true)}><Maximize2 size={12}/></button>}</div>;})}
 </div>{error&&<p className="error">{error}</p>}</div>
 <aside className="design-controls"><label className="field">องค์ประกอบ<select value={part} onChange={e=>setPart(e.target.value as Part)}>{keys.map(key=><option key={key} value={key}>{label(key)}</option>)}</select></label>
 <div className="position-grid">{(['x','y','w','h'] as const).map(key=><label className="field" key={key}>{{x:'ตำแหน่ง X',y:'ตำแหน่ง Y',w:'ความกว้าง',h:'ความสูง'}[key]}<input disabled={locked} type="number" value={Math.round(current[key])} min={key==='w'||key==='h'?40:0} max={key==='x'||key==='w'?1240:1754} onChange={e=>{if(e.target.value!=='')updateRect(part,{[key]:Number(e.target.value)});}}/></label>)}</div>
 {selectedText&&<><label className="field">ขนาดตัวอักษร<input disabled={locked} type="number" min={16} max={96} value={selectedText.size} onChange={e=>updateText({size:clamp(Number(e.target.value)||16,16,96)})}/></label><label className="field">แบบตัวอักษร<select disabled={locked} value={selectedText.font} onChange={e=>updateText({font:e.target.value as TextSlot['font']})}><option>Noto Sans Thai</option><option>Noto Serif Thai</option></select></label><label className="field">สีตัวอักษร<input disabled={locked} type="color" value={selectedText.color} onChange={e=>updateText({color:e.target.value})}/></label><div className="filter-pills">{(['left','center','right'] as const).map((a,i)=><button disabled={locked} key={a} className={selectedText.align===a?'active':''} onClick={()=>updateText({align:a})}>{['ชิดซ้าย','กึ่งกลาง','ชิดขวา'][i]}</button>)}</div></>}
 {photoIndex>=0&&<>{!locked&&<div className="filter-pills"><button className={mode==='move'?'active':''} onClick={()=>setMode('move')}><Move size={14}/>ย้ายกรอบ</button><button className={mode==='crop'?'active':''} onClick={()=>setMode('crop')}><CropIcon size={14}/>เลื่อนภาพ</button></div>}<label className="field">ซูมภาพ {crop.zoom.toFixed(1)}×<input type="range" min={1} max={4} step={.05} value={crop.zoom} onChange={e=>setCrops(c=>({...c,[photoId]:{...crop,zoom:Number(e.target.value)}}))}/></label>{(['x','y'] as const).map((axis,i)=><label key={axis} className="field">{i?'เลื่อนภาพแนวตั้ง':'เลื่อนภาพแนวนอน'}<input type="range" min={-1} max={1} step={.01} value={crop[axis]} onChange={e=>setCrops(c=>({...c,[photoId]:{...crop,[axis]:Number(e.target.value)}}))}/></label>)}<button className="secondary" onClick={()=>setCrops(c=>({...c,[photoId]:{x:0,y:0,zoom:1}}))}>คืนค่าครอปภาพนี้</button></>}
 <button className="secondary" onClick={()=>{setLayout(getNewsLayout({...news,layout:undefined}));setCrops({});}}><RotateCcw size={15}/>คืนค่าตำแหน่งแม่แบบ</button>
 {!locked&&<div className="save-personal"><label className="field">ชื่อแม่แบบใหม่<input maxLength={60} placeholder="เช่น ข่าวกิจกรรมแบบที่ชอบ" value={name} onChange={e=>setName(e.target.value)}/></label><button className="secondary" disabled={!name.trim()||!!error||rendering} onClick={()=>onSave(layout,name.trim())}><Save size={15}/>บันทึกเป็นแม่แบบใหม่</button><small>บันทึกบนอุปกรณ์นี้ ต้นฉบับยังอยู่ครบ</small></div>}
 </aside></div><footer className="design-bottom"><button className="secondary" onClick={onClose}>ยกเลิก</button><button className="primary" disabled={!!error||rendering} onClick={()=>onApply(layout,crops)}>ใช้กับข่าวนี้</button></footer>
 </section></div>;
}
