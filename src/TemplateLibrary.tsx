import {useState} from 'react';
import {Star,LayoutTemplate,Trash2} from 'lucide-react';
import {getNewsLayout,templateSource} from '../lib/news-render';
import type {DirectorProfile} from '../lib/design-layout';
export type CatalogueItem={id:string;name:string;fileId?:string;personal?:boolean;photoCount?:number};
export function TemplateThumb({item,director}:{item:CatalogueItem;director:DirectorProfile}){
 const source=templateSource(item.id),layout=getNewsLayout({theme:item.id,selected:Array.from({length:item.photoCount||4},(_,i)=>i+1)});
 const style=(r:{x:number;y:number;w:number;h:number})=>({left:r.x/12.4+'%',top:r.y/17.54+'%',width:r.w/12.4+'%',height:r.h/17.54+'%'});
 return <div className={'template-thumb '+source}>
  {item.fileId?<img loading="lazy" src={'/api/pr/template/'+item.fileId} alt={item.name}/>:<div className="thumb-base"><b>โรงเรียนบ้านป่าเด็ง</b><small>จดหมายข่าวประชาสัมพันธ์</small></div>}
  {layout.photos.map((r,i)=><span className="thumb-photo-slot" key={i} style={style(r)}>{i+1}</span>)}
  <span className="thumb-director" style={style(layout.director)}>{director.image?<img src={director.image} alt="รูป ผอ."/>:<span>ผอ.</span>}</span>
 </div>;
}
export default function TemplateLibrary({items,director,favorites,usage,onFavorite,onUse,onDelete,disabled}:{items:CatalogueItem[];director:DirectorProfile;favorites:string[];usage:Record<string,number>;onFavorite:(id:string)=>void;onUse:(id:string)=>void;onDelete:(id:string)=>void;disabled:boolean}){
 const [filter,setFilter]=useState('all'),[sort,setSort]=useState('popular');
 const ranked=[...items].sort((a,b)=>(usage[b.id]||0)-(usage[a.id]||0)||a.name.localeCompare(b.name,'th'));
 const visible=items.filter(t=>filter==='all'||filter==='starred'&&favorites.includes(t.id)||filter==='personal'&&t.personal).sort((a,b)=>sort==='popular'?(usage[b.id]||0)-(usage[a.id]||0)||a.name.localeCompare(b.name,'th'):sort==='starred'?Number(favorites.includes(b.id))-Number(favorites.includes(a.id))||a.name.localeCompare(b.name,'th'):a.name.localeCompare(b.name,'th'));
 return <><div className="library-controls"><div className="filter-pills">{[['all','ทั้งหมด'],['starred','ติดดาว'],['personal','ปรับเอง']].map(([id,label])=><button key={id} className={filter===id?'active':''} onClick={()=>setFilter(id)}>{label}{id==='starred'?' '+favorites.length:''}</button>)}</div><label className="field">เรียงแม่แบบ<select value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">ใช้บ่อยที่สุด</option><option value="starred">ติดดาวก่อน</option><option value="name">ตามชื่อ</option></select></label></div>
 <p className="library-caption">อันดับนับจากการดาวน์โหลด PNG / ZIP และกดพิมพ์บนอุปกรณ์นี้ · ติดดาวเพื่อเก็บแบบที่ชอบ</p>
 <div className="template-gallery">{visible.map(t=><article key={t.id} className="library-card"><button className={'favorite-button '+(favorites.includes(t.id)?'starred':'')} aria-label={(favorites.includes(t.id)?'ยกเลิกดาว ':'ติดดาว ')+t.name} aria-pressed={favorites.includes(t.id)} onClick={()=>onFavorite(t.id)}><Star size={18} fill={favorites.includes(t.id)?'currentColor':'none'}/></button>
 <TemplateThumb item={t} director={director}/><h3>{t.name}</h3><p>{t.personal?'แม่แบบที่ปรับเอง':'พร้อมกรอบรูป ผอ.'}</p><div className="template-stats"><span>{usage[t.id]||0} ครั้ง</span>{(usage[t.id]||0)>0&&<b>อันดับ {ranked.findIndex(x=>x.id===t.id)+1}</b>}</div><button className="secondary" disabled={disabled} onClick={()=>onUse(t.id)}><LayoutTemplate size={14}/>ใช้กับข่าวทั้งชุด</button>{t.personal&&<button className="delete-template" onClick={()=>onDelete(t.id)}><Trash2 size={13}/>ลบแบบส่วนตัว</button>}</article>)}</div>{!visible.length&&<div className="empty">{filter==='starred'?'ยังไม่มีแม่แบบที่ติดดาว':'ยังไม่มีแม่แบบในหมวดนี้'}</div>}
 </>;
}
