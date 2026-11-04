// แม่แบบจาก Google Drive: ภาพพื้นหลัง A4 ในโฟลเดอร์ TEMPLATE_DRIVE_FOLDER_ID
// และไฟล์ templates.json (ไม่บังคับ) บอกชื่อและตำแหน่งวางพาดหัว/ภาพ/เนื้อข่าว
// ใช้บัญชี Drive เดียวกับระบบโรงเรียน (OAuth refresh token แบบเว็บกิจกรรม)

export interface DriveEnv {
 GOOGLE_DRIVE_CLIENT_ID?: string;
 GOOGLE_DRIVE_CLIENT_SECRET?: string;
 GOOGLE_DRIVE_REFRESH_TOKEN?: string;
 TEMPLATE_DRIVE_FOLDER_ID?: string;
}

export type Box = {x:number;y:number;w:number;h?:number;size?:number;color?:string};
export type DriveTemplate = {
 id:string; name:string; fileId:string; fromConfig?:boolean;
 headline:Box; photos:Box&{h:number;layout?:'hero'|'grid'}; body:Box&{h:number};
};

const CANVAS={w:1240,h:1754};
export const DEFAULT_SLOTS={
 headline:{x:65,y:300,w:1110,size:42,color:'#143d73'},
 photos:{x:65,y:400,w:1110,h:700,layout:'hero' as const},
 body:{x:65,y:1140,w:1110,h:500,size:28,color:'#27364a'},
};

const json=(data:unknown,status=200,cache='no-store')=>Response.json(data,{status,headers:{'Cache-Control':cache,'X-Content-Type-Options':'nosniff'}});
const num=(v:unknown,min:number,max:number,d:number)=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):d;};
const color=(v:unknown,d:string)=>typeof v==='string'&&/^#[0-9a-f]{3,8}$/i.test(v)?v:d;
function box<T extends Box>(raw:any,d:T):T{
 raw=raw&&typeof raw==='object'?raw:{};
 const out:any={...d,x:num(raw.x,0,CANVAS.w-50,d.x),y:num(raw.y,0,CANVAS.h-50,d.y),w:num(raw.w,50,CANVAS.w,d.w)};
 if(d.h!==undefined)out.h=num(raw.h,50,CANVAS.h,d.h);
 if(d.size!==undefined)out.size=num(raw.size,14,96,d.size);
 if(d.color!==undefined)out.color=color(raw.color,d.color);
 if('layout' in d)out.layout=raw.layout==='grid'?'grid':'hero';
 out.w=Math.min(out.w,CANVAS.w-out.x);
 return out;
}

let cachedToken:{token:string;exp:number}|null=null;
async function accessToken(env:DriveEnv){
 if(cachedToken&&cachedToken.exp>Date.now()+60000)return cachedToken.token;
 const res=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({
  client_id:String(env.GOOGLE_DRIVE_CLIENT_ID),client_secret:String(env.GOOGLE_DRIVE_CLIENT_SECRET),refresh_token:String(env.GOOGLE_DRIVE_REFRESH_TOKEN),grant_type:'refresh_token'})});
 const data:any=await res.json().catch(()=>({}));
 if(!res.ok||!data.access_token)throw new Error('เชื่อมต่อ Google Drive ไม่สำเร็จ ('+res.status+')');
 cachedToken={token:data.access_token,exp:Date.now()+Number(data.expires_in||3600)*1000};
 return cachedToken.token;
}
async function drive(env:DriveEnv,path:string){
 const r=await fetch('https://www.googleapis.com/drive/v3'+path,{headers:{Authorization:'Bearer '+await accessToken(env)},signal:AbortSignal.timeout(25000)});
 if(!r.ok)throw new Error('Google Drive ตอบกลับ '+r.status);
 return r;
}
export const driveReady=(env:DriveEnv)=>!!(env.GOOGLE_DRIVE_CLIENT_ID&&env.GOOGLE_DRIVE_CLIENT_SECRET&&env.GOOGLE_DRIVE_REFRESH_TOKEN&&env.TEMPLATE_DRIVE_FOLDER_ID);

/** รวมรายการภาพในโฟลเดอร์กับ templates.json — ภาพที่ไม่มีใน json ใช้ตำแหน่งมาตรฐาน */
export function buildTemplates(files:{id:string;name:string;mimeType:string}[],config:any):DriveTemplate[]{
 const images=files.filter(f=>/^image\/(png|jpeg|webp)$/.test(f.mimeType));
 const listed:any[]=Array.isArray(config?.templates)?config.templates:[];
 const used=new Set<string>();
 const out:DriveTemplate[]=[];
 for(const t of listed){
  const f=images.find(i=>i.name===t?.file||i.id===t?.file);
  if(!f||used.has(f.id))continue;used.add(f.id);
  out.push({id:'drive:'+f.id,fileId:f.id,fromConfig:true,name:String(t.name||f.name).slice(0,60),headline:box(t.headline,DEFAULT_SLOTS.headline),photos:box(t.photos,DEFAULT_SLOTS.photos),body:box(t.body,DEFAULT_SLOTS.body)});
 }
 for(const f of images)if(!used.has(f.id))out.push({id:'drive:'+f.id,fileId:f.id,name:f.name.replace(/\.[^.]+$/,'').slice(0,60),...structuredClone(DEFAULT_SLOTS)});
 return out;
}

