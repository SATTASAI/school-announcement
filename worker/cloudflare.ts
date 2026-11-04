import handler from 'vinext/server/fetch-handler';
import {prApi} from '../lib/pr-api';

export default {
 async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){
  return await prApi(request,env) ?? handler.fetch(request,env,ctx);
 },
};
