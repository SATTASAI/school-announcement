import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// Frontend only. The Worker (worker/index.ts) is bundled by `wrangler deploy`
// and serves dist/ as static assets, handling /api/pr/* itself.
export default defineConfig({
 plugins:[react()],
 server:{proxy:{'/api':'http://127.0.0.1:8787'}},
});
