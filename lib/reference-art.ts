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
 if(Number(t.id.slice(-2))>=31){drawOrnateCollection(g,t,school,issue);return;}
 if(Number(t.id.slice(-2))>=21){drawSchoolCollection3(g,t,school,issue);return;}
 if(Number(t.id.slice(-2))>=11){drawSchoolCollection(g,t,school,issue);return;}
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

/** The second collection uses independent decorative artwork and fixed content frames. */
function drawSchoolCollection(g:CanvasRenderingContext2D,t:ReferenceTemplate,school:string,issue:string){
 const index=Number(t.id.slice(-2))-11,l=t.layout;
 g.fillStyle=t.paper;g.fillRect(0,0,W,H);
 // Decorative page border and small motifs live in the margins, outside content frames.
 g.strokeStyle=t.accent;g.globalAlpha=.55;g.lineWidth=3;g.strokeRect(24,24,W-48,H-48);g.globalAlpha=1;
 g.fillStyle=t.color;g.fillRect(0,0,W,220);
 path(g,[[0,220],[W,220],[W,238],[0,252]],t.accent);
 g.save();g.globalAlpha=.22;
 if(index%3===0){
  for(let x=-30;x<W;x+=42){path(g,[[x,12],[x+14,26],[x,40],[x-14,26]],t.accent);path(g,[[x,178],[x+14,192],[x,206],[x-14,192]],t.accent);}
 }else if(index%3===1){
  for(let x=670;x<W;x+=65){g.strokeStyle=t.accent;g.lineWidth=4;g.beginPath();g.arc(x,100,24,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(x-28,155);g.lineTo(x+28,155);g.stroke();}
 }else{
  for(let x=630;x<W;x+=55){path(g,[[x,0],[x+27,0],[x-83,220],[x-110,220]],t.accent);}
 }
 g.restore();
 g.fillStyle=t.paper;g.beginPath();g.arc(110,112,57,0,Math.PI*2);g.fill();g.strokeStyle=t.accent;g.lineWidth=4;g.stroke();
 g.fillStyle=t.color;g.textAlign='center';g.textBaseline='middle';g.font='bold 23px "Noto Sans Thai",sans-serif';g.fillText('บ.ป.ด.',110,112);
 g.textAlign='left';g.textBaseline='top';g.fillStyle='#fff';g.font='bold 32px "Noto Sans Thai",sans-serif';g.fillText('จดหมายข่าวประชาสัมพันธ์',195,49,850);
 g.font='bold 43px "Noto Sans Thai",sans-serif';g.fillText(school||'โรงเรียนบ้านป่าเด็ง',195,100,850);
 g.fillStyle=t.accent;g.font='20px "Noto Sans Thai",sans-serif';g.fillText(issue||'ข่าวสารและกิจกรรมโรงเรียน',197,165,750);
 // Panels follow the actual locked rectangles rather than assuming a common layout.
 panel(g,{x:l.headline.x-9,y:l.headline.y-10,w:l.headline.w+18,h:l.headline.h+20},t.color,t.accent,index%3===1?4:24);
 g.save();g.globalAlpha=.45;g.strokeStyle=t.accent;g.lineWidth=2;g.strokeRect(l.body.x-10,l.body.y-10,l.body.w+20,l.body.h+20);g.restore();
 for(const [i,r] of l.photos.entries()){
  panel(g,{x:r.x-5,y:r.y-5,w:r.w+10,h:r.h+10},t.accent,t.accent,index%3===1?2:15);
  panel(g,r,'#e8edf0',t.paper,index%3===1?0:10);
  g.fillStyle='#8495a0';g.font='24px "Noto Sans Thai",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('ภาพกิจกรรม '+(i+1),r.x+r.w/2,r.y+r.h/2);
 }
 // Additional themed detailing is kept to the side margins.
 g.globalAlpha=.55;for(let y=300;y<1540;y+=95){
  if(t.style==='floral')flower(g,37,y,12,t.accent);
  else if(t.style==='nature'||t.style==='thai')flourish(g,37,y,11,t.accent);
  else {g.fillStyle=t.accent;g.beginPath();g.arc(37,y,4,0,Math.PI*2);g.fill();}
 }g.globalAlpha=1;
 g.fillStyle=t.color;g.fillRect(0,1610,W,144);g.fillStyle=t.accent;g.fillRect(0,1610,W,5);
 g.fillStyle='#fff';g.textAlign='left';g.textBaseline='top';g.font='26px "Noto Sans Thai",sans-serif';g.fillText('งานประชาสัมพันธ์ · '+school,74,1640,850);g.font='21px "Noto Sans Thai",sans-serif';g.fillText('banpadengschool.ac.th',74,1700,850);
}

/** Artwork for the third collection is independent from the placed content. */
function drawSchoolCollection3(g:CanvasRenderingContext2D,t:ReferenceTemplate,school:string,issue:string){
 const l=t.layout,n=Number(t.id.slice(-2))-21,logo=l.logo!,right=logo.x>600;
 g.fillStyle=t.paper;g.fillRect(0,0,W,H);
 // A light pattern ties the full page together without reducing contrast in text frames.
 g.save();g.globalAlpha=.10;g.strokeStyle=t.color;g.lineWidth=2;
 for(let y=270;y<1580;y+=76)for(let x=45;x<W;x+=76){
  g.beginPath();if(n%4===0){g.moveTo(x,y-9);g.lineTo(x+9,y);g.lineTo(x,y+9);g.lineTo(x-9,y);g.closePath();}
  else if(n%4===1){g.arc(x,y,8,0,Math.PI*2);g.moveTo(x+8,y);g.lineTo(x+24,y);}
  else if(n%4===2){g.moveTo(x-8,y);g.lineTo(x+8,y);g.moveTo(x,y-8);g.lineTo(x,y+8);}
  else {g.arc(x,y,10,0,Math.PI);g.moveTo(x-10,y);g.lineTo(x+10,y);}g.stroke();
 }
 g.restore();
 // Different school-appropriate motifs frame the headline area.
 const grad=g.createLinearGradient(0,0,W,230);grad.addColorStop(0,t.color);grad.addColorStop(1,t.color);g.fillStyle=grad;g.fillRect(0,0,W,230);
 g.save();g.globalAlpha=.24;
 if(n===0||n===9){for(let x=0;x<W;x+=42)for(const y of [15,195])path(g,[[x,y+12],[x+15,y],[x+30,y+12],[x+15,y+24]],t.accent);}
 else if(n===1||n===4){for(let x=30;x<W;x+=82){g.strokeStyle=t.accent;g.lineWidth=3;g.beginPath();g.arc(x,28,12,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(x+12,28);g.lineTo(x+67,28);g.stroke();}}
 else if(n===2||n===8){for(let x=25;x<W;x+=55)flourish(g,x,24,13,t.accent);}
 else if(n===3||n===5){for(let x=28;x<W;x+=90)flower(g,x,25,21,t.accent);}
 else {for(let x=-160;x<W;x+=145)path(g,[[x,0],[x+60,0],[x+205,230],[x+145,230]],t.accent);}
 g.restore();
 g.fillStyle=t.accent;g.fillRect(0,230,W,7);
 // Logo positions are part of the template, not inferred from its artwork.
 g.fillStyle=t.paper;g.beginPath();g.ellipse(logo.x+logo.w/2,logo.y+logo.h/2,logo.w/2,logo.h/2,0,0,Math.PI*2);g.fill();g.strokeStyle=t.accent;g.lineWidth=4;g.stroke();
 g.textAlign='center';g.textBaseline='middle';g.fillStyle=t.color;g.font='bold 23px "Noto Sans Thai",sans-serif';g.fillText('บ.ป.ด.',logo.x+logo.w/2,logo.y+logo.h/2);
 const hx=right?78:205,hw=right?910:945;
 g.fillStyle='#ffffff';g.textBaseline='top';g.textAlign='left';g.font='bold 31px "Noto Sans Thai",sans-serif';g.fillText('จดหมายข่าวประชาสัมพันธ์',hx,55,hw);
 g.font='bold 42px "Noto Sans Thai",sans-serif';g.fillText(school||'โรงเรียนบ้านป่าเด็ง',hx,102,hw);
 g.fillStyle=t.accent;g.font='20px "Noto Sans Thai",sans-serif';g.fillText(issue||'ข่าวสารและกิจกรรมโรงเรียน',hx,170,hw);
 // Labels and rails are deliberately outside the locked content slots.
 const title=l.headline;panel(g,{x:title.x-8,y:title.y-9,w:title.w+16,h:title.h+18},t.color,t.accent,n%2?8:25);
 g.save();g.globalAlpha=.55;g.strokeStyle=t.accent;g.lineWidth=3;g.strokeRect(l.body.x-12,l.body.y-10,l.body.w+24,l.body.h+20);g.restore();
 for(const [i,r] of l.photos.entries()){
  const radius=n%3===0?3:n%3===1?20:10;panel(g,{x:r.x-5,y:r.y-5,w:r.w+10,h:r.h+10},t.accent,t.accent,radius);
  panel(g,r,'#e8edf0',t.paper,Math.max(0,radius-4));g.fillStyle='#7c919a';g.textAlign='center';g.textBaseline='middle';g.font='23px "Noto Sans Thai",sans-serif';g.fillText('ภาพกิจกรรม '+(i+1),r.x+r.w/2,r.y+r.h/2);
 }
 g.fillStyle=t.color;g.fillRect(0,1610,W,144);g.fillStyle=t.accent;g.fillRect(0,1610,W,5);
 g.fillStyle='#fff';g.textAlign='left';g.textBaseline='top';g.font='26px "Noto Sans Thai",sans-serif';g.fillText('งานประชาสัมพันธ์ · '+school,74,1640,850);g.font='21px "Noto Sans Thai",sans-serif';g.fillText('banpadengschool.ac.th',74,1700,850);
}

/** Ornamental backgrounds keep the designer's content and emblem slots unobstructed. */
function drawOrnateCollection(g:CanvasRenderingContext2D,t:ReferenceTemplate,school:string,issue:string){
 const n=Number(t.id.slice(-2))-31,l=t.layout,logo=l.logo!,right=logo.x>600;
 const gold=t.accent;
 g.fillStyle=t.paper;g.fillRect(0,0,W,H);
 // Warm paper, fine framing and repeating ornament live beneath the content.
 g.save();g.strokeStyle=gold;g.lineWidth=2;g.globalAlpha=.6;g.strokeRect(24,24,W-48,H-48);g.strokeRect(34,34,W-68,H-68);
 g.globalAlpha=.10;g.lineWidth=1;
 for(let y=270;y<1590;y+=58)for(let x=70;x<W-55;x+=58){
  g.beginPath();if(n%3===0){g.moveTo(x,y-8);g.quadraticCurveTo(x+10,y,x,y+8);g.quadraticCurveTo(x-10,y,x,y-8);}
  else if(n%3===1){g.arc(x,y,7,0,Math.PI*2);g.moveTo(x-12,y);g.lineTo(x+12,y);}
  else {g.moveTo(x-6,y-6);g.lineTo(x+6,y+6);g.moveTo(x+6,y-6);g.lineTo(x-6,y+6);}g.stroke();
 }
 g.restore();
 const head=g.createLinearGradient(0,0,W,240);head.addColorStop(0,t.color);head.addColorStop(.55,t.color);head.addColorStop(1,t.color);g.fillStyle=head;g.fillRect(0,0,W,230);
 g.save();g.strokeStyle=gold;g.fillStyle=gold;g.lineWidth=2;g.globalAlpha=.55;
 // Distinct ornamental families: Thai diamonds, Deco rays, blossoms and woven borders.
 if(n===0||n===3||n===8){for(let x=20;x<W;x+=54){flourish(g,x,18,11,gold);flourish(g,x,210,11,gold);}}
 else if(n===1||n===7||n===9){
  for(let x=0;x<W;x+=100){g.beginPath();g.moveTo(x,0);g.lineTo(x+50,50);g.lineTo(x+100,0);g.stroke();g.beginPath();g.moveTo(x,230);g.lineTo(x+50,180);g.lineTo(x+100,230);g.stroke();}
 }else if(n===2||n===6){for(let x=30;x<W;x+=110){flower(g,x,20,20,gold);flower(g,x,210,20,gold);}}
 else {for(let x=0;x<W;x+=44){path(g,[[x,10],[x+15,20],[x,30],[x-15,20]],gold);path(g,[[x,200],[x+15,210],[x,220],[x-15,210]],gold);}}
 g.restore();
 g.fillStyle=gold;g.fillRect(0,230,W,6);g.fillStyle=t.paper;g.fillRect(0,236,W,6);
 // Double-line corners lend detail while leaving all locked content slots clear.
 g.save();g.strokeStyle=gold;g.globalAlpha=.6;g.lineWidth=2;
 for(const [x,sign] of [[45,1],[W-45,-1]] as const){for(let y=285;y<1530;y+=130){g.beginPath();g.moveTo(x,y-30);g.quadraticCurveTo(x+sign*18,y,x,y+30);g.quadraticCurveTo(x-sign*12,y,x,y-30);g.stroke();}}
 g.restore();
 g.beginPath();g.ellipse(logo.x+logo.w/2,logo.y+logo.h/2,logo.w/2,logo.h/2,0,0,Math.PI*2);g.fillStyle=t.paper;g.fill();g.strokeStyle=gold;g.lineWidth=5;g.stroke();
 g.fillStyle=t.color;g.textAlign='center';g.textBaseline='middle';g.font='bold 23px "Noto Sans Thai",sans-serif';g.fillText('บ.ป.ด.',logo.x+logo.w/2,logo.y+logo.h/2);
 const hx=right?80:215,hw=right?900:930;
 g.fillStyle='#ffffff';g.textAlign='left';g.textBaseline='top';g.font='bold 31px "Noto Sans Thai",sans-serif';g.fillText('จดหมายข่าวประชาสัมพันธ์',hx,53,hw);
 g.font='bold 42px "Noto Sans Thai",sans-serif';g.fillText(school||'โรงเรียนบ้านป่าเด็ง',hx,103,hw);
 g.font='20px "Noto Sans Thai",sans-serif';g.fillStyle=gold;g.fillText(issue||'ข่าวสารและกิจกรรมโรงเรียน',hx,172,hw);
 const a=l.headline;panel(g,{x:a.x-10,y:a.y-10,w:a.w+20,h:a.h+20},t.color,gold,n%3===1?4:28);
 g.save();g.strokeStyle=gold;g.globalAlpha=.75;g.lineWidth=2;g.strokeRect(l.body.x-12,l.body.y-10,l.body.w+24,l.body.h+20);g.restore();
 for(const [i,p] of l.photos.entries()){
  const radius=n%3===1?3:15;panel(g,{x:p.x-6,y:p.y-6,w:p.w+12,h:p.h+12},gold,gold,radius+2);
  panel(g,p,'#e7ecea',t.paper,radius);g.fillStyle='#7c8e90';g.textAlign='center';g.textBaseline='middle';g.font='23px "Noto Sans Thai",sans-serif';g.fillText('ภาพกิจกรรม '+(i+1),p.x+p.w/2,p.y+p.h/2);
 }
 g.fillStyle=t.color;g.fillRect(0,1610,W,144);g.fillStyle=gold;g.fillRect(0,1610,W,5);
 g.textAlign='left';g.textBaseline='top';g.fillStyle='#fff';g.font='26px "Noto Sans Thai",sans-serif';g.fillText('งานประชาสัมพันธ์ · '+school,74,1640,850);g.font='21px "Noto Sans Thai",sans-serif';g.fillText('banpadengschool.ac.th',74,1700,850);
}
