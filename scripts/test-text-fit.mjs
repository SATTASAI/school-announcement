import assert from 'node:assert/strict';
import {drawText} from '../lib/news-render.ts';
const painted=[];
const g={font:'',measureText(v){const size=Number(this.font.match(/(\d+)px/)[1]);return {width:[...v].length*size*.8};},fillText(v,x,y){painted.push({v,x,y,size:Number(this.font.match(/(\d+)px/)[1])});},save(){},restore(){},beginPath(){},rect(){},clip(){}};
const frame={x:265,y:1150,w:585,h:220,size:27,color:'#4d3957',align:'left',font:'Noto Sans Thai'};
const text='โรงเรียนบ้านป่าเด็งจัดกิจกรรมการเรียนรู้เพื่อส่งเสริมทักษะและความคิดสร้างสรรค์ของนักเรียน โดยมีคณะครูและผู้ปกครองร่วมกิจกรรม เพื่อพัฒนาศักยภาพและสร้างประสบการณ์ที่ดีให้แก่นักเรียน '.repeat(3);
drawText(g,text,frame);
assert(painted.length>1);assert(painted.every(line=>line.y+line.size<=frame.y+frame.h));
assert(painted[0].size<16,'long text should fit below the previous 16px limit');
assert.equal(painted.map(line=>line.v).join(''),text);
assert.throws(()=>drawText(g,text.repeat(100),frame),/เนื้อหายาวเกินพื้นที่/);
const positions=[];
for(const verticalAlign of ['top','middle','bottom']){painted.length=0;drawText(g,'ข่าวสั้น',{...frame,verticalAlign});positions.push(painted[0].y);}
assert.equal(positions[0],frame.y);assert(positions[0]<positions[1]&&positions[1]<positions[2]);
painted.length=0;drawText(g,'ข่าวสั้น',{...frame,verticalAlign:'top'},true,true);assert.equal(painted[0].y,frame.y,'explicit top overrides legacy headline centering');
painted.length=0;drawText(g,'ข่าวสั้น',frame,true,true);assert.equal(painted[0].y,positions[1],'existing reference headline defaults to middle');
console.log('Automatic text fitting: long content remains complete and within the fixed frame; excessive content is reported.');

