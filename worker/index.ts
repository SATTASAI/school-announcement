import {prApi} from './pr-api';
import {templatesApi,seedTemplates,type DriveEnv} from './templates';

interface Env extends DriveEnv {ASSETS:{fetch(request:Request):Promise<Response>}}

export default {
 async fetch(request:Request,env:Env,ctx:{waitUntil(p:Promise<unknown>):void}):Promise<Response>{
  return (await templatesApi(request,env,ctx))
   ?? (await prApi(request,env as unknown as Record<string,unknown>))
   ?? env.ASSETS.fetch(request);
 },
 async scheduled(_event:unknown,env:Env,ctx:{waitUntil(p:Promise<unknown>):void}){
  ctx.waitUntil(seedTemplates(env,env.ASSETS).then(r=>console.log('seed templates:',r)));
 },
};
