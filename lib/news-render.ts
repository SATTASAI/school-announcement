export type Slot={x:number;y:number;w:number;h?:number;size?:number;color?:string;layout?:'hero'|'grid'};
export type DriveTemplate={id:string;name:string;fileId:string;headline:Slot;photos:Slot&{h:number};body:Slot&{h:number}};
/** แม่แบบจาก Google Drive (โหลดผ่าน /api/pr/templates) */
export let driveTemplates:DriveTemplate[]=[];
export function setDriveTemplates(list:DriveTemplate[]){driveTemplates=Array.isArray(list)?list:[];}
const loadImage=(src:string,msg:string)=>new Promise<HTMLImageElement>((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(Error(msg));im.src=src;});
const words=(v:string)=>new Intl.Segmenter('th',{granularity:'word'}).segment(v);
function wrap(g:CanvasRenderingContext2D,value:string,width:number){const lines:string[]=[];let line='';for(const p of words(value)){if(p.segment.includes('\n')){lines.push(line);line='';continue;}if(g.measureText(line+p.segment).width>width&&line){lines.push(line);line=p.segment.trimStart();}else line+=p.segment;}if(line)lines.push(line);return lines;}
function cover(g:CanvasRenderingContext2D,im:HTMLImageElement,x:number,y:number,w:number,h:number){const scale=Math.max(w/im.naturalWidth,h/im.naturalHeight);const sw=w/scale,sh=h/scale;g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.drawImage(im,(im.naturalWidth-sw)/2,(im.naturalHeight-sh)/2,sw,sh,x,y,w,h);g.restore();}
const font=(size:number,bold=false)=>`${bold?'bold ':''}${size}px "Noto Sans Thai",sans-serif`;
async function renderDrive(n:any,t:DriveTemplate){
 await document.fonts.ready;const c=document.createElement('canvas');c.width=1240;c.height=1754;const g=c.getContext('2d')!;
 g.fillStyle='#fff';g.fillRect(0,0,1240,1754);
 g.drawImage(await loadImage('/api/pr/template/'+t.fileId,'โหลดแม่แบบจาก Google Drive ไม่สำเร็จ'),0,0,1240,1754);
 // พาดหัว: ย่อขนาดจนพอดี 2 บรรทัด
 const hs=t.headline;let size=hs.size||42,lines:string[]=[];
 for(;size>=24;size-=2){g.font=font(size,true);lines=wrap(g,n.headline||'',hs.w);if(lines.length<=2)break;}
 if(lines.length>2)throw Error('พาดหัวยาวเกินพื้นที่ของแม่แบบ กรุณาย่อพาดหัว');
 g.fillStyle=hs.color||'#143d73';g.textBaseline='top';lines.forEach((l,i)=>g.fillText(l,hs.x,hs.y+i*size*1.45));
 // ภาพ
 const ps=t.photos,pics=(n.selected||[]).slice(0,4);
 const ims=await Promise.all(pics.map((id:number)=>loadImage('/api/pr/image/'+id+'/full','โหลดภาพไม่สำเร็จ กรุณาลองใหม่')));
 const gap=14;
 if(ims.length===1)cover(g,ims[0],ps.x,ps.y,ps.w,ps.h);
 else if(ims.length&&(ps.layout==='grid'||ims.length===4&&ps.layout!=='hero')){const cols=2,rows=Math.ceil(ims.length/2),w=(ps.w-gap)/cols,h=(ps.h-gap*(rows-1))/rows;ims.forEach((im,i)=>cover(g,im,ps.x+(i%cols)*(w+gap),ps.y+Math.floor(i/cols)*(h+gap),w,h));}
 else if(ims.length){const heroH=Math.round(ps.h*.64),smallH=ps.h-heroH-gap,rest=ims.length-1,w=(ps.w-gap*(rest-1))/rest;cover(g,ims[0],ps.x,ps.y,ps.w,heroH);ims.slice(1).forEach((im,i)=>cover(g,im,ps.x+i*(w+gap),ps.y+heroH+gap,w,smallH));}
 // เนื้อข่าว: ย่อขนาดจนพอดีกรอบ
 const bs=t.body;let bsize=bs.size||28,blines:string[]=[];
 for(;bsize>=16;bsize--){g.font=font(bsize);blines=wrap(g,n.body||'',bs.w);if(blines.length*bsize*1.55<=bs.h)break;}
 if(blines.length*bsize*1.55>bs.h)throw Error('ข้อความยาวเกินพื้นที่ของแม่แบบ กรุณาย่อเนื้อข่าว');
 g.fillStyle=bs.color||'#27364a';blines.forEach((l,i)=>g.fillText(l,bs.x,bs.y+i*bsize*1.55));
 g.textBaseline='alphabetic';return c;
}
export const themes=[{id:'blue',name:'น้ำเงิน · ทางการ',color:'#143d73',accent:'#e5b94d'},{id:'forest',name:'ป่าเด็ง · ธรรมชาติ',color:'#20584a',accent:'#d7bb77'},{id:'editorial',name:'ขาว · วารสาร',color:'#24354b',accent:'#648cb0'}];
export async function renderNews(n:any,school:string){
 if(typeof n.theme==='string'&&n.theme.startsWith('drive:')){const t=driveTemplates.find(x=>x.id===n.theme);if(t)return renderDrive(n,t);n={...n,theme:'blue'};}
 await document.fonts.ready;const c=document.createElement('canvas');c.width=1240;c.height=1754;const g=c.getContext('2d')!;const t=themes.find(x=>x.id===n.theme)||themes[0];g.fillStyle=n.theme==='forest'?'#f7f7ef':'#fff';g.fillRect(0,0,1240,1754);
 g.fillStyle=t.color;g.fillRect(0,0,1240,n.theme==='editorial'?200:225);g.fillStyle=t.accent;g.fillRect(0,n.theme==='editorial'?200:225,1240,8);g.fillStyle='#fff';g.font='bold 44px "Noto Sans Thai",sans-serif';g.fillText(school||'โรงเรียนบ้านป่าเด็ง',65,88);g.font='24px "Noto Sans Thai",sans-serif';g.fillText('จดหมายข่าวประชาสัมพันธ์  /  SCHOOL NEWS',65,145);g.fillStyle=t.accent;g.font='20px sans-serif';g.fillText('BAN PA DENG SCHOOL',65,190);
 const text=(value:string,x:number,y:number,width:number,size:number,bold=false)=>{g.font=`${bold?'bold ':''}${size}px "Noto Sans Thai",sans-serif`;const seg=new Intl.Segmenter('th',{granularity:'word'});let line='',lines:string[]=[];for(const p of seg.segment(value)){if(p.segment.includes('\n')){lines.push(line);line='';continue;}if(g.measureText(line+p.segment).width>width&&line){lines.push(line);line=p.segment;}else line+=p.segment;}if(line)lines.push(line);for(const line of lines){g.fillText(line,x,y);y+=size*1.55;}return {y,count:lines.length};};
 g.fillStyle=t.color;let headlineY=285;const h=text(n.headline||'',65,headlineY,1110,42,true);let imageY=h.y+12;
 const photo=async(id:number,x:number,y:number,w:number,h:number)=>{const im=new Image();im.src='/api/pr/image/'+id+'/full';await new Promise<void>((res,rej)=>{im.onload=()=>res();im.onerror=()=>rej(Error('โหลดภาพไม่สำเร็จ กรุณาลองใหม่'));});const scale=Math.max(w/im.naturalWidth,h/im.naturalHeight);const sw=w/scale,sh=h/scale;g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.drawImage(im,(im.naturalWidth-sw)/2,(im.naturalHeight-sh)/2,sw,sh,x,y,w,h);g.restore();};
 const pics=(n.selected||[]).slice(0,4);if(pics.length){if(n.theme==='editorial'){const w=(1110-14)/2;for(let i=0;i<pics.length;i++)await photo(pics[i],65+(i%2)*(w+14),imageY+Math.floor(i/2)*265,w,250);imageY+=Math.ceil(pics.length/2)*265;}else{await photo(pics[0],65,imageY,1110,455);imageY+=470;if(pics.length>1){const w=(1110-(pics.length-2)*14)/(pics.length-1);for(let i=1;i<pics.length;i++)await photo(pics[i],65+(i-1)*(w+14),imageY,w,230);imageY+=245;}}}
 imageY+=35;
 const available=1640-imageY;let size=28;for(;size>=18;size--){g.font=`${size}px "Noto Sans Thai",sans-serif`;let width=0,lines=1;for(const p of new Intl.Segmenter('th',{granularity:'word'}).segment(n.body||'')){const w=g.measureText(p.segment).width;if(p.segment.includes('\n')||width+w>1110){lines++;width=0;}width+=w;}if(lines*size*1.55<=available)break;}if(size<18)throw Error('ข้อความยาวเกินพื้นที่ กรุณาย่อเนื้อข่าวหรือลดจำนวนภาพ');g.fillStyle='#27364a';text(n.body,65,imageY,1110,size);
 g.fillStyle=t.color;g.fillRect(0,1680,1240,74);g.fillStyle='#fff';g.font='20px "Noto Sans Thai",sans-serif';g.fillText('งานประชาสัมพันธ์ · '+(school||'โรงเรียนบ้านป่าเด็ง'),65,1727);return c;
}
export async function png(n:any,school:string){const c=await renderNews(n,school);return await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('สร้างไฟล์ไม่สำเร็จ')),'image/png'));}
export function download(blob:Blob,name:string){const a=document.createElement('a');const u=URL.createObjectURL(blob);a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),10000);}
export function zipStore(files:{name:string,data:Uint8Array}[]){const parts:Uint8Array[]=[];const central:Uint8Array[]=[];let offset=0;const enc=new TextEncoder();const record=(len:number)=>new Uint8Array(len);const crc=(b:Uint8Array)=>{let c=0xffffffff;for(const v of b){c^=v;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;}return(c^0xffffffff)>>>0;};for(const f of files){const name=enc.encode(f.name);const sum=crc(f.data);const h=record(30+name.length);const v=new DataView(h.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,sum,true);v.setUint32(18,f.data.length,true);v.setUint32(22,f.data.length,true);v.setUint16(26,name.length,true);h.set(name,30);parts.push(h,f.data);const ce=record(46+name.length);const d=new DataView(ce.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint32(16,sum,true);d.setUint32(20,f.data.length,true);d.setUint32(24,f.data.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);ce.set(name,46);central.push(ce);offset+=h.length+f.data.length;}const end=record(22);const e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,central.reduce((a,b)=>a+b.length,0),true);e.setUint32(16,offset,true);return new Blob([...parts,...central,end] as BlobPart[],{type:'application/zip'});}
