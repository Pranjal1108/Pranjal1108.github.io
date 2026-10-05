import {build} from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
await build({configFile:path.join(root,'vite.config.js')});
const output=path.join(root,'.build'),assets=path.join(root,'assets');
await fs.mkdir(assets,{recursive:true});
// Keep hashed bundles available for visitors with an older page open.
await fs.cp(path.join(output,'assets'),assets,{recursive:true});
const html=await fs.readFile(path.join(output,'index.html'),'utf8');
await fs.writeFile(path.join(root,'index.html'),html.replace(/\r/g,''));
console.log('GitHub Pages files updated in repository root.');


