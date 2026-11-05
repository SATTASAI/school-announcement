export type Rect={x:number;y:number;w:number;h:number};
export type TextSlot=Rect&{size:number;color:string;align:'left'|'center'|'right';verticalAlign?:'top'|'middle'|'bottom';font:'Noto Sans Thai'|'Noto Serif Thai'};
export type Crop={x:number;y:number;zoom:number};
export type PhotoPattern='hero'|'grid'|'mosaic'|'portrait-pair'|'ribbon'|'stair'|'feature-right'|'columns'|'magazine'|'tiles';
export const PHOTO_PATTERNS:PhotoPattern[]=['hero','grid','mosaic','portrait-pair','ribbon','stair','feature-right','columns','magazine','tiles'];
export type PageLayout={headline:TextSlot;body:TextSlot;director:Rect;photos:Rect[];logo?:Rect};
export type DirectorProfile={image:string;name:string;title:string};
export type PersonalTemplate={id:string;name:string;sourceTheme:string;layout:PageLayout;createdAt:number};
export const DEFAULT_DIRECTOR:Rect={x:1034,y:24,w:154,h:184};
export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const finite=(v:unknown,d:number)=>typeof v==='number'&&Number.isFinite(v)?v:d;
export function safeRect(raw:Partial<Rect>|undefined,base:Rect):Rect{
 const x=clamp(finite(raw?.x,base.x),0,1200),y=clamp(finite(raw?.y,base.y),0,1714);
 return {x,y,w:clamp(finite(raw?.w,base.w),40,1240-x),h:clamp(finite(raw?.h,base.h),40,1754-y)};
}
export function safeText(raw:Partial<TextSlot>|undefined,base:TextSlot):TextSlot{
 const verticalAlign=raw?.verticalAlign==='top'||raw?.verticalAlign==='middle'||raw?.verticalAlign==='bottom'?raw.verticalAlign:base.verticalAlign;
 return {...safeRect(raw,base),size:clamp(finite(raw?.size,base.size),16,96),color:typeof raw?.color==='string'&&/^#[0-9a-f]{6}$/i.test(raw.color)?raw.color:base.color,align:raw?.align==='left'||raw?.align==='center'||raw?.align==='right'?raw.align:base.align,font:raw?.font==='Noto Serif Thai'||raw?.font==='Noto Sans Thai'?raw.font:base.font,...(verticalAlign?{verticalAlign}:{})};
}
export function safeCrop(raw:Partial<Crop>|undefined):Crop{return {x:clamp(finite(raw?.x,0),-1,1),y:clamp(finite(raw?.y,0),-1,1),zoom:clamp(finite(raw?.zoom,1),1,4)};}
const gap=14;
function rows(area:Rect,count:number,cols=2):Rect[]{
 const rowCount=Math.ceil(count/cols),h=(area.h-gap*(rowCount-1))/rowCount,out:Rect[]=[];
 for(let row=0;row<rowCount;row++){
  const cells=Math.min(cols,count-row*cols),w=(area.w-gap*(cells-1))/cells;
  for(let col=0;col<cells;col++)out.push({x:area.x+col*(w+gap),y:area.y+row*(h+gap),w,h});
 }
 return out;
}
function subdivide(input:Rect[],count:number):Rect[]{
 const out=input.map(r=>({...r}));
 while(out.length<count){
  let largest=0;for(let i=1;i<out.length;i++)if(out[i].w*out[i].h>out[largest].w*out[largest].h)largest=i;
  const r=out[largest];
  const pair=r.w>r.h*1.1?[{...r,w:(r.w-gap)/2},{...r,x:r.x+(r.w+gap)/2,w:(r.w-gap)/2}]:[{...r,h:(r.h-gap)/2},{...r,y:r.y+(r.h+gap)/2,h:(r.h-gap)/2}];
  out.splice(largest,1,...pair);
 }
 return out;
}
/** Adaptive patterns retain every selected image, even when a template is shuffled. */
export function photoFrames(area:Rect,count:number,pattern:PhotoPattern='hero'):Rect[]{
 count=clamp(Math.trunc(count),0,6);if(!count)return [];if(count===1)return [{...area}];
 if(pattern==='grid'||pattern==='tiles')return rows(area,count,count>=5?3:2);
 if(pattern==='columns')return rows(area,count,count>=4?3:count);
 if(pattern==='mosaic'||pattern==='feature-right'){
  const heroW=(area.w-gap)*.56;
  const hero={x:area.x,y:area.y,w:heroW,h:area.h};
  const side={x:area.x+heroW+gap,y:area.y,w:area.w-heroW-gap,h:area.h};
  const out=[hero,...rows(side,count-1,count>=5?2:1)];
  return pattern==='feature-right'?out.map(r=>({...r,x:area.x+area.w-(r.x-area.x)-r.w})):out;
 }
 if(pattern==='portrait-pair'&&count>=3){
  const h=(area.h-gap)*.69,w=(area.w-gap)/2;
  return [{x:area.x,y:area.y,w,h},{x:area.x+w+gap,y:area.y,w,h},...rows({x:area.x,y:area.y+h+gap,w:area.w,h:area.h-h-gap},count-2,count-2)];
 }
 if((pattern==='stair'||pattern==='magazine')&&count>=3){
  const w=(area.w-gap)*.61,h=(area.h-gap)*.59;
  return subdivide([{x:area.x,y:area.y,w,h},{x:area.x+w+gap,y:area.y,w:area.w-w-gap,h:area.h},{x:area.x,y:area.y+h+gap,w,h:area.h-h-gap}],count);
 }
 const heroH=(area.h-gap)*(pattern==='ribbon'?.71:.6);
 return [{x:area.x,y:area.y,w:area.w,h:heroH},...rows({x:area.x,y:area.y+heroH+gap,w:area.w,h:area.h-heroH-gap},count-1,pattern==='ribbon'?count-1:Math.min(3,count-1))];
}
export function normaliseLayout(raw:Partial<PageLayout>|undefined,base:PageLayout):PageLayout{
 return {...(base.logo?{logo:safeRect(raw?.logo,base.logo)}:{}),headline:safeText(raw?.headline,base.headline),body:safeText(raw?.body,base.body),director:safeRect(raw?.director,base.director),photos:base.photos.map((r,i)=>safeRect(raw?.photos?.length===base.photos.length?raw.photos[i]:undefined,r))};
}
