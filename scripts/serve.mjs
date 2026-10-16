import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const port=Number(process.env.PORT || 4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.wav':'audio/wav','.json':'application/json','.md':'text/markdown; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    let pathname=decodeURIComponent(url.pathname);
    // A test-only repository prefix also verifies GitHub Pages relative paths.
    if(pathname==='/case02')pathname='/';
    if(pathname.startsWith('/case02/'))pathname=pathname.slice('/case02'.length);
    let requested=path.resolve(root,'.'+pathname);
    if(requested!==root&&!requested.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
    if(pathname.split('/').some(part=>part.startsWith('.')&&part!=='.nojekyll')){res.writeHead(403);res.end('Forbidden');return;}
    let info=await stat(requested);
    if(info.isDirectory()){requested=path.join(requested,'index.html');info=await stat(requested);}
    res.writeHead(200,{'Content-Type':types[path.extname(requested)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD')res.end();else createReadStream(requested).pipe(res);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
server.listen(port,'0.0.0.0',()=>console.log(`CASE 02 local preview: http://localhost:${port}\nRepository-path preview: http://localhost:${port}/case02/\nPress Ctrl+C to stop.`));
