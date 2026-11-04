import {toDataURL as qrDataUrl} from 'qrcode';
import {referenceTemplates,getReferenceTemplate} from './reference-templates.ts';
import {drawReferenceBackground} from './reference-art.ts';
import {DEFAULT_DIRECTOR,normaliseLayout,photoFrames,safeCrop,type PageLayout,type PersonalTemplate,type DirectorProfile,type PhotoPattern,type Rect,type Crop,type TextSlot} from './design-layout.ts';
export type Slot={x:number;y:number;w:number;h?:number;size?:number;color?:string;layout?:'hero'|'grid';pattern?:PhotoPattern};
export type DriveTemplate={id:string;name:string;fileId:string;headline:Slot;photos:Slot&{h:number};body:Slot&{h:number};photoCount?:number;director?:Rect};
export let driveTemplates:DriveTemplate[]=[];
let personalTemplates:PersonalTemplate[]=[];
export function setDriveTemplates(list:DriveTemplate[]){driveTemplates=Array.isArray(list)?list:[];}
export function setPersonalTemplates(list:PersonalTemplate[]){personalTemplates=Array.isArray(list)?list:[];}
export const themes=[{id:'blue',name:'น้ำเงิน · ทางการ',color:'#143d73',accent:'#e5b94d'},{id:'forest',name:'ป่าเด็ง · ธรรมชาติ',color:'#20584a',accent:'#d7bb77'},{id:'editorial',name:'ขาว · วารสาร',color:'#24354b',accent:'#648cb0'},...referenceTemplates];
const imageCache=new Map<string,Promise<HTMLImageElement>>();
const loadImage=(src:string,msg:string)=>{
 let cached=imageCache.get(src);if(cached)return cached;
 cached=new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{imageCache.delete(src);reject(Error(msg));};im.src=src;});
 if(imageCache.size>=40)imageCache.delete(imageCache.keys().next().value!);
 imageCache.set(src,cached);return cached;
};
export const isTemplateLocked=(id:string)=>!!getReferenceTemplate(templateSource(id));
export const templateCapacity=(id:string)=>getReferenceTemplate(templateSource(id))?.photoCount;
export function templateSource(id:string){return personalTemplates.find(t=>t.id===id)?.sourceTheme||id;}
function templateData(id:string){const source=templateSource(id);return driveTemplates.find(t=>t.id===source);}
export function getNewsLayout(n:{theme:string;selected:number[];layout?:PageLayout}):PageLayout{
 const t=templateData(n.theme),source=templateSource(n.theme);
 const fixed=getReferenceTemplate(source);if(fixed)return structuredClone({...fixed.layout,headline:{...fixed.layout.headline,color:fixed.id==='reference:04'?fixed.color:'#ffffff'}});
 const area=t?.photos||{x:65,y:450,w:1110,h:650,layout:source==='editorial'?'grid':'hero'};
 const h=t?.headline||{x:65,y:275,w:1110,size:42,color:themes.find(t=>t.id===source)?.color||'#143d73'};
 const b=t?.body||{x:65,y:1160,w:1110,h:470,size:28,color:'#27364a'};
 const text=(slot:Slot,height:number):TextSlot=>({x:slot.x,y:slot.y,w:slot.w,h:slot.h||height,size:slot.size||28,color:slot.color||'#27364a',align:'left',font:'Noto Sans Thai'});
 const headBottom=area.y>h.y?area.y:b.y;
 const base:PageLayout={headline:text(h,Math.max(60,Math.min(170,headBottom-h.y-24))),body:text(b,b.h||400),director:t?.director||{...DEFAULT_DIRECTOR},photos:photoFrames(area as Rect,n.selected.slice(0,6).length,(area as Slot).pattern||area.layout as PhotoPattern||'hero')};
 const custom=personalTemplates.find(t=>t.id===n.theme);
 return normaliseLayout(n.layout||custom?.layout,base);
}
function rounded(g:CanvasRenderingContext2D,r:Rect,radius=12){g.beginPath();g.roundRect(r.x,r.y,r.w,r.h,radius);}
function cover(g:CanvasRenderingContext2D,im:HTMLImageElement,r:Rect,raw?:Crop){
 const crop=safeCrop(raw),scale=Math.max(r.w/im.naturalWidth,r.h/im.naturalHeight)*crop.zoom;
 const sw=r.w/scale,sh=r.h/scale,sx=(im.naturalWidth-sw)*(crop.x+1)/2,sy=(im.naturalHeight-sh)*(crop.y+1)/2;
 g.save();g.beginPath();g.rect(r.x,r.y,r.w,r.h);g.clip();g.drawImage(im,sx,sy,sw,sh,r.x,r.y,r.w,r.h);g.restore();
}
function lines(g:CanvasRenderingContext2D,value:string,width:number){
 const out:string[]=[];
 for(const paragraph of String(value).split('\n')){
  let line='';
  for(const token of new Intl.Segmenter('th',{granularity:'word'}).segment(paragraph)){
   if(g.measureText(line+token.segment).width>width&&line){out.push(line);line='';}
   // Long URLs and unbroken words must also stay inside their frame.
   for(const char of token.segment){if(line&&g.measureText(line+char).width>width){out.push(line);line='';}line+=char;}
  }
  out.push(line);
 }
 return out;
}
function drawText(g:CanvasRenderingContext2D,value:string,s:TextSlot,bold=false,centerY=false){
 let size=s.size,wrapped:string[]=[];
 for(;size>=16;size--){g.font=`${bold?'bold ':''}${size}px "${s.font}",sans-serif`;wrapped=lines(g,value,s.w);if(wrapped.length*size*1.5<=s.h)break;}
 if(size<16)throw Error('ข้อความยาวเกินกรอบ กรุณาขยายกรอบ ลดขนาดตัวอักษร หรือย่อข้อความ');
 g.fillStyle=s.color;g.textBaseline='top';g.textAlign=s.align;
 const x=s.align==='center'?s.x+s.w/2:s.align==='right'?s.x+s.w:s.x;
 const y=s.y+(centerY?Math.max(0,(s.h-wrapped.length*size*1.5)/2):0);
 wrapped.forEach((line,i)=>g.fillText(line,x,y+i*size*1.5));g.textAlign='left';
}
async function drawDirector(g:CanvasRenderingContext2D,r:Rect,profile?:DirectorProfile){
 g.save();rounded(g,r,16);g.fillStyle='#fffdf8';g.fill();g.strokeStyle='#d4b879';g.lineWidth=3;g.stroke();
 const inset=Math.max(5,Math.min(9,r.w*.055));
 const imageRect={x:r.x+inset,y:r.y+inset,w:r.w-2*inset,h:r.h*.62};
 g.save();rounded(g,imageRect,10);g.clip();
 if(profile?.image)cover(g,await loadImage(profile.image,'โหลดรูป ผอ. ไม่สำเร็จ'),imageRect);
 else{g.fillStyle='#e8edf1';g.fillRect(imageRect.x,imageRect.y,imageRect.w,imageRect.h);g.fillStyle='#718193';g.font=`bold ${Math.min(31,r.w*.24)}px "Noto Sans Thai",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText('ผอ.',r.x+r.w/2,imageRect.y+imageRect.h/2);}
 g.restore();
 // Fit both lines inside the card, including long Thai names and titles.
 const width=r.w-2*inset, center=r.x+r.w/2, label=profile?.name?.trim()||'ผู้อำนวยการ';
 const title=profile?.name?.trim()?(profile.title?.trim()||'ผู้อำนวยการโรงเรียน'):'';
 const textTop=imageRect.y+imageRect.h+inset*.55, textBottom=r.y+r.h-inset*.55;
 const available=Math.max(0,textBottom-textTop), maxNameLines=title?2:2;
 let size=Math.min(20,r.w*.11,available/(title?3.2:2));let wrapped:string[]=[];
 for(;size>8;size-=.5){g.font=`bold ${size}px "Noto Sans Thai",sans-serif`;wrapped=lines(g,label,width);if(wrapped.length<=maxNameLines)break;}
 g.font=`bold ${size}px "Noto Sans Thai",sans-serif`;
 if(wrapped.length>maxNameLines){wrapped=wrapped.slice(0,maxNameLines);let last=wrapped[maxNameLines-1];const seg=Array.from(new Intl.Segmenter('th',{granularity:'grapheme'}).segment(last),x=>x.segment);while(seg.length&&g.measureText(seg.join('')+'…').width>width)seg.pop();wrapped[maxNameLines-1]=seg.join('')+'…';}
 const leading=size*1.18, titleSize=title?Math.min(size*.82,r.w*.082,available*.22):0;
 const total=wrapped.length*leading+(title?titleSize*1.25+2:0), y=textTop+Math.max(0,(available-total)/2);
 g.save();g.beginPath();g.rect(r.x+inset,textTop,width,available);g.clip();g.textAlign='center';g.textBaseline='top';g.fillStyle='#253445';
 wrapped.forEach((line,i)=>g.fillText(line,center,y+i*leading,width));
 if(title){g.fillStyle='#6c7480';g.font=`${titleSize}px "Noto Sans Thai",sans-serif`;g.fillText(title,center,y+wrapped.length*leading+2,width);}
 g.restore();
 g.restore();
}
export async function renderNews(n:any,school:string,director?:DirectorProfile){
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;const g=canvas.getContext('2d')!;
 const source=templateSource(n.theme),t=templateData(n.theme),reference=getReferenceTemplate(source);
 if(source.startsWith('drive:')&&!t)throw Error('แม่แบบยังโหลดไม่เสร็จหรือไม่พบแล้ว กรุณาโหลดแม่แบบใหม่');
 g.fillStyle='#fff';g.fillRect(0,0,1240,1754);
 if(reference)drawReferenceBackground(g,reference,school,n.date||'');
 else if(t)g.drawImage(await loadImage('/api/pr/template/'+t.fileId,'โหลดแม่แบบจาก Google Drive ไม่สำเร็จ'),0,0,1240,1754);
 else{
  const theme=themes.find(t=>t.id===source)||themes[0];
  g.fillStyle=source==='forest'?'#f7f7ef':'#fff';g.fillRect(0,0,1240,1754);g.fillStyle=theme.color;g.fillRect(0,0,1240,225);g.fillStyle=theme.accent;g.fillRect(0,225,1240,8);
  g.fillStyle='#fff';g.font='bold 44px "Noto Sans Thai",sans-serif';g.fillText(school||'โรงเรียนบ้านป่าเด็ง',65,88,900);g.font='24px "Noto Sans Thai",sans-serif';g.fillText('จดหมายข่าวประชาสัมพันธ์ / SCHOOL NEWS',65,145);g.fillStyle=theme.accent;g.font='20px sans-serif';g.fillText('BAN PA DENG SCHOOL',65,190);
  g.fillStyle=theme.color;g.fillRect(0,1680,1240,74);g.fillStyle='#fff';g.font='20px "Noto Sans Thai",sans-serif';g.fillText('งานประชาสัมพันธ์ · '+school,65,1727);
 }
 const layout=getNewsLayout(n);
 const selected:number[]=(n.selected||[]).slice(0,6);
 if(reference&&selected.length>reference.photoCount)throw Error('แม่แบบนี้รองรับ '+reference.photoCount+' ภาพ กรุณาเลือกภาพตามจำนวนกรอบ');
 const images=await Promise.all(selected.map(id=>loadImage('/api/pr/image/'+id+'/full','โหลดภาพไม่สำเร็จ กรุณาลองใหม่')));
 images.forEach((im,i)=>{const r=layout.photos[i];g.fillStyle='#fff';g.fillRect(r.x-3,r.y-3,r.w+6,r.h+6);g.save();if(reference){rounded(g,r,reference.style==='geometric'?0:12);g.clip();}cover(g,im,r,n.crop?.[selected[i]]);g.restore();});
 drawText(g,n.headline||'',layout.headline,true,!!reference);drawText(g,n.body||'',layout.body);
 await drawDirector(g,layout.director,director);
 if(reference&&n.sourceUrl?.trim()){
  let url:URL;try{url=new URL(n.sourceUrl.trim());}catch{throw Error('ลิงก์ QR ต้องเป็น URL แบบ https:// หรือ http://');}
  if(!['https:','http:'].includes(url.protocol))throw Error('ลิงก์ QR ต้องขึ้นต้นด้วย https:// หรือ http://');
  const qr=await loadImage(await qrDataUrl(url.href,{width:240,margin:4,errorCorrectionLevel:'M'}),'สร้าง QR ไม่สำเร็จ');
  g.drawImage(qr,1042,1625,100,100);g.fillStyle='#fff';g.font='14px "Noto Sans Thai",sans-serif';g.textAlign='center';g.fillText('สแกนอ่านเพิ่มเติม',1092,1730);g.textAlign='left';
 }
 return canvas;
}
export async function png(n:any,school:string,director?:DirectorProfile){const c=await renderNews(n,school,director);return await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('สร้างไฟล์ไม่สำเร็จ')),'image/png'));}

export function download(blob:Blob,name:string){const a=document.createElement('a');const u=URL.createObjectURL(blob);a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),10000);}
export function zipStore(files:{name:string,data:Uint8Array}[]){const parts:Uint8Array[]=[];const central:Uint8Array[]=[];let offset=0;const enc=new TextEncoder();const record=(len:number)=>new Uint8Array(len);const crc=(b:Uint8Array)=>{let c=0xffffffff;for(const v of b){c^=v;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;}return(c^0xffffffff)>>>0;};for(const f of files){const name=enc.encode(f.name);const sum=crc(f.data);const h=record(30+name.length);const v=new DataView(h.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,sum,true);v.setUint32(18,f.data.length,true);v.setUint32(22,f.data.length,true);v.setUint16(26,name.length,true);h.set(name,30);parts.push(h,f.data);const ce=record(46+name.length);const d=new DataView(ce.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint32(16,sum,true);d.setUint32(20,f.data.length,true);d.setUint32(24,f.data.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);ce.set(name,46);central.push(ce);offset+=h.length+f.data.length;}const end=record(22);const e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,central.reduce((a,b)=>a+b.length,0),true);e.setUint32(16,offset,true);return new Blob([...parts,...central,end] as BlobPart[],{type:'application/zip'});}

