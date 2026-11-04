import assert from 'node:assert/strict';
import {referenceTemplates} from '../lib/reference-templates.ts';
import {getNewsLayout,setPersonalTemplates,templateCapacity,isTemplateLocked,themes} from '../lib/news-render.ts';
import {filterTemplates,EMPTY_FILTERS,fitTemplatePhotos} from '../lib/template-catalogue.ts';
import {shuffleTemplate} from '../lib/news-layout.ts';
assert.equal(referenceTemplates.length,20);
assert.equal(new Set(themes.map(t=>t.id)).size,themes.length);
assert.equal(themes.length,23);
assert.deepEqual(referenceTemplates.map(t=>t.photoCount),[6,5,3,5,6,4,6,4,3,5,5,6,3,4,6,5,5,6,4,5]);
for(const t of referenceTemplates){
 assert(isTemplateLocked(t.id));assert.equal(templateCapacity(t.id),t.photoCount);
 for(const count of [1,3,6]){
  const n={theme:t.id,selected:Array.from({length:count},(_,i)=>i+1)};
  const base=getNewsLayout(n);
  assert.equal(base.photos.length,t.photoCount,'fixed frames must not reflow');
  assert.deepEqual(getNewsLayout({...n,layout:{...base,director:{x:0,y:0,w:1,h:1},photos:[]}}),base,'draft geometry cannot unlock fixed templates');
  const rects=[base.headline,base.body,base.director,...base.photos];
  for(const r of rects){assert(r.x>=0&&r.y>=0&&r.w>0&&r.h>0);assert(r.x+r.w<=1240.01&&r.y+r.h<=1754.01);}
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
   const a=rects[i],b=rects[j];assert(a.x+a.w<=b.x+.01||b.x+b.w<=a.x+.01||a.y+a.h<=b.y+.01||b.y+b.h<=a.y+.01,t.id+' overlaps');
  }
 }
 const clone={id:'local:locked',name:'clone',sourceTheme:t.id,layout:getNewsLayout({theme:'blue',selected:[1,2]}),createdAt:0};
 setPersonalTemplates([clone]);assert(isTemplateLocked(clone.id));assert.equal(getNewsLayout({theme:clone.id,selected:[1]}).photos.length,t.photoCount);
}
setPersonalTemplates([]);
const items=[...referenceTemplates,{id:'blue',name:'น้ำเงิน · ทางการ'},{id:'drive:test',name:'เขียว',photoCount:5},{id:'local:test',name:'ส่วนตัว',personal:true,photoCount:3}];
assert.equal(filterTemplates(items,{...EMPTY_FILTERS,category:'reference'},[],{}).length,20);
assert.equal(filterTemplates(items,{...EMPTY_FILTERS,category:'reference',count:'3'},[],{}).length,3);
assert.equal(filterTemplates(items,{...EMPTY_FILTERS,category:'reference',tone:'green',count:'4',style:'nature'},[],{}).some(t=>t.id==='reference:08'),true);
assert.equal(filterTemplates(items,{...EMPTY_FILTERS,query:'  ชมพู  '},[],{})[0].id,'reference:04');
assert.equal(filterTemplates(items,{...EMPTY_FILTERS,category:'starred'},['reference:03'],{}).length,1);
assert.equal(filterTemplates(items,{...EMPTY_FILTERS,category:'personal'},[],{}).length,1);
assert.equal(filterTemplates(items,{...EMPTY_FILTERS,category:'reference',tone:'purple',count:'3'},[],{}).length,0);
assert(filterTemplates(items,{...EMPTY_FILTERS,count:'3'},[],{}).some(t=>t.id==='blue'),'adaptive legacy supports each count');
assert.equal(filterTemplates(items,EMPTY_FILTERS,[],{'reference:09':99})[0].id,'reference:09');
assert.deepEqual(fitTemplatePhotos([6,5,4,3,2,1],[1,2,3,4,5,6],3),[6,5,4]);
assert.deepEqual(fitTemplatePhotos([2],[1,2,3,4,5,6],5),[2,1,3,4,5]);
assert.deepEqual(fitTemplatePhotos([2,1],[1,2,3,4]),[2,1]);
assert.deepEqual(fitTemplatePhotos([2],[1,2],6),[2,1]);
const pool=themes.map(t=>t.id);let current=pool[0],state;const seen=[current];
for(let i=1;i<pool.length;i++){const n=shuffleTemplate(pool,current,state,()=>.35);current=n.theme;state=n.state;seen.push(current);}
assert.deepEqual(new Set(seen),new Set(pool));
console.log('20 locked reference templates: bounds, non-overlap, immutable frames, personal-copy lock, filter intersections, legacy templates, photo fitting and shuffle passed.');
