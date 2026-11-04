const BASE='https://activity.banpadengschool.ac.th';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function upstream(path:string){const r=await fetch(BASE+path,{signal:AbortSignal.timeout(25000),redirect:'manual'});if(!r.ok)throw new Error('เว็บกิจกรรมตอบกลับ '+r.status);return r;}
export async function prApi(req:Request,_env:Record<string,any>):Promise<Response|null>{
 const u=new URL(req.url);if(!u.pathname.startsWith('/api/pr/'))return null;
 try{
 if(req.method==='GET'&&u.pathname==='/api/pr/albums'){const q=(u.searchParams.get('q')||'').slice(0,100);const page=Math.max(1,Math.min(500,Number(u.searchParams.get('page'))||1));return json(await(await upstream('/api/albums?q='+encodeURIComponent(q)+'&page='+page)).json());}
 const album=u.pathname.match(/^\/api\/pr\/albums\/(\d+)$/);if(req.method==='GET'&&album)return json(await(await upstream('/api/albums/'+album[1])).json());
 const image=u.pathname.match(/^\/api\/pr\/image\/(\d+)\/(thumb|full)$/);if(req.method==='GET'&&image){const r=await upstream('/img/'+image[1]+'/'+image[2]);if(!r.headers.get('content-type')?.startsWith('image/'))return json({error:'ไม่ใช่ไฟล์ภาพ'},502);return new Response(r.body,{headers:{'Content-Type':r.headers.get('content-type')!,'Cache-Control':'private,max-age=1800','X-Content-Type-Options':'nosniff'}});}
 return json({error:'ไม่พบรายการ'},404);
 }catch(e){return json({error:e instanceof Error?e.message:'เกิดข้อผิดพลาด'},502);}
}
