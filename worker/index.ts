import {prApi} from './pr-api';
import {templatesApi,syncTemplates,type DriveEnv} from './templates';

interface Env extends DriveEnv {ASSETS:{fetch(request:Request):Promise<Response>}}

export default {
 async fetch(request:Request,env:Env,ctx:{waitUntil(p:Promise<unknown>):void}):Promise<Response>{
  if(new URL(request.url).pathname==='/api/pr/templates/sync'){ // ชั่วคราว
   try{return Response.json(await syncTemplates(env,env.ASSETS));}catch(e){return Response.json({error:e instanceof Error?e.message:String(e)},{status:500});}
  }
  return (await templatesApi(request,env,ctx))
   ?? (await prApi(request,env as unknown as Record<string,unknown>))
   ?? env.ASSETS.fetch(request);
 },
};
