'use client';
import {useState,useEffect} from 'react';
import {Plus,Trash2,Images,Download,Check,ArrowRight,LayoutTemplate,Newspaper,Settings2,Loader2,X,RefreshCw,FolderOpen,ChevronRight} from 'lucide-react';
import {themes,png,download,zipStore} from '@/lib/news-render';
import {pickPhotos,pickTheme} from '@/lib/news-layout';
import type {ActivityPhoto} from '@/lib/news-layout';

type News={id:string;album:any;photos:ActivityPhoto[];selected:number[];theme:string;headline:string;body:string;date:string};
const STORAGE='padeng-pr-layout-v2';
async function api(url:string){const r=await fetch(url);const data:any=await r.json();if(!r.ok)throw Error(data.error||'เชื่อมต่อไม่สำเร็จ');return data;}
function Preview({news,school,onOpen}:{news:News;school:string;onOpen:()=>void}){
 const [src,setSrc]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{
  let canceled=false,url='';setLoading(true);setSrc('');setError('');
  const timer=setTimeout(async()=>{try{const blob=await png(news,school);if(canceled)return;url=URL.createObjectURL(blob);setSrc(url);}catch(e){if(!canceled)setError((e as Error).message);}finally{if(!canceled)setLoading(false);}},450);
  return()=>{canceled=true;clearTimeout(timer);if(url)URL.revokeObjectURL(url);};
 },[news,school]);
 return <div className="layout-preview"><div className="preview-caption"><span>ตัวอย่างใบข่าว</span>{loading&&<Loader2 size={16} className="spin"/>}</div>{error?<p className="error">{error}</p>:src?<button className="paper-button" onClick={onOpen} aria-label="ดูใบข่าวขนาดใหญ่"><img src={src} alt="ตัวอย่างใบข่าวจากภาพและข้อความที่วาง"/></button>:<div className="empty"><Loader2 className="spin"/>กำลังจัดภาพและแม่แบบ…</div>}<small>ตัวอย่างจะปรับตามข้อความ ภาพ และแม่แบบที่เลือก</small></div>;
}
export default function Page(){
 const [news,setNews]=useState<News[]>([]),[school,setSchool]=useState('โรงเรียนบ้านป่าเด็ง'),[tab,setTab]=useState('news');
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const [picker,setPicker]=useState<string|null>(null),[albums,setAlbums]=useState<any[]>([]),[query,setQuery]=useState(''),[page,setPage]=useState(1),[more,setMore]=useState(false),[loading,setLoading]=useState(false),[albumError,setAlbumError]=useState('');
 const [preview,setPreview]=useState<string|null>(null);
 useEffect(()=>{try{
  const saved=JSON.parse(localStorage.getItem(STORAGE)||localStorage.getItem('padeng-pr-v1')||'null');
  if(Array.isArray(saved?.news))setNews(saved.news.filter((n:any)=>n.album&&Array.isArray(n.photos)&&n.selected?.length).slice(0,5).map((n:any)=>({id:n.id||crypto.randomUUID(),album:n.album,photos:n.photos,selected:n.selected.slice(0,4),theme:themes.some(t=>t.id===n.theme)?n.theme:'blue',headline:n.headline||'',body:n.body||'',date:''})));
  if(saved?.school)setSchool(saved.school);
 }catch{setNotice('อ่านฉบับร่างเดิมไม่สำเร็จ สามารถเริ่มข่าวใหม่ได้');}setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(STORAGE,JSON.stringify({news,school}));}catch{setNotice('พื้นที่บันทึกบนเครื่องเต็ม กรุณาดาวน์โหลดงาน');}},[news,school,ready]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 const patch=(id:string,value:Partial<News>)=>setNews(current=>current.map(n=>n.id===id?{...n,...value}:n));
 const loadAlbums=async(p=1,q=query)=>{setLoading(true);setAlbumError('');try{const result=await api('/api/pr/albums?q='+encodeURIComponent(q)+'&page='+p);setAlbums(result.albums||[]);setMore(!!result.has_more);setPage(p);}catch(e){setAlbums([]);setAlbumError((e as Error).message);}finally{setLoading(false);}};
 const openPicker=(id='new')=>{if(busy||!ready)return;if(id==='new'&&news.length>=5){setNotice('สร้างได้ครั้งละ 5 ข่าว');return;}setPicker(id);setQuery('');setAlbums([]);loadAlbums(1,'');};
 const chooseAlbum=async(album:any)=>{
  if(!picker||loading)return;setLoading(true);setAlbumError('');
  try{
   const data=await api('/api/pr/albums/'+album.id);const photos:ActivityPhoto[]=data.photos||[];
   const selected=pickPhotos(photos,data.album.cover_id);
   if(!selected.length)throw Error('อัลบั้มนี้ยังไม่มีภาพ กรุณาเลือกอัลบั้มอื่น');
   const theme=pickTheme(photos.filter(p=>selected.includes(p.id)),data.album.title);
   if(picker==='new'){const item:News={id:crypto.randomUUID(),album:data.album,photos,selected,theme,headline:'',body:'',date:''};setNews(current=>current.length<5?[...current,item]:current);}
   else patch(picker,{album:data.album,photos,selected,theme});
   setPicker(null);setTab('news');setNotice('เลือกภาพและแม่แบบให้แล้ว วางพาดหัวกับเนื้อข่าวได้เลย');
  }catch(e){setAlbumError((e as Error).message);}finally{setLoading(false);}
 };
 const autoArrange=(n:News)=>{const selected=pickPhotos(n.photos,n.album?.cover_id);patch(n.id,{selected,theme:pickTheme(n.photos.filter(p=>selected.includes(p.id)),n.album?.title)});setNotice('เลือกภาพและแม่แบบให้อัตโนมัติแล้ว');};
 const valid=(n:News)=>{if(!n.headline.trim()||!n.body.trim())throw Error('วางพาดหัวและเนื้อข่าวก่อนดาวน์โหลด');if(!n.selected.length)throw Error('เลือกภาพอย่างน้อย 1 ภาพ');};
 const openPreview=async(n:News)=>{if(busy)return;setBusy(true);setNotice('กำลังเตรียมใบข่าว…');try{setPreview(URL.createObjectURL(await png(n,school)));setNotice('');}catch(e){setNotice((e as Error).message);}finally{setBusy(false);}};
 const exportOne=async(n:News)=>{if(busy)return;setBusy(true);try{valid(n);download(await png(n,school),n.headline.replace(/[\\/:*?"<>|]/g,'-')+'.png');setNotice('ดาวน์โหลดเรียบร้อย');}catch(e){setNotice((e as Error).message);}finally{setBusy(false);}};
 const exportAll=async()=>{if(busy||!news.length)return;setBusy(true);setNotice('กำลังเตรียมข่าวทั้งชุด…');try{news.forEach(valid);const files=[];for(const [i,n] of news.entries())files.push({name:`news-${i+1}.png`,data:new Uint8Array(await(await png(n,school)).arrayBuffer())});download(zipStore(files),'Padeng-PR-News.zip');setNotice('ดาวน์โหลดข่าวทั้งชุดเรียบร้อย');}catch(e){setNotice((e as Error).message);}finally{setBusy(false);}};
 return <div className="shell">
  <aside className="sidebar"><div className="brand"><span className="brand-icon"><Newspaper size={23}/></span><div>ป่าเด็ง<span>PR STUDIO</span></div></div><div className="workspace">งานประชาสัมพันธ์โรงเรียน</div><nav>
   <button onClick={()=>openPicker()} disabled={busy||!ready||news.length>=5}><Plus size={19}/>สร้างข่าว</button>
   <button className={tab==='news'?'active':''} onClick={()=>setTab('news')}><Newspaper size={19}/>ข่าวในชุดนี้ <b>{news.length}</b></button>
   <button className={tab==='templates'?'active':''} onClick={()=>setTab('templates')}><LayoutTemplate size={19}/>แม่แบบประชาสัมพันธ์</button>
   <button className={tab==='settings'?'active':''} onClick={()=>setTab('settings')}><Settings2 size={19}/>ตั้งค่าโรงเรียน</button>
  </nav><div className="side-bottom"><div className="school-mark">บ.ป.ด.</div><strong>{school}</strong><small>บันทึกฉบับร่างบนอุปกรณ์นี้อัตโนมัติ</small><a href="https://activity.banpadengschool.ac.th" target="_blank" rel="noreferrer">เปิดเว็บกิจกรรม <ArrowRight size={14}/></a></div></aside>
  <main><header className="topbar"><span>งานประชาสัมพันธ์ <ChevronRight size={14}/>{tab==='news'?'ข่าวในชุดนี้':tab==='templates'?'แม่แบบประชาสัมพันธ์':'ตั้งค่าโรงเรียน'}</span><span className="saved"><span/>บันทึกบนเครื่อง</span></header>
   <div className="content"><div className="page-heading"><div className="eyebrow">SCHOOL NEWSROOM</div><h1>{tab==='news'?'เลือกอัลบั้ม แล้วได้ใบข่าว':tab==='templates'?'แม่แบบประชาสัมพันธ์':'ข้อมูลโรงเรียน'}</h1><p>{tab==='news'?'ระบบเลือกภาพและแม่แบบให้ วางข้อความจาก ChatGPT แล้วดาวน์โหลด':tab==='templates'?'ระบบเลือกแม่แบบให้ตามภาพและชื่ออัลบั้ม เปลี่ยนเองได้ทุกข่าว':'ชื่อโรงเรียนบนใบข่าวและฉบับร่าง'}</p></div>
    {notice&&<div className="notice" role="status">{notice}<button aria-label="ปิดข้อความ" onClick={()=>setNotice('')}><X size={16}/></button></div>}
    {tab==='news'&&<><div className="workflow"><span className="current"><i>1</i>เลือกอัลบั้ม</span><div/><span><i>2</i>จัดภาพและแม่แบบอัตโนมัติ</span><div/><span><i>3</i>วางข้อความ · ดาวน์โหลด</span></div>
     <div className="section-title"><div><h2>ข่าวในชุดนี้ <em>{news.length}/5</em></h2><p>เลือกได้ครั้งละหนึ่งอัลบั้ม เพิ่มข่าวได้สูงสุด 5 ข่าว</p></div><div className="heading-actions"><button className="secondary" disabled={busy||!news.length} onClick={exportAll}><Download size={16}/>ZIP ทั้งชุด</button><button className="primary" disabled={busy||!ready||news.length>=5} onClick={()=>openPicker()}><Plus size={17}/>สร้างข่าว</button></div></div>
     {ready&&!news.length&&<div className="empty start-news"><FolderOpen size={42}/><h2>เริ่มจากอัลบั้มภาพกิจกรรม</h2><p>เลือกอัลบั้ม ระบบจะเลือกภาพและแม่แบบประชาสัมพันธ์ให้ทันที</p><button className="primary" onClick={()=>openPicker()}><Plus size={18}/>สร้างข่าว · เลือกอัลบั้ม</button><small>วางข้อความข่าวที่เตรียมไว้ในขั้นตอนถัดไป</small></div>}
     {news.map((n,i)=><article className="news-card layout-card" key={n.id}><div className="card-heading"><div className="number">{String(i+1).padStart(2,'0')}</div><div><h3>{n.album?.title||'อัลบั้มกิจกรรม'}</h3><small>{n.selected.length} ภาพ · {themes.find(t=>t.id===n.theme)?.name}</small></div><button className="icon-button" aria-label="ลบข่าว" disabled={busy} onClick={()=>setNews(items=>items.filter(item=>item.id!==n.id))}><Trash2 size={18}/></button></div>
      <div className="layout-workspace"><Preview news={n} school={school} onOpen={()=>openPreview(n)}/><div className="layout-editor">
       <div className="panel-title"><Images size={18}/><strong>ภาพและแม่แบบที่ระบบเลือกให้</strong></div>
       <div className="arrange-actions"><button className="secondary" disabled={busy} onClick={()=>openPicker(n.id)}><FolderOpen size={16}/>เปลี่ยนอัลบั้ม</button><button className="secondary" disabled={busy} onClick={()=>autoArrange(n)}><RefreshCw size={16}/>เลือกภาพและแม่แบบอัตโนมัติ</button></div>
       <p className="hint">เลือกจากความละเอียด แนวภาพ และกระจายลำดับภาพในอัลบั้ม เปลี่ยนภาพเองได้ ({n.selected.length}/4)</p>
       <div className="photo-strip layout-photos">{n.photos.map(p=><button disabled={busy} key={p.id} className={n.selected.includes(p.id)?'chosen':''} aria-label={'เลือกภาพ '+(p.file_name||p.id)} aria-pressed={n.selected.includes(p.id)} onClick={()=>{if(n.selected.includes(p.id)){if(n.selected.length===1){setNotice('ต้องมีภาพอย่างน้อย 1 ภาพ');return;}patch(n.id,{selected:n.selected.filter(id=>id!==p.id)});}else if(n.selected.length<4)patch(n.id,{selected:[...n.selected,p.id]});else setNotice('เลือกได้สูงสุด 4 ภาพ ยกเลิกภาพเดิมก่อน');}}><img loading="lazy" src={'/api/pr/image/'+p.id+'/thumb'} alt={p.file_name||'ภาพกิจกรรม'}/>{n.selected.includes(p.id)&&<span><Check size={13}/></span>}</button>)}</div>
       <label className="field">แม่แบบประชาสัมพันธ์<select disabled={busy} value={n.theme} onChange={e=>patch(n.id,{theme:e.target.value})}>{themes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
       <div className="paste-heading"><h3>วางข้อความข่าว</h3><p>นำข้อความที่ ChatGPT เขียนจากภายนอกมาวางที่นี่</p></div>
       <label className="field">พาดหัวข่าว<input disabled={busy} value={n.headline} onChange={e=>patch(n.id,{headline:e.target.value})} placeholder="วางพาดหัวข่าวที่เตรียมไว้" maxLength={100}/></label>
       <label className="field">เนื้อข่าว<textarea disabled={busy} rows={7} value={n.body} onChange={e=>patch(n.id,{body:e.target.value})} placeholder="วางเนื้อข่าวที่เตรียมไว้ ระบบจะจัดข้อความลงแม่แบบตามที่วาง" maxLength={4000}/></label>
       <div className="result-actions"><button className="secondary" disabled={busy||!n.headline.trim()||!n.body.trim()} onClick={()=>openPreview(n)}>ดูเต็ม / PDF</button><button className="primary" disabled={busy||!n.headline.trim()||!n.body.trim()} onClick={()=>exportOne(n)}><Download size={16}/>ดาวน์โหลด PNG</button></div>
      </div></div></article>)}
    </>}
    {tab==='templates'&&<div className="template-gallery">{themes.map(t=><article key={t.id}><div className={'mini-paper large '+t.id} style={{'--tone':t.color} as any}><div/><i/><section><span/><span/><span/></section><b/><b/><b/></div><h3>{t.name}</h3><p>{t.id==='forest'?'สำหรับอัลบั้มธรรมชาติและจิตอาสา':t.id==='editorial'?'สำหรับภาพแนวตั้งหรือภาพจำนวนน้อย':'สำหรับภาพรวมกิจกรรมและข่าวทั่วไป'}</p><button className="secondary" disabled={busy||!news.length} onClick={()=>{setNews(items=>items.map(n=>({...n,theme:t.id})));setTab('news');setNotice('ใช้แม่แบบ '+t.name+' กับข่าวทั้งชุดแล้ว');}}>ใช้กับข่าวทั้งชุด</button></article>)}</div>}
    {tab==='settings'&&<div className="settings-card"><label className="field">ชื่อโรงเรียน<input value={school} onChange={e=>setSchool(e.target.value)} maxLength={100}/></label><p>ฉบับร่างบันทึกบนเบราว์เซอร์นี้ ภาพอ่านจากอัลบั้มสาธารณะบนเว็บกิจกรรมโรงเรียน</p><p>ระบบจัดภาพ แม่แบบ และข้อความที่คุณวางลงใบข่าว ไม่มีการเขียนหรือปรับภาษาข่าวอัตโนมัติ</p></div>}
    <footer>ป่าเด็ง PR Studio <span>เลือกภาพ · วางข้อความ · พร้อมเผยแพร่</span></footer>
   </div>
  </main>
  {picker&&<div className="overlay"><section className="modal" role="dialog" aria-modal="true" aria-label="เลือกอัลบั้มภาพ"><div className="modal-title"><div><h2>เลือกอัลบั้มภาพกิจกรรม</h2><p>เลือกหนึ่งโฟลเดอร์ ระบบจะจัดภาพและแม่แบบให้ทันที</p></div><button className="icon-button" aria-label="ปิดอัลบั้ม" onClick={()=>setPicker(null)}><X/></button></div><form className="search" onSubmit={e=>{e.preventDefault();loadAlbums(1);}}><input placeholder="ค้นหาชื่อกิจกรรม…" value={query} onChange={e=>setQuery(e.target.value)}/><button className="primary" disabled={loading}>ค้นหา</button><button className="secondary" type="button" disabled={loading} aria-label="รีเฟรชอัลบั้ม" onClick={()=>loadAlbums(page)}><RefreshCw size={16}/></button></form>{albumError&&<div className="error">{albumError}</div>}{loading?<div className="empty"><Loader2 className="spin"/>กำลังโหลดอัลบั้ม…</div>:<div className="album-grid">{albums.map(a=><button key={a.id} onClick={()=>chooseAlbum(a)}>{a.cover_id?<img src={'/api/pr/image/'+a.cover_id+'/thumb'} alt={a.title}/>:<div className="no-photo"><Images/></div>}<strong>{a.title}</strong><small>{a.event_date} · {a.photo_count} ภาพ</small></button>)}{!albums.length&&!albumError&&<p>ไม่พบอัลบั้ม</p>}</div>}<div className="pagination"><button className="secondary" disabled={page<=1||loading} onClick={()=>loadAlbums(page-1)}>ก่อนหน้า</button><span>หน้า {page}</span><button className="secondary" disabled={!more||loading} onClick={()=>loadAlbums(page+1)}>ถัดไป</button></div></section></div>}
  {preview&&<div className="overlay preview-overlay"><section className="preview-modal"><div className="preview-tools"><button className="secondary" onClick={()=>window.print()}>พิมพ์ / บันทึก PDF</button><button className="secondary" onClick={()=>setPreview(null)}>ปิด <X size={16}/></button></div><img className="print-news" src={preview} alt="ใบข่าวประชาสัมพันธ์ฉบับเต็ม"/></section></div>}
 </div>;
}