async function loadTemplates(env:DriveEnv):Promise<DriveTemplate[]>{
 const q=encodeURIComponent(`'${env.TEMPLATE_DRIVE_FOLDER_ID}' in parents and trashed=false`);
 const list:any=await (await drive(env,`/files?q=${q}&fields=files(id,name,mimeType)&orderBy=name&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`)).json();
 const files=list.files||[];
 const cfg=files.find((f:any)=>f.name==='templates.json');
 let config=null;
 // ถ้ามี templates.json แต่อ่านไม่ได้ ต้องแจ้ง error ไม่ใช้ตำแหน่งมาตรฐานแทนแบบเงียบ ๆ
 if(cfg){const text=await (await drive(env,`/files/${cfg.id}?alt=media&supportsAllDrives=true`)).text();try{config=JSON.parse(text.replace(/^\uFEFF/,''));}catch{throw new Error('templates.json ใน Drive อ่านไม่ได้ (รูปแบบ JSON ไม่ถูกต้อง)');}}
 return buildTemplates(files,config);
}

const CACHE_LIST='https://templates.internal/list-v2';
export async function templatesApi(req:Request,env:DriveEnv,ctx?:{waitUntil(p:Promise<unknown>):void}):Promise<Response|null>{
 const u=new URL(req.url);
 if(req.method!=='GET')return null;
 if(u.pathname==='/api/pr/templates'){
  if(!driveReady(env))return json({templates:[],configured:false});
  const cache=(globalThis as any).caches?.default as Cache|undefined;
  const fresh=u.searchParams.has('refresh');
  if(cache&&!fresh){const hit=await cache.match(CACHE_LIST);if(hit)return json(await hit.json());}
  try{
   const data={templates:await loadTemplates(env),configured:true};
   // ไม่จำรายการที่ยังไม่มี templates.json (อาจกำลังอัปโหลดอยู่)
   if(cache&&data.templates.every(t=>t.fromConfig)){const p=cache.put(CACHE_LIST,Response.json(data,{headers:{'Cache-Control':'max-age=600'}}));ctx?ctx.waitUntil(p):await p;}
   return json(data);
  }catch(e){return json({templates:[],configured:true,error:e instanceof Error?e.message:'โหลดแม่แบบไม่สำเร็จ'},502);}
 }
 const m=u.pathname.match(/^\/api\/pr\/template\/([A-Za-z0-9_-]{10,100})$/);
 if(m){
  if(!driveReady(env))return json({error:'ยังไม่ได้เชื่อม Google Drive'},404);
  try{
   // ส่งเฉพาะไฟล์ที่อยู่ในโฟลเดอร์แม่แบบเท่านั้น
   const meta:any=await (await drive(env,`/files/${m[1]}?fields=parents,mimeType,trashed&supportsAllDrives=true`)).json();
   if(meta.trashed||!meta.parents?.includes(env.TEMPLATE_DRIVE_FOLDER_ID)||!/^image\//.test(meta.mimeType))return json({error:'ไม่พบแม่แบบ'},404);
   const r=await drive(env,`/files/${m[1]}?alt=media&supportsAllDrives=true`);
   return new Response(r.body,{headers:{'Content-Type':meta.mimeType,'Cache-Control':'private,max-age=3600','X-Content-Type-Options':'nosniff'}});
  }catch(e){return json({error:e instanceof Error?e.message:'โหลดแม่แบบไม่สำเร็จ'},502);}
 }
 return null;
}


// ---- ชั่วคราว: เพิ่มแม่แบบชุดใหม่ขึ้น Drive และรวมตำแหน่งเข้า templates.json (ไม่ลบของเดิม) ----
export async function syncTemplates(env:DriveEnv,assets:{fetch(r:Request):Promise<Response>}){
 if(!driveReady(env))return {error:'drive not configured'};
 const token=await accessToken(env);
 const pack:any=await (await assets.fetch(new Request('https://assets.local/seed-templates/templates-ornate.json'))).json();
 const q=encodeURIComponent(`'${env.TEMPLATE_DRIVE_FOLDER_ID}' in parents and trashed=false`);
 const list:any=await (await drive(env,`/files?q=${q}&fields=files(id,name)&pageSize=200&supportsAllDrives=true&includeItemsFromAllDrives=true`)).json();
 const byName=new Map<string,string>((list.files||[]).map((f:any)=>[f.name,f.id]));
 const uploaded:string[]=[];
 for(const t of pack.templates){
  if(byName.has(t.file))continue;
  const r=await assets.fetch(new Request('https://assets.local/seed-templates/'+t.file));
  if(!r.ok||!(r.headers.get('content-type')||'').includes('png'))throw new Error('missing '+t.file);
  const boundary='sync_'+crypto.randomUUID();
  const body=new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name:t.file,mimeType:'image/png',parents:[env.TEMPLATE_DRIVE_FOLDER_ID]})}\r\n--${boundary}\r\nContent-Type: image/png\r\n\r\n`,await r.arrayBuffer(),`\r\n--${boundary}--`]);
  const up=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'multipart/related; boundary='+boundary},body});
  if(!up.ok)throw new Error('upload '+t.file+' '+up.status);
  uploaded.push(t.file);
 }
 const cfgId=byName.get('templates.json');
 if(!cfgId)throw new Error('templates.json not found');
 const current=JSON.parse((await (await drive(env,`/files/${cfgId}?alt=media&supportsAllDrives=true`)).text()).replace(/^﻿/,''));
 const merged=[...(current.templates||[]).filter((t:any)=>!pack.templates.some((p:any)=>p.file===t.file)),...pack.templates];
 const put=await fetch(`https://www.googleapis.com/upload/drive/v3/files/${cfgId}?uploadType=media&supportsAllDrives=true`,{method:'PATCH',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({templates:merged},null,1)});
 if(!put.ok)throw new Error('update templates.json '+put.status);
 return {uploaded,templates:merged.length};
}
