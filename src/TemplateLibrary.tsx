import {useState,useEffect} from 'react';
import {Star,LayoutTemplate,Trash2,Search,SlidersHorizontal,RotateCcw,LockKeyhole} from 'lucide-react';
import {getNewsLayout,templateSource} from '../lib/news-render';
import {getReferenceTemplate} from '../lib/reference-templates';
import {drawReferenceBackground} from '../lib/reference-art';
import {filterTemplates,templateMetadata,EMPTY_FILTERS,TONES,STYLES,type CatalogueItem} from '../lib/template-catalogue';
import type {DirectorProfile} from '../lib/design-layout';
export type {CatalogueItem} from '../lib/template-catalogue';
export function TemplateThumb({item,director}:{item:CatalogueItem;director:DirectorProfile}){
 const source=templateSource(item.id),reference=getReferenceTemplate(source),[art,setArt]=useState('');
 useEffect(()=>{if(!reference){setArt('');return;}let cancelled=false;document.fonts.ready.then(()=>{if(cancelled)return;const c=document.createElement('canvas');c.width=372;c.height=526;const g=c.getContext('2d')!;g.scale(.3,.3);drawReferenceBackground(g,reference,'โรงเรียนบ้านป่าเด็ง');setArt(c.toDataURL());});return()=>{cancelled=true;};},[source]);
 const layout=getNewsLayout({theme:item.id,selected:Array.from({length:item.photoCount||4},(_,i)=>i+1)});
 const style=(r:{x:number;y:number;w:number;h:number})=>({left:r.x/12.4+'%',top:r.y/17.54+'%',width:r.w/12.4+'%',height:r.h/17.54+'%'});
 return <div className={'template-thumb '+source}>
  {art?<img src={art} alt={item.name}/>:item.fileId?<img loading="lazy" src={'/api/pr/template/'+item.fileId} alt={item.name}/>:<div className="thumb-base"><b>โรงเรียนบ้านป่าเด็ง</b><small>จดหมายข่าวประชาสัมพันธ์</small></div>}
  {layout.photos.map((r,i)=><span className="thumb-photo-slot" key={i} style={style(r)}>{i+1}</span>)}
  <span className="thumb-director" style={style(layout.director)}>{director.image?<img src={director.image} alt="รูป ผอ."/>:<span>ผอ.</span>}</span>
 </div>;
}
export default function TemplateLibrary({items,director,favorites,usage,onFavorite,onUse,onDelete,onVisibility,disabled}:{items:CatalogueItem[];director:DirectorProfile;favorites:string[];usage:Record<string,number>;onFavorite:(id:string)=>void;onUse:(id:string)=>void;onDelete:(id:string)=>void;onVisibility:(id:string)=>void;disabled:boolean}){
 const [filters,setFilters]=useState({...EMPTY_FILTERS});
 const change=(key:keyof typeof filters,value:string)=>setFilters(f=>({...f,[key]:value}));
 const ranked=[...items].sort((a,b)=>(usage[b.id]||0)-(usage[a.id]||0)||a.name.localeCompare(b.name,'th'));
 const visible=filterTemplates(items,filters,favorites,usage);
 const active=filters.query.trim()||['category','tone','style','count'].some(k=>filters[k as keyof typeof filters]!=='all');
 return <>
 <section className="template-filters" aria-label="ตัวกรองแม่แบบ">
  <div className="library-controls"><div className="filter-pills">{[['all','ทั้งหมด'],['reference','ชุดใหม่ 10 แบบ'],['starred','ติดดาว'],['personal','ปรับเอง'],['hidden','ซ่อนอยู่']].map(([id,label])=><button key={id} className={filters.category===id?'active':''} aria-pressed={filters.category===id} onClick={()=>change('category',id)}>{label}{id==='starred'?' '+favorites.length:''}</button>)}</div><label className="field">เรียงแม่แบบ<select value={filters.sort} onChange={e=>change('sort',e.target.value)}><option value="popular">ใช้บ่อยที่สุด</option><option value="starred">ติดดาวก่อน</option><option value="newest">ใหม่ไปเก่า</option><option value="oldest">เก่าไปใหม่</option><option value="name">ตามชื่อ</option></select></label></div>
  <div className="library-filter-grid"><label className="field library-search"><span><Search size={14}/>ค้นหาแม่แบบ</span><input type="search" value={filters.query} placeholder="ชื่อแม่แบบ หรือโทนสี…" onChange={e=>change('query',e.target.value)}/></label>
   <label className="field">โทนสี<select value={filters.tone} onChange={e=>change('tone',e.target.value)}><option value="all">ทุกโทนสี</option>{TONES.map(([id,name])=><option value={id} key={id}>{name}</option>)}</select></label>
   <label className="field">จำนวนภาพ<select value={filters.count} onChange={e=>change('count',e.target.value)}><option value="all">ทุกจำนวนภาพ</option>{[1,2,3,4,5,6].map(n=><option value={n} key={n}>{n} ภาพ</option>)}</select></label>
   <label className="field">สไตล์<select value={filters.style} onChange={e=>change('style',e.target.value)}><option value="all">ทุกสไตล์</option>{STYLES.map(([id,name])=><option value={id} key={id}>{name}</option>)}</select></label>
  </div>
  <div className="library-results"><span role="status" aria-live="polite"><SlidersHorizontal size={14}/>พบ {visible.length} จาก {items.length} แม่แบบ</span>{active&&<button className="secondary" onClick={()=>setFilters({...EMPTY_FILTERS,sort:filters.sort})}><RotateCcw size={14}/>ล้างตัวกรอง</button>}</div>
 </section>
 <p className="library-caption">ชุดใหม่ล็อกตำแหน่งและขนาดกรอบ เปลี่ยนข้อความและครอปภาพภายในกรอบได้ · อันดับและดาวบันทึกบนอุปกรณ์นี้</p>
 <div className="template-gallery">{visible.map(t=><article key={t.id} className="library-card"><button className={'favorite-button '+(favorites.includes(t.id)?'starred':'')} aria-label={(favorites.includes(t.id)?'ยกเลิกดาว ':'ติดดาว ')+t.name} aria-pressed={favorites.includes(t.id)} onClick={()=>onFavorite(t.id)}><Star size={18} fill={favorites.includes(t.id)?'currentColor':'none'}/></button>
 <TemplateThumb item={t} director={director}/><h3>{t.name}</h3><p className="template-details">{t.locked&&<LockKeyhole size={12}/>} {t.photoCount?t.photoCount+' ภาพ':'ปรับได้ 1–6 ภาพ'} · {TONES.find(([id])=>id===templateMetadata(t).tone)?.[1]||'พร้อมกรอบรูป ผอ.'}</p><div className="template-stats"><span>{usage[t.id]||0} ครั้ง</span>{(usage[t.id]||0)>0&&<b>อันดับ {ranked.findIndex(x=>x.id===t.id)+1}</b>}</div>{!t.hidden&&<button className="secondary" disabled={disabled} onClick={()=>onUse(t.id)}><LayoutTemplate size={14}/>ใช้กับข่าวทั้งชุด</button>}{(t.personal||t.id.startsWith('drive:'))?<button className="delete-template" onClick={()=>onDelete(t.id)}><Trash2 size={13}/>{t.personal?'ลบแบบส่วนตัว':'ลบแม่แบบ'}</button>:<button className="delete-template" onClick={()=>onVisibility(t.id)}>{t.hidden?'แสดงแม่แบบอีกครั้ง':'ซ่อนแม่แบบ'}</button>}</article>)}</div>
 {!visible.length&&<div className="empty"><Search size={28}/><h3>ไม่พบแม่แบบตามตัวกรอง</h3><p>ลองเปลี่ยนโทนสี จำนวนภาพ หรือสไตล์</p><button className="secondary" onClick={()=>setFilters({...EMPTY_FILTERS})}>ล้างตัวกรองทั้งหมด</button></div>}
 </>;
}


