import {useEffect,useState} from 'react';
import type {DirectorProfile,PersonalTemplate} from '../lib/design-layout';
export type StudioPreferences={director:DirectorProfile;logo:string;favorites:string[];usage:Record<string,number>;personal:PersonalTemplate[]};
const KEY='padeng-pr-studio-preferences-v1';
const defaults:StudioPreferences={logo:'',director:{image:'',name:'',title:'ผู้อำนวยการโรงเรียน'},favorites:[],usage:{},personal:[]};
export function useStudioPreferences(onError:(message:string)=>void){
 const [prefs,setPrefs]=useState<StudioPreferences>(()=>{
  try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(!p)return defaults;
   return {logo:typeof p.logo==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(p.logo)?p.logo:'',director:{image:typeof p.director?.image==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(p.director.image)?p.director.image:'',name:String(p.director?.name||'').slice(0,80),title:String(p.director?.title||'ผู้อำนวยการโรงเรียน').slice(0,80)},favorites:Array.isArray(p.favorites)?p.favorites.filter((x:unknown)=>typeof x==='string'):[],usage:p.usage&&typeof p.usage==='object'?Object.fromEntries(Object.entries(p.usage).filter(([,n])=>typeof n==='number'&&Number.isFinite(n)&&n>=0)) as Record<string,number>: {},personal:Array.isArray(p.personal)?p.personal.filter((t:any)=>typeof t.id==='string'&&t.id.startsWith('local:')&&typeof t.sourceTheme==='string'&&!t.sourceTheme.startsWith('local:')&&t.layout&&typeof t.name==='string').slice(0,60):[]};
  }catch{return defaults;}
 });
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch{onError('พื้นที่จัดเก็บบนอุปกรณ์นี้เต็ม กรุณาลดขนาดรูป ผอ. หรือลบแม่แบบส่วนตัวที่ไม่ใช้');}},[prefs]);
 const toggleFavorite=(id:string)=>setPrefs(p=>({...p,favorites:p.favorites.includes(id)?p.favorites.filter(x=>x!==id):[...p.favorites,id]}));
 const recordUse=(ids:string[])=>setPrefs(p=>{const usage={...p.usage};for(const id of ids)usage[id]=(usage[id]||0)+1;return {...p,usage};});
 return {prefs,setPrefs,toggleFavorite,recordUse};
}
export async function portraitData(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('เลือกรูป JPG, PNG หรือ WebP');
 if(file.size>10*1024*1024)throw Error('รูปมีขนาดเกิน 10 MB กรุณาเลือกรูปที่เล็กลง');
 const url=URL.createObjectURL(file);
 try{
  const image=await new Promise<HTMLImageElement>((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(Error('อ่านรูปไม่สำเร็จ'));im.src=url;});
  const scale=Math.min(1,600/Math.max(image.naturalWidth,image.naturalHeight));
  const c=document.createElement('canvas');c.width=Math.round(image.naturalWidth*scale);c.height=Math.round(image.naturalHeight*scale);const g=c.getContext('2d')!;g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(image,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.86);
 }finally{URL.revokeObjectURL(url);}
}

/** Resize the emblem while preserving transparent PNG/WebP backgrounds. */
export async function logoData(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('เลือกตรา JPG, PNG หรือ WebP');
 if(file.size>10*1024*1024)throw Error('ตรามีขนาดเกิน 10 MB');
 const url=URL.createObjectURL(file);try{
  const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('อ่านภาพตราไม่สำเร็จ'));im.src=url;});
  const scale=Math.min(1,600/Math.max(image.naturalWidth,image.naturalHeight)),c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(image.naturalWidth*scale));c.height=Math.max(1,Math.round(image.naturalHeight*scale));
  c.getContext('2d')!.drawImage(image,0,0,c.width,c.height);return c.toDataURL('image/png');
 }finally{URL.revokeObjectURL(url);}
}
