export type ActivityPhoto = {id:number;width?:number;height?:number;file_name?:string};
export type ThemeId = 'blue'|'forest'|'editorial';
/** Metadata-only selection: sharpness, faces and image content are not assessed. */
export function pickPhotos(photos:ActivityPhoto[],coverId?:number):number[]{
 const unique=[...new Map(photos.filter(p=>Number.isSafeInteger(p.id)&&p.id>0).map(p=>[p.id,p])).values()];
 if(!unique.length)return [];
 const area=(p:ActivityPhoto)=>Math.max(0,p.width||0)*Math.max(0,p.height||0);
 const best=Math.max(...unique.map(area));
 const usable=unique.filter(p=>!best||!area(p)||area(p)>=best*.12);
 const candidates=usable.length>=Math.min(4,unique.length)?usable:unique;
 const hero=[...candidates].sort((a,b)=>{
  const score=(p:ActivityPhoto)=>Math.log2(1+area(p))+(p.width&&p.height&&p.width>=p.height?3:0)+(p.id===coverId?1:0);
  return score(b)-score(a);
 })[0];
 const selected=[hero.id];
 // Spread secondary choices across the album rather than taking adjacent frames.
 while(selected.length<Math.min(4,candidates.length)){
  const used=selected.map(id=>unique.findIndex(p=>p.id===id));
  const next=candidates.filter(p=>!selected.includes(p.id)).sort((a,b)=>{
   const score=(p:ActivityPhoto)=>Math.min(...used.map(i=>Math.abs(unique.indexOf(p)-i)))+Math.log2(1+area(p))*.03;
   return score(b)-score(a);
  })[0];
  selected.push(next.id);
 }
 return selected;
}
export function pickTheme(photos:ActivityPhoto[],albumTitle=''):ThemeId{
 if(/ป่า|จิตอาสา|สิ่งแวดล้อม|ปลูก|ธรรมชาติ/.test(albumTitle))return 'forest';
 const portraits=photos.filter(p=>p.width&&p.height&&p.height>p.width).length;
 return photos.length<=2||portraits>photos.length/2?'editorial':'blue';
}


export type TemplateShuffleState={pool:string[];remaining:string[]};

/** Draw from every loaded template, without repeats until a round is exhausted. */
export function shuffleTemplate(ids:string[],current:string,state?:TemplateShuffleState,rng:()=>number=Math.random):{theme:string;state:TemplateShuffleState}{
 const pool=[...new Set(ids.filter(id=>typeof id==='string'&&id.length>0))];
 if(!pool.length)return {theme:current,state:{pool,remaining:[]}};
 const shuffle=(items:string[])=>{
  for(let i=items.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  return items;
 };
 const previous=state;
 const samePool=!!previous&&Array.isArray(previous.pool)&&Array.isArray(previous.remaining)&&previous.pool.length===pool.length&&new Set(previous.pool).size===pool.length&&pool.every(id=>previous.pool.includes(id));
 let remaining=samePool?[...new Set(previous!.remaining.filter(id=>pool.includes(id)&&id!==current))]:shuffle(pool.filter(id=>id!==current));
 if(!remaining.length){
  remaining=shuffle([...pool]);
  if(remaining.length>1&&remaining[0]===current)[remaining[0],remaining[1]]=[remaining[1],remaining[0]];
 }
 return {theme:remaining[0],state:{pool,remaining:remaining.slice(1)}};
}

