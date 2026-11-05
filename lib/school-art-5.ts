import type {ReferenceTemplate} from './reference-templates.ts';
import type {Rect} from './design-layout.ts';
const W=1240,H=1754;
type G=CanvasRenderingContext2D;
function box(g:G,r:Rect,fill:string|CanvasGradient,stroke:string,radius=20){g.beginPath();g.roundRect(r.x,r.y,r.w,r.h,radius);g.fillStyle=fill;g.fill();g.lineWidth=2;g.strokeStyle=stroke;g.stroke();}
function line(g:G,points:number[],color:string,width=2){g.beginPath();g.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)g.lineTo(points[i],points[i+1]);g.strokeStyle=color;g.lineWidth=width;g.stroke();}
function leaf(g:G,x:number,y:number,s:number,angle:number,color:string){g.save();g.translate(x,y);g.rotate(angle);const f=g.createLinearGradient(-s,0,s,0);f.addColorStop(0,color);f.addColorStop(1,'#e2dfb8');g.fillStyle=f;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-s,-s*.8,-s*.6,-s*1.8,0,-s*2.1);g.bezierCurveTo(s*.8,-s*1.5,s*.5,-s*.4,0,0);g.fill();line(g,[0,0,0,-s*1.9],'#ffffff66',1);g.restore();}
function blossom(g:G,x:number,y:number,s:number,color:string){
 g.save();g.translate(x,y);g.shadowColor=color+'44';g.shadowBlur=9;
 for(let i=0;i<5;i++){g.save();g.rotate(i*Math.PI*2/5);const f=g.createRadialGradient(0,-s*.12,0,0,-s*.6,s);f.addColorStop(0,'#fffdf6');f.addColorStop(.5,color+'99');f.addColorStop(1,color);g.fillStyle=f;g.beginPath();g.ellipse(0,-s*.55,s*.42,s*.7,0,0,Math.PI*2);g.fill();g.strokeStyle='#ffffff99';g.lineWidth=1;g.stroke();g.restore();}
 g.shadowBlur=0;g.fillStyle='#e0bc69';g.beginPath();g.arc(0,0,s*.18,0,7);g.fill();
 for(let i=0;i<8;i++){const a=i*Math.PI/4;g.fillStyle='#fff9d5';g.beginPath();g.arc(Math.cos(a)*s*.12,Math.sin(a)*s*.12,2,0,7);g.fill();}g.restore();
}
function spray(g:G,x:number,y:number,s:number,color:string,gold:string,flip=1){
 g.save();g.translate(x,y);g.scale(flip,1);g.strokeStyle=gold;g.lineWidth=2;g.beginPath();g.moveTo(-s*1.2,s*.8);g.bezierCurveTo(-s,-s*.9,s*.6,-s*.5,s*1.5,-s*1.8);g.stroke();
 for(let i=0;i<7;i++)leaf(g,-s+i*s*.36,s*.55-i*s*.3,s*.25,i%2?-.6:1.1,'#738b6b');
 blossom(g,-s*.45,-s*.15,s*.7,color);blossom(g,s*.5,-s*.7,s*.48,color);blossom(g,s*.95,-s*1.2,s*.27,color);
 for(let i=0;i<4;i++){g.fillStyle=gold;g.beginPath();g.arc(s*(.2+i*.3),s*(.3-i*.34),3+i%2,0,7);g.fill();}g.restore();
}
function diamond(g:G,x:number,y:number,s:number,color:string){g.save();g.translate(x,y);g.strokeStyle=color;g.lineWidth=1.5;for(const k of [1,.58]){g.beginPath();g.moveTo(0,-s*k);g.quadraticCurveTo(s*k*.45,-s*k*.35,s*k,0);g.quadraticCurveTo(s*k*.4,s*k*.35,0,s*k);g.quadraticCurveTo(-s*k*.45,s*k*.35,-s*k,0);g.quadraticCurveTo(-s*k*.4,-s*k*.35,0,-s*k);g.stroke();}g.restore();}
function book(g:G,x:number,y:number,s:number,color:string,gold:string){g.save();g.translate(x,y);g.rotate(-.09);g.fillStyle=color;g.beginPath();g.moveTo(0,s*.1);g.quadraticCurveTo(-s*.4,-s*.2,-s,-s*.05);g.lineTo(-s,-s*.72);g.quadraticCurveTo(-s*.4,-s*.88,0,-s*.6);g.quadraticCurveTo(s*.4,-s*.88,s,-s*.72);g.lineTo(s,-s*.05);g.quadraticCurveTo(s*.4,-s*.2,0,s*.1);g.fill();g.strokeStyle=gold;g.lineWidth=3;g.stroke();line(g,[0,-s*.58,0,s*.07],gold,2);for(let i=0;i<3;i++){line(g,[-s*.85,-s*(.55-i*.16),-s*.2,-s*(.48-i*.16)],'#ffffffaa',1.5);line(g,[s*.2,-s*(.48-i*.16),s*.85,-s*(.55-i*.16)],'#ffffffaa',1.5);}g.restore();}
function sparkle(g:G,x:number,y:number,s:number,color:string){g.strokeStyle=color;g.lineWidth=2;g.beginPath();g.moveTo(x-s,y);g.quadraticCurveTo(x,y,x,y-s);g.quadraticCurveTo(x,y,x+s,y);g.quadraticCurveTo(x,y,x,y+s);g.quadraticCurveTo(x,y,x-s,y);g.stroke();}
function schoolSilhouette(g:G,x:number,y:number,color:string){g.save();g.translate(x,y);g.fillStyle=color;g.fillRect(0,20,220,66);g.beginPath();g.moveTo(-10,20);g.lineTo(110,-25);g.lineTo(230,20);g.closePath();g.fill();g.fillStyle='#ffffffbb';for(let i=0;i<7;i++)for(let j=0;j<2;j++)g.fillRect(14+i*28,32+j*24,16,15);g.fillStyle=color;g.fillRect(-25,88,270,5);g.restore();}
/** Fine ornament is clipped to the margins/header/footer; live content has opaque panels. */
export function drawSchoolArt5(g:G,t:ReferenceTemplate,school:string,issue:string){
 g.save();const n=Number(t.id.split(':')[1])-41,l=t.layout,c=t.color,a=t.accent;
 const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,t.paper);bg.addColorStop(.55,'#ffffff');bg.addColorStop(1,t.paper);g.fillStyle=bg;g.fillRect(0,0,W,H);
 // Satin ribbons and gold filigree build a rich perimeter without crossing readable areas.
 for(let k=0;k<3;k++){g.beginPath();g.moveTo(-60,190+k*24);g.bezierCurveTo(310,430-k*42,770,-90+k*45,1300,220+k*22);g.lineWidth=35-k*9;g.strokeStyle=k===1?a:c+(k?'22':'cc');g.stroke();}
 g.save();g.beginPath();g.rect(0,0,W,310);g.rect(0,1525,W,H-1525);g.rect(0,310,60,1215);g.rect(1180,310,60,1215);g.clip();
 // Ten distinct visual families rather than palette-only variations.
 if(n===0||n===3){
  for(const [x,y,s,f] of [[65,120,80,1],[1165,285,63,-1],[65,1585,83,1],[1165,1595,77,-1]])spray(g,x,y,s,c,a,f);
  for(let i=0;i<12;i++)diamond(g,25,370+i*95,12,a+'99');
 }else if(n===1||n===6){
  for(let i=0;i<24;i++){const x=(i*137+35)%W,y=(i*83+20)%300;sparkle(g,x,y,5+i%4*3,a);}
  g.save();g.strokeStyle=c+'33';g.lineWidth=2;for(let i=0;i<5;i++){g.beginPath();g.ellipse(1040,150,200+i*25,70+i*15,-.5,0,7);g.stroke();}g.restore();
  for(let y=350;y<1520;y+=100){diamond(g,29,y,17,a);diamond(g,1210,y+45,10,a);}
 }else if(n===2){
  for(let i=0;i<12;i++){leaf(g,25,330+i*110,27,i%2?.5:-.4,c);leaf(g,1215,380+i*110,26,i%2?-.5:.4,c);}
  spray(g,85,200,74,'#d7b86f',a);spray(g,1155,1600,80,'#d7b86f',a,-1);
 }else if(n===4||n===7){
  for(let y=15;y<H;y+=55){diamond(g,28,y,18,a);diamond(g,1212,y+24,18,a);}
  for(let x=45;x<W;x+=55){diamond(g,x,20,15,a);diamond(g,x,1565,12,a);}
  for(const x of [110,1130]){g.strokeStyle=a;g.lineWidth=3;g.beginPath();g.moveTo(x-85,180);g.bezierCurveTo(x-85,80,x,80,x,15);g.bezierCurveTo(x,80,x+85,80,x+85,180);g.stroke();}
 }else if(n===5){
  for(let x=35;x<W;x+=32){g.fillStyle=a+'66';g.beginPath();g.arc(x,26,2,0,7);g.fill();}for(let y=365;y<1490;y+=80)box(g,{x:20,y,w:20,h:40},t.paper,a,10);
  for(let i=0;i<4;i++)line(g,[1195,350+i*150,1220,390+i*150],c+'77',8);
 }else if(n===8){
  for(let i=0;i<6;i++){g.beginPath();g.arc(55,100,85+i*24,-1.5,1.5);g.strokeStyle=i%2?a:c+'55';g.lineWidth=i%2?2:9;g.stroke();}
  for(let i=0;i<8;i++)line(g,[1188,370+i*130,1225,330+i*130],a,3);
 }else{
  for(let i=0;i<6;i++){line(g,[20+i*6,280,20+i*6,70+i*12,300,70+i*12],a+'77',1);line(g,[1220-i*6,1470,1220-i*6,1580-i*12,940,1580-i*12],a+'77',1);}
  for(const [x,y] of [[70,180],[1165,150],[70,1570],[1165,1570]])sparkle(g,x,y,35,a);
 }
 g.restore();
 g.strokeStyle=a+'99';g.lineWidth=1.5;g.strokeRect(14,14,W-28,H-28);
 // Header shape and alignment vary in addition to the content grids.
 const right=l.logo!.x>600,hx=right?105:240,hw=right?855:900;
 const hd=g.createLinearGradient(0,35,W,300);hd.addColorStop(0,c);hd.addColorStop(1,c+'dd');
 box(g,{x:right?80:225,y:55,w:right?930:935,h:210},hd,a,n%3===0?75:n%3===1?4:28);
 g.textAlign='left';g.textBaseline='top';g.fillStyle='#ffffff';
 g.font='bold 35px "Noto Sans Thai",sans-serif';g.fillText('จดหมายข่าวประชาสัมพันธ์',hx,86,hw-50);
 g.font='bold 44px "Noto Sans Thai",sans-serif';g.fillText(school||'โรงเรียนบ้านป่าเด็ง',hx,142,hw-50);
 g.font='21px "Noto Sans Thai",sans-serif';g.fillStyle='#fff2d2';g.fillText(issue||'ข่าวสารและกิจกรรมโรงเรียน',hx,215,hw-50);
 const logo=l.logo!;box(g,logo,t.paper,a,logo.w/2);g.fillStyle=c;g.font='19px "Noto Sans Thai",sans-serif';g.textAlign='center';g.fillText('ตราโรงเรียน',logo.x+logo.w/2,logo.y+logo.h/2-12,logo.w-12);
 // Every content panel is derived from the canonical locked frame, leaving decoration outside.
 const title=l.headline;
 g.save();g.shadowColor=c+'22';g.shadowBlur=16;g.shadowOffsetY=6;box(g,{x:title.x-12,y:title.y-12,w:title.w+24,h:title.h+24},c,a,n%3===1?5:28);g.restore();
 box(g,{x:l.body.x-15,y:l.body.y-16,w:l.body.w+30,h:l.body.h+32},'#ffffff',a+'88',14);
 for(const [i,p] of l.photos.entries()){
  g.save();g.shadowColor=c+'22';g.shadowBlur=12;g.shadowOffsetY=5;box(g,{x:p.x-7,y:p.y-7,w:p.w+14,h:p.h+14},'#fff',a,n%3===1?2:16);g.restore();
  const wash=g.createLinearGradient(p.x,p.y,p.x+p.w,p.y+p.h);wash.addColorStop(0,c+'12');wash.addColorStop(1,a+'22');box(g,p,wash,'#ffffff',10);
  g.save();g.beginPath();g.rect(p.x,p.y,p.w,p.h);g.clip();g.globalAlpha=.13;schoolSilhouette(g,p.x+p.w/2-110,p.y+p.h/2+10,c);g.restore();
  g.textAlign='center';g.textBaseline='middle';g.fillStyle=c+'aa';g.font='24px "Noto Sans Thai",sans-serif';g.fillText('ภาพกิจกรรม '+(i+1),p.x+p.w/2,p.y+p.h/2-20);
  // Number tags remain outside the actual photo crop.
  box(g,{x:p.x+7,y:p.y-19,w:44,h:30},c,a,8);g.fillStyle='#fff';g.font='bold 17px sans-serif';g.fillText(String(i+1).padStart(2,'0'),p.x+29,p.y-4);
 }
 // Decorative footer vignette is separate from text and the existing QR footprint.
 g.save();g.beginPath();g.rect(0,1525,W,80);g.clip();
 if(n===0){for(let i=0;i<9;i++)line(g,[260+i*45,1578,280+i*45,1538],a,2);book(g,930,1595,57,c,a);spray(g,135,1610,60,c,a);}
 else if(n===2||n===7){schoolSilhouette(g,870,1560,c+'66');for(let i=0;i<9;i++)leaf(g,170+i*60,1600,20,-.6,c);}
 else{book(g,170,1600,72,c,a);for(let i=0;i<5;i++)sparkle(g,430+i*150,1563,7+i%2*5,a);}
 g.restore();
 g.fillStyle=c;g.fillRect(0,1610,W,144);g.fillStyle=a;g.fillRect(0,1610,W,4);
 g.textAlign='left';g.textBaseline='top';g.fillStyle='#fff';g.font='25px "Noto Sans Thai",sans-serif';g.fillText('งานประชาสัมพันธ์ · '+school,75,1640,880);
 g.font='20px "Noto Sans Thai",sans-serif';g.fillStyle='#fff2d2';g.fillText('banpadengschool.ac.th',75,1700,850);
 g.restore();
}
