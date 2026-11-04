import assert from 'node:assert/strict';
import {pickPhotos,pickTheme,shuffleTemplate} from '../lib/news-layout.ts';
import {prApi} from '../worker/pr-api.ts';
import {buildTemplates,templatesApi} from '../worker/templates.ts';
const photos=Array.from({length:20},(_,i)=>({id:i+1,width:i===4?100:1600,height:i===4?100:1000}));
const picked=pickPhotos(photos,7);
assert.equal(picked.length,4);assert.equal(new Set(picked).size,4);
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

