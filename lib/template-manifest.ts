import type {PageLayout,Rect,TextSlot} from './design-layout.ts';

/** The designer owns every coordinate. Values are page pixels at 1240 × 1754. */
export type TemplateManifest={schemaVersion:1;file:string;name:string;canvas:{width:1240;height:1754};layout:PageLayout};
export function validateManifest(raw:unknown,expectedFile?:string):TemplateManifest{
 const m=raw as any;const fail=(message:string):never=>{throw new Error(message);};
 if(!m||typeof m!=='object'||Array.isArray(m))return fail('ข้อมูลแม่แบบต้องเป็น JSON object');
 if(m.schemaVersion!==1)return fail('schemaVersion ต้องเป็น 1');
 if(typeof m.file!=='string'||!/^.+\.(png|jpe?g|webp)$/i.test(m.file)||/[\\/]/.test(m.file))return fail('file ต้องเป็นชื่อภาพ PNG, JPG หรือ WebP');
 if(expectedFile&&m.file!==expectedFile)return fail('ชื่อภาพในไฟล์กำกับไม่ตรงกับชื่อภาพ');
 if(typeof m.name!=='string'||!m.name.trim()||m.name.length>60)return fail('name ต้องมี 1–60 ตัวอักษร');
 if(m.canvas?.width!==1240||m.canvas?.height!==1754)return fail('canvas ต้องมีขนาด 1240 × 1754');
 const rect=(v:any,label:string):Rect=>{
  if(!v||typeof v!=='object')return fail('ไม่พบกรอบ '+label);
  for(const k of ['x','y','w','h'])if(typeof v[k]!=='number'||!Number.isFinite(v[k]))return fail(label+' ต้องกำหนด '+k+' เป็นตัวเลข');
  if(v.x<0||v.y<0||v.w<40||v.h<40||v.x+v.w>1240||v.y+v.h>1754)return fail('กรอบ '+label+' มีขนาดหรือตำแหน่งนอกหน้ากระดาษ');
  return {x:v.x,y:v.y,w:v.w,h:v.h};
 };
 const text=(v:any,label:string):TextSlot=>{
  const r=rect(v,label);
  if(typeof v.size!=='number'||!Number.isFinite(v.size)||v.size<16||v.size>96)return fail(label+' ต้องมีขนาดตัวอักษร 16–96');
  if(typeof v.color!=='string'||!/^#[0-9a-f]{6}$/i.test(v.color))return fail(label+' ต้องกำหนดสีเป็น #RRGGBB');
  if(!['left','center','right'].includes(v.align))return fail(label+' ต้องกำหนดการจัดข้อความ');
  if(!['Noto Sans Thai','Noto Serif Thai'].includes(v.font))return fail(label+' ต้องกำหนดฟอนต์ที่ระบบรองรับ');
  return {...r,size:v.size,color:v.color,align:v.align,font:v.font};
 };
 if(!m.layout||!Array.isArray(m.layout.photos)||m.layout.photos.length<1||m.layout.photos.length>6)return fail('ต้องมีกรอบภาพกิจกรรม 1–6 กรอบ');
 return {schemaVersion:1,file:m.file,name:m.name.trim(),canvas:{width:1240,height:1754},layout:{...(m.layout.logo!==undefined?{logo:rect(m.layout.logo,'ตราโรงเรียน')}:{}),headline:text(m.layout.headline,'พาดหัว'),body:text(m.layout.body,'เนื้อข่าว'),director:rect(m.layout.director,'ผอ.'),photos:m.layout.photos.map((v:any,i:number)=>rect(v,'ภาพ '+(i+1)))}};
}
