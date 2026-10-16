import { readFile, access, readdir, stat } from 'node:fs/promises';
import { CONFIG } from '../js/config.js';
import { fileURLToPath } from 'node:url';
const root=new URL('../',import.meta.url);const paths=[...Object.values(CONFIG.assets),...Object.values(CONFIG.sounds),...CONFIG.evidence.map(e=>e.image),...CONFIG.doors.map(d=>d.image),CONFIG.puzzle.source,CONFIG.puzzle.image,...CONFIG.puzzle.pieces.map(p=>p.image)];
const errors=[];
for(const p of new Set(paths)){
  try{await access(new URL(p,root));const b=await readFile(new URL(p,root));
    if(p.endsWith('.svg')&&!b.toString().includes('<svg'))errors.push(`${p}: invalid SVG`);
    if(p.endsWith('.png')&&b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')errors.push(`${p}: invalid PNG`);
    if(p.endsWith('.wav')&&(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WAVE'))errors.push(`${p}: invalid WAV`);
  }catch{errors.push(`${p}: missing`);}
}
async function files(dir){const out=[];for(const e of await readdir(new URL(dir,root),{withFileTypes:true})){if(e.isDirectory())out.push(...await files(dir+e.name+'/'));else out.push(dir+e.name);}return out;}
for(const p of [...await files('js/'),...await files('css/'), 'index.html']){
  const text=await readFile(new URL(p,root),'utf8');
  if(/(?:src|href)=["']https?:\/\//.test(text))errors.push(`${p}: remote runtime asset`);
  if(p.endsWith('.js'))for(const m of text.matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)){try{await access(new URL(m[1],new URL(p,root)));}catch{errors.push(`${p}: broken import ${m[1]}`);}}
  if(p.endsWith('.css'))for(const m of text.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){try{await access(new URL(m[1],new URL(p,root)));}catch{errors.push(`${p}: broken CSS asset ${m[1]}`);}}
}
const assets=await files('assets/');let bytes=0;for(const p of assets)bytes+=(await stat(new URL(p,root))).size;
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${new Set(paths).size} configured assets; imports and CSS assets resolved. ${assets.length} local asset files, ${(bytes/1024).toFixed(1)} KiB total. Root: ${fileURLToPath(root)}`);
