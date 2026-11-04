import vinext from 'vinext';
import {defineConfig} from 'vite';
import {cloudflare} from '@cloudflare/vite-plugin';

// Standalone Cloudflare build: no Sites account, preview service or AI key.
export default defineConfig({
 plugins:[
  vinext(),
  cloudflare({
   configPath:'./wrangler.jsonc',
   viteEnvironment:{name:'rsc',childEnvironments:['ssr']},
   inspectorPort:false,
  }),
 ],
});
