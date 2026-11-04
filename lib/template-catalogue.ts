export type CatalogueItem={id:string;name:string;fileId?:string;personal?:boolean;photoCount?:number;tone?:string;style?:string;locked?:boolean;createdAt?:number;hidden?:boolean};
export type TemplateFilters={query:string;category:string;tone:string;style:string;count:string;sort:string};
export const EMPTY_FILTERS:TemplateFilters={query:'',category:'all',tone:'all',style:'all',count:'all',sort:'popular'};
export const TONES=[['blue','น้ำเงิน / ฟ้า'],['green','เขียว'],['pink','ชมพู / ครีม'],['purple','ม่วง'],['red','แดง'],['neutral','ขาว / เทา']];
export const STYLES=[['geometric','เรขาคณิต'],['ribbon','ริบบิ้น'],['wave','เส้นโค้ง / คลื่น'],['floral','ดอกไม้'],['thai','ลายไทย'],['mosaic','โมเสก'],['nature','ธรรมชาติ / ท้องถิ่น'],['ceremonial','พิธีการ'],['editorial','นิตยสาร'],['classic','ทางการ']];
export function templateMetadata(t:CatalogueItem):CatalogueItem{
 const text=t.name.toLowerCase();
 const tone=t.tone||(/เขียว|forest|green|ป่าเด็ง/.test(text)?'green':/ชมพู|pink|cream|ครีม/.test(text)?'pink':/ม่วง|violet|purple/.test(text)?'purple':/แดง|burgundy|red/.test(text)?'red':/น้ำเงิน|ฟ้า|blue|navy|sky|คราม|กรมท่า/.test(text)?'blue':/ขาว|วารสาร|white/.test(text)?'neutral':'unknown');
 const style=t.style||(/ดอกไม้|floral/.test(text)?'floral':/ลายไทย/.test(text)?'thai':/ป่า|ธรรมชาติ|forest/.test(text)?'nature':/วารสาร|นิตยสาร|editorial/.test(text)?'editorial':'classic');
 return {...t,tone,style};
}
export function filterTemplates(items:CatalogueItem[],f:TemplateFilters,favorites:string[],usage:Record<string,number>){
 const query=f.query.trim().toLocaleLowerCase('th');
 return items.map(templateMetadata).filter(t=>
  (!query||(t.name+' '+t.id).toLocaleLowerCase('th').includes(query))&&
  (f.category==='hidden'?!!t.hidden:!t.hidden&&(f.category==='all'||f.category==='starred'&&favorites.includes(t.id)||f.category==='personal'&&t.personal||f.category==='reference'&&t.id.startsWith('reference:')))&&
  (f.tone==='all'||t.tone===f.tone)&&(f.style==='all'||t.style===f.style)&&
  (f.count==='all'||(t.photoCount?t.photoCount===Number(f.count):Number(f.count)>=1&&Number(f.count)<=6))
 ).sort((a,b)=>f.sort==='newest'||f.sort==='oldest'?(!(a.createdAt||b.createdAt)?0:!a.createdAt?1:!b.createdAt?-1:(f.sort==='newest'?b.createdAt-a.createdAt:a.createdAt-b.createdAt))||a.name.localeCompare(b.name,'th'):f.sort==='popular'?(usage[b.id]||0)-(usage[a.id]||0)||a.name.localeCompare(b.name,'th'):f.sort==='starred'?Number(favorites.includes(b.id))-Number(favorites.includes(a.id))||a.name.localeCompare(b.name,'th'):a.name.localeCompare(b.name,'th'));
}
/** Keep existing choices first, then fill from the album; never duplicate or discard more than capacity requires. */
export function fitTemplatePhotos(selected:number[],available:number[],capacity?:number):number[]{
 const unique=[...new Set([...selected,...available])];
 return unique.slice(0,capacity||Math.min(6,selected.length||6));
}

