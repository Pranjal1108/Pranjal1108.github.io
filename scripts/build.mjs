import {build} from 'vite';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
await build({configFile:path.join(root,'vite.config.js')});
const output=path.join(root,'.build'),assets=path.join(root,'assets');
await fs.mkdir(assets,{recursive:true});
// Replace only generated Vite bundles; keep authored scene assets untouched.
for(const name of await fs.readdir(assets)){
 if(/^(index|flight)-[A-Za-z0-9_-]+\.(js|css)$/.test(name))await fs.unlink(path.join(assets,name));
}
await fs.cp(path.join(output,'assets'),assets,{recursive:true});
const html=await fs.readFile(path.join(output,'index.html'),'utf8');
await fs.writeFile(path.join(root,'index.html'),html.replace(/\r/g,''));
console.log('GitHub Pages files updated in repository root.');
