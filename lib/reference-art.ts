import type {ReferenceTemplate} from './reference-templates.ts';
import type {Rect} from './design-layout.ts';
const W=1240,H=1754;
function path(g:CanvasRenderingContext2D,points:number[][],fill:string){g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fillStyle=fill;g.fill();}
function panel(g:CanvasRenderingContext2D,r:Rect,fill:string,stroke:string,radius=20){g.beginPath();g.roundRect(r.x,r.y,r.w,r.h,radius);g.fillStyle=fill;g.fill();g.strokeStyle=stroke;g.lineWidth=3;g.stroke();}
function flourish(g:CanvasRenderingContext2D,x:number,y:number,size:number,color:string){
 g.save();g.translate(x,y);g.fillStyle=color;
 for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-size*.5,-size*.5,0,-size);g.quadraticCurveTo(size*.5,-size*.5,0,0);g.fill();}g.restore();
}
function flower(g:CanvasRenderingContext2D,x:number,y:number,size:number,color:string){
 g.save();g.translate(x,y);for(let i=0;i<7;i++){g.rotate(Math.PI*2/7);const gr=g.createLinearGradient(0,0,0,-size);gr.addColorStop(0,'#fff9ed');gr.addColorStop(1,color);g.fillStyle=gr;g.beginPath();g.ellipse(0,-size*.48,size*.25,size*.6,0,0,Math.PI*2);g.fill();}g.fillStyle='#d9b45b';g.beginPath();g.arc(0,0,size*.13,0,Math.PI*2);g.fill();g.restore();
}
function curve(g:CanvasRenderingContext2D,y:number,color:string,width:number){g.beginPath();g.moveTo(-70,y);g.bezierCurveTo(300,y-130,840,y+140,1310,y-10);g.lineWidth=width;g.strokeStyle=color;g.stroke();}
/** Resolution-independent artwork; text and uploaded photos remain separate live layers. */
export function drawReferenceBackground(g:CanvasRenderingContext2D,t:ReferenceTemplate,school:string,issue=''){
 g.fillStyle=t.paper;g.fillRect(0,0,W,H);
 const header=t.id==='reference:04'?310:420;
 const gradient=g.createLinearGradient(0,0,W,header);gradient.addColorStop(0,t.color);gradient.addColorStop(1,t.id==='reference:01'?'#168ec6':t.color);
 g.fillStyle=gradient;g.fillRect(0,0,W,header);
 g.save();g.globalAlpha=.07;g.strokeStyle=t.accent;g.lineWidth=1;
 for(let x=-H;x<W;x+=36){g.beginPath();g.moveTo(x,0);g.lineTo(x+H,H);g.stroke();}g.restore();
 if(t.style==='geometric'||t.style==='editorial'){
  path(g,[[0,0],[440,0],[235,190],[0,190]],t.accent);
  path(g,[[0,0],[350,0],[135,190],[0,190]],t.color);
  path(g,[[W,1450],[W,H],[880,H]],t.accent);
  path(g,[[W,1515],[W,H],[975,H]],t.color);
  for(let i=0;i<4;i++)path(g,[[720+i*115,0],[790+i*115,0],[650+i*115,92],[580+i*115,92]],'#ffffff22');
 }else if(t.style==='mosaic'){
  for(let y=0;y<H;y+=44)for(const x of [0,44,W-88,W-44]){
   path(g,[[x+22,y],[x+44,y+22],[x+22,y+44],[x,y+22]],(y/44+x/44)%3===0?t.accent:'#5292cf');
   g.strokeStyle=t.paper;g.lineWidth=1;g.stroke();
  }
 }else if(t.style==='nature'){
  path(g,[[0,header],[0,260],[150,210],[240,272],[430,170],[580,265],[690,220],[840,290],[1010,200],[W,240],[W,header]],'#ffffff19');
  for(const y of [12,header-22,1580])for(let x=12;x<W;x+=30){path(g,[[x,y+8],[x+10,y],[x+20,y+8],[x+10,y+16]],t.accent);}
  for(let y=470;y<1560;y+=170)for(const x of [18,W-18]){g.save();g.translate(x,y);g.fillStyle=t.color;g.globalAlpha=.15;for(let i=0;i<4;i++){g.beginPath();g.ellipse(i%2?12:-12,i*18,9,24,i%2?.6:-.6,0,7);g.fill();}g.restore();}
 }else if(t.style==='floral'){
  g.fillStyle=t.paper;g.fillRect(0,0,W,header);
  for(const [x,y,s] of [[35,65,80],[W-30,90,67],[20,360,56],[W-15,420,73],[25,1510,72],[W-10,1510,78]])flower(g,x,y,s,t.color);
  g.strokeStyle=t.accent;g.lineWidth=3;g.strokeRect(17,18,W-34,H-36);
 }else if(t.style==='thai'||t.style==='ceremonial'){
  for(let x=30;x<W;x+=65)for(const y of [30,header-20,1580])flourish(g,x,y,12,t.accent);
  g.strokeStyle=t.accent;g.lineWidth=3;g.strokeRect(12,12,W-24,H-24);
  for(const [x,y] of [[40,450],[W-40,450],[40,1510],[W-40,1510]])flourish(g,x,y,23,t.accent);
 }
 if(t.style==='wave'||t.style==='ribbon'||t.style==='floral'){
  curve(g,header-10,t.accent,22);curve(g,header+10,t.paper,12);
  curve(g,1600,t.accent,27);curve(g,1623,t.color,40);
 }
 const l=t.layout;
 panel(g,{x:l.headline.x-10,y:l.headline.y-12,w:l.headline.w+20,h:l.headline.h+24},t.id==='reference:04'?t.paper:t.color,t.accent,t.style==='geometric'?3:36);
 if(t.style!=='geometric')for(const x of [l.headline.x+10,l.headline.x+l.headline.w-10])flourish(g,x,l.headline.y+l.headline.h/2,10,t.accent);
 g.save();g.globalAlpha=.38;g.strokeStyle=t.accent;g.lineWidth=2;g.strokeRect(l.body.x-12,l.body.y-10,l.body.w+24,l.body.h+20);g.restore();
 for(const [i,r] of l.photos.entries()){
  panel(g,{x:r.x-5,y:r.y-5,w:r.w+10,h:r.h+10},t.accent,t.accent,t.style==='geometric'?2:18);
  panel(g,r,'#e8edf0',t.paper,t.style==='geometric'?0:13);
  g.fillStyle='#8a9aa4';g.font='24px "Noto Sans Thai",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('ภาพกิจกรรม '+(i+1),r.x+r.w/2,r.y+r.h/2);
 }
 const floral=t.id==='reference:04';g.fillStyle=floral?t.color:'#fff';g.textAlign='left';g.textBaseline='top';
 // Neutral initials are a school identity placeholder, never an invented official seal.
 panel(g,{x:62,y:67,w:140,h:140},t.paper,t.accent,70);g.fillStyle=t.color;g.font='bold 28px "Noto Sans Thai",sans-serif';g.textAlign='center';g.fillText('บ.ป.ด.',132,115);
 const hx=floral?285:235,hw=floral?870:620;
 const fit=(value:string,size:number,width:number)=>{for(;size>15;size--){g.font=`bold ${size}px "Noto Sans Thai",sans-serif`;if(g.measureText(value).width<=width)break;}return size;};
 g.textAlign='left';g.fillStyle=floral?t.color:'#fff';fit('จดหมายข่าวประชาสัมพันธ์',34,hw);g.fillText('จดหมายข่าวประชาสัมพันธ์',hx,floral?65:82);
 fit(school||'โรงเรียนบ้านป่าเด็ง',48,hw);g.fillText(school||'โรงเรียนบ้านป่าเด็ง',hx,floral?150:190);
 g.fillStyle=floral?t.color:t.accent;g.font='22px "Noto Sans Thai",sans-serif';g.fillText(issue||'ข่าวสารและกิจกรรมโรงเรียน',floral?322:hx,floral?270:325,floral?580:hw);
 g.fillStyle=t.color;g.fillRect(0,1610,W,H-1610);g.fillStyle=t.accent;g.fillRect(0,1610,W,5);
 g.fillStyle='#fff';g.font='26px "Noto Sans Thai",sans-serif';g.fillText('งานประชาสัมพันธ์ · '+school,74,1640,870);g.font='21px "Noto Sans Thai",sans-serif';g.fillText('banpadengschool.ac.th',74,1700,870);
 g.textAlign='left';g.textBaseline='top';
}
