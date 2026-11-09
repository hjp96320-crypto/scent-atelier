import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {build,transform} from 'esbuild';
import {perfumes} from '../prototype/data.js';
import fullRows from '../prototype/catalog-full-rows.js';
import {compactCatalogRows} from './site-build-tools.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'prototype'),output=path.join(root,'dist');
// Never accept a caller-supplied output path for this recursive clean.
if(path.dirname(output)!==root||path.basename(output)!=='dist')throw new Error('Invalid build output');
const files=new Set(['index.html','assets/README.md']);
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
const bundled=await build({
 entryPoints:[path.join(source,'app.js')],outdir:output,entryNames:'app-[hash]',chunkNames:'chunks/[name]-[hash]',
 bundle:true,splitting:true,format:'esm',platform:'browser',target:['es2022','safari15.4'],charset:'utf8',minify:true,metafile:true,
 plugins:[{name:'site-data',setup(builder){
  builder.onResolve({filter:/^\.\.?\/.*\?/},args=>({path:path.resolve(args.resolveDir,args.path.split('?')[0])}));
  builder.onLoad({filter:/catalog-full-rows\.js$/},()=>({contents:'export default '+JSON.stringify(compactCatalogRows(fullRows)),loader:'js'}));
 }}]
});
let html=await fs.readFile(path.join(source,'index.html'),'utf8');
const appOutput=Object.entries(bundled.metafile.outputs).find(([,info])=>info.entryPoint?.endsWith('/app.js'))[0];
html=html.replace(/src="app\.js[^\"]*"/,`src="${path.relative(output,path.resolve(appOutput)).split(path.sep).join('/')}"`);
const styles=[...html.matchAll(/<link rel="stylesheet" href="([^"?]+)(?:\?[^\"]*)?">/g)];
const css=(await transform((await Promise.all(styles.map(m=>fs.readFile(path.join(source,m[1]),'utf8')))).join('\n'),{loader:'css',minify:true})).code;
const cssName='site-'+createHash('sha256').update(css).digest('hex').slice(0,10)+'.css';
await fs.writeFile(path.join(output,cssName),css);
html=html.replace(styles[0][0],`<link rel="stylesheet" href="${cssName}">`);
for(const style of styles.slice(1))html=html.replace(style[0],'');
await fs.writeFile(path.join(output,'index.html'),html);
const initial=new Set();
function visit(file){if(initial.has(file))return;initial.add(file);for(const entry of bundled.metafile.outputs[file].imports)if(entry.kind==='import-statement')visit(entry.path);}
visit(appOutput);
let initialBytes=0,initialGzipBytes=0;
for(const file of initial){const content=await fs.readFile(file);initialBytes+=content.length;initialGzipBytes+=gzipSync(content).length;}
await fs.mkdir(path.join(root,'artifacts'),{recursive:true});
await fs.writeFile(path.join(root,'artifacts/site-build.json'),JSON.stringify({initialModules:initial.size,initialBytes,initialGzipBytes,outputs:bundled.metafile.outputs},null,2));
console.log(JSON.stringify({staticFiles:files.size,staticBytes:bytes,perfumes:perfumes.length,initialModules:initial.size,initialBytes,initialGzipBytes,output:'dist'}));
