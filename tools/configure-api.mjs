import { readFileSync, writeFileSync } from 'node:fs';

const api = new URL(process.env.API_BASE_URL);
if (api.protocol !== 'https:' || api.pathname !== '/' || api.username || api.password || api.search || api.hash) {
  throw new Error('API_BASE_URL must be an HTTPS origin.');
}
const assistant = process.env.DEPLOY_ENV === 'prod' && process.env.ASSISTANT_PUBLIC === '1'
  ? 'https://ai.lynxpardelle.com/blog-assistant' : '';
const target = new URL('../src/environments/environment.prod.ts', import.meta.url);
const source = readFileSync(target, 'utf8');
writeFileSync(target, source.replace(/api: '[^']*'/, `api: '${api.origin}/api'`).replace(/assistant: '[^']*'/, `assistant: '${assistant}'`));
