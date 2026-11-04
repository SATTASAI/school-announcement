import {prApi} from './pr-api';

interface Env {ASSETS:{fetch(request:Request):Promise<Response>}}

export default {
 async fetch(request:Request,env:Env):Promise<Response>{
  return (await prApi(request,env as unknown as Record<string,unknown>)) ?? env.ASSETS.fetch(request);
 },
};
