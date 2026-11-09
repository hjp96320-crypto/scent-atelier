import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {perfumes} from '../prototype/data.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'prototype'),output=path.join(root,'dist');
// Never accept a caller-supplied output path for this recursive clean.
if(path.dirname(output)!==root||path.basename(output)!=='dist')throw new Error('Invalid build output');
const files=new Set(['index.html','assets/README.md']);
for(const entry of await fs.readdir(source,{withFileTypes:true})){
 if(entry.isFile()&&/\.(?:m?js|css)$/.test(entry.name)&&!entry.name.endsWith('.test.mjs'))files.add(entry.name);
}
async function includeDirectory(dir){
 for(const entry of await fs.readdir(path.join(source,dir),{withFileTypes:true})){
  const file=path.posix.join(dir,entry.name);
  if(entry.isDirectory())await includeDirectory(file);else files.add(file);
 }
}
await includeDirectory('vendor');
await includeDirectory('assets/atlas');
for(const perfume of perfumes){
 if(!perfume.image||!perfume.image.startsWith('assets/')||perfume.image.includes('..'))throw new Error(`Invalid image path: ${perfume.id}`);
 files.add(perfume.image);
}
let bytes=0;
for(const file of files)bytes+=(await fs.stat(path.join(source,file))).size;
await fs.rm(output,{recursive:true,force:true});
for(const file of files){
 const target=path.join(output,file);
 await fs.mkdir(path.dirname(target),{recursive:true});
 await fs.copyFile(path.join(source,file),target);
}
console.log(JSON.stringify({files:files.size,bytes,perfumes:perfumes.length,output:'dist'}));
