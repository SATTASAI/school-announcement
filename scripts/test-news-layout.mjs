import assert from 'node:assert/strict';
import {pickPhotos,pickTheme,shuffleTemplate} from '../lib/news-layout.ts';
import {prApi} from '../worker/pr-api.ts';
import {buildTemplates,templatesApi} from '../worker/templates.ts';
import {PHOTO_PATTERNS,photoFrames,safeRect,safeCrop,DEFAULT_DIRECTOR,normaliseLayout} from '../lib/design-layout.ts';
const photos=Array.from({length:20},(_,i)=>({id:i+1,width:i===4?100:1600,height:i===4?100:1000}));
const picked=pickPhotos(photos,7);
assert.equal(picked.length,6);assert.equal(new Set(picked).size,6);
assert.ok(!picked.includes(5));assert.ok(Math.max(...picked)-Math.min(...picked)>10);
assert.deepEqual(pickPhotos([],1),[]);
assert.deepEqual(pickPhotos([{id:2},{id:2},{id:-1}]),[2]);
assert.equal(pickPhotos(photos,7)[0],7);
assert.equal(pickTheme(photos,'จิตอาสาปลูกป่า'),'forest');
assert.equal(pickTheme([{id:1,width:1000,height:1600},{id:2,width:900,height:1500},{id:3,width:900,height:1500}]),'editorial');
assert.equal(pickTheme(photos,'ประชุมผู้ปกครอง'),'blue');
assert.equal(pickTheme([{id:1}]),'editorial');
assert.equal((await prApi(new Request('https://school.test/api/pr/generate',{method:'POST'}),{})).status,404);
assert.equal(await prApi(new Request('https://school.test/'),{}),null);
const files=[{id:'a1',name:'b-blue.png',mimeType:'image/png'},{id:'a2',name:'a-green.jpg',mimeType:'image/jpeg'},{id:'cfg',name:'templates.json',mimeType:'application/json'},{id:'x',name:'notes.txt',mimeType:'text/plain'}];
const tpl=buildTemplates(files,{templates:[{file:'a-green.jpg',name:'เขียว',headline:{x:-5,y:200,w:9999,color:'red'},photos:{layout:'grid',h:600},body:{h:400,size:200}}]});
assert.equal(tpl.length,2);assert.equal(tpl[0].id,'drive:a2');assert.equal(tpl[0].name,'เขียว');
assert.equal(tpl[0].headline.x,0);assert.equal(tpl[0].headline.w,1240);assert.equal(tpl[0].headline.color,'#143d73');
assert.equal(tpl[0].photos.layout,'grid');assert.equal(tpl[0].body.size,96);assert.equal(tpl[1].name,'b-blue');
assert.deepEqual((await (await templatesApi(new Request('https://school.test/api/pr/templates'),{})).json()),{templates:[],configured:false});
assert.equal(await templatesApi(new Request('https://school.test/api/pr/albums'),{}),null);
console.log('Drive templates: merge, clamping, defaults and unconfigured fallback passed.');
console.log('Passed photo selection, duplicates, small-image rejection, orientation, template choice and removal of AI endpoint.');

// Exercise all loaded built-ins + Drive templates over several complete rounds.
const catalogue=['blue','forest','editorial',...Array.from({length:21},(_,i)=>'drive:'+i)];
let current='blue',state;
const initial=[current];
for(let i=1;i<catalogue.length;i++){
 const next=shuffleTemplate(catalogue,current,state,()=>0.37);
 assert.notEqual(next.theme,current);initial.push(next.theme);current=next.theme;state=next.state;
}
assert.deepEqual(new Set(initial),new Set(catalogue));
for(let round=0;round<4;round++){
 const drawn=[];
 for(let i=0;i<catalogue.length;i++){
  const next=shuffleTemplate(catalogue,current,state,()=>0.37);
  assert.notEqual(next.theme,current);drawn.push(next.theme);current=next.theme;state=next.state;
 }
 assert.deepEqual(new Set(drawn),new Set(catalogue));
}
// JSON roundtrip preserves progress when a draft is reopened.
const restored=JSON.parse(JSON.stringify(state));
assert.deepEqual(shuffleTemplate(catalogue,current,restored,()=>0.5),shuffleTemplate(catalogue,current,state,()=>0.5));
// Added/removed Drive templates reset the round, without retaining stale IDs.
const changed=['blue','drive:new'];
let next=shuffleTemplate(changed,'blue',state,()=>0);
assert.equal(next.theme,'drive:new');assert.deepEqual(next.state.pool,changed);
assert.deepEqual(shuffleTemplate([],current,state),{theme:current,state:{pool:[],remaining:[]}});
assert.equal(shuffleTemplate(['blue','blue'],'blue').theme,'blue');
assert.equal(shuffleTemplate(['blue','drive:new'],'blue',{pool:['blue','drive:new'],remaining:['drive:new','drive:new','missing']}).theme,'drive:new');
console.log('Shuffle: 24 templates, five non-repeating rounds, round boundaries, persisted progress, catalogue changes passed.');

// All adaptive grids retain every photo and stay disjoint at every supported count.
const area={x:90,y:440,w:1060,h:770};
for(const pattern of PHOTO_PATTERNS)for(let count=1;count<=6;count++){
 const frames=photoFrames(area,count,pattern);assert.equal(frames.length,count);
 for(const r of frames){assert(r.w>0&&r.h>0);assert(r.x>=area.x-.001&&r.y>=area.y-.001);assert(r.x+r.w<=area.x+area.w+.001&&r.y+r.h<=area.y+area.h+.001);}
 for(let i=0;i<frames.length;i++)for(let j=i+1;j<frames.length;j++){
  const a=frames[i],b=frames[j];assert(a.x+a.w<=b.x+.001||b.x+b.w<=a.x+.001||a.y+a.h<=b.y+.001||b.y+b.h<=a.y+.001,pattern+' overlaps at '+count);
 }
}
assert.deepEqual(safeCrop({x:9,y:-8,zoom:20}),{x:1,y:-1,zoom:4});
const bounded=safeRect({x:1200,y:1710,w:500,h:500},DEFAULT_DIRECTOR);assert(bounded.x+bounded.w<=1240);assert(bounded.y+bounded.h<=1754);
const base={headline:{x:50,y:300,w:1100,h:120,size:42,color:'#143d73',align:'left',font:'Noto Sans Thai'},body:{x:50,y:1250,w:1100,h:350,size:28,color:'#27364a',align:'left',font:'Noto Sans Thai'},director:DEFAULT_DIRECTOR,photos:photoFrames(area,6,'mosaic')};
const restoredLayout=normaliseLayout({...base,headline:{...base.headline,x:NaN,size:Infinity},photos:photoFrames(area,3,'grid')},base);
assert.equal(restoredLayout.headline.x,50);assert.equal(restoredLayout.headline.size,42);assert.equal(restoredLayout.photos.length,6);
const modern=buildTemplates([{id:'modern-file',name:'modern.png',mimeType:'image/png'}],{templates:[{file:'modern.png',photoCount:6,director:{x:1010,y:20,w:160,h:190},photos:{pattern:'stair'}}]})[0];
assert.equal(modern.photos.pattern,'stair');assert.equal(modern.photoCount,6);assert.equal(modern.director.x,1010);
console.log('Design editor: 10 adaptive patterns × 1–6 photos, no overlap, bounds, crop limits, restored layouts and new template metadata passed.');

