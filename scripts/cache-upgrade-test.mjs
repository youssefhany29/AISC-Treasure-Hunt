// Integration check: serve a v2 runtime fixture, then replace it with this release.
// A real cached client and existing save remain alive throughout the update.
import { createRequire } from 'node:module';
import path from 'node:path';
import assert from 'node:assert/strict';
import { mkdir, writeFile, cp, readdir, utimes } from 'node:fs/promises';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(process.env.PLAYWRIGHT_MODULE_PATH||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const base=process.env.BASE_URL||'https://youssefhany29.github.io/AISC-Treasure-Hunt/';
const browser=await pw.chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={base,upgrade:'v2 framed puzzle → v3 original photo and replay',result:'FAIL'};
let activePage;
const browserErrors=[];
try{
  const context=await browser.newContext({viewport:{width:375,height:812},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  activePage=page;
  page.on('pageerror',error=>browserErrors.push(error.message));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const legacy={version:1,stage:'blueprint',evidence:['receipt','cup','napkin','coaster'],lockSolved:true,envelopeOpened:true,
    puzzle:{version:2,slots:['k7',null,null,null,null,null],tray:['m2','r9','c4','n6','f1']},blueprintSolved:false,complete:false,sound:false,hints:['blueprint']};
  await page.evaluate(state=>localStorage.setItem('treasureHunt.case02.v1',JSON.stringify(state)),legacy);
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#puzzle-board').waitFor();
  assert.equal(await page.locator('[data-slot="0"] [data-piece="k7"]').count(),1);
  console.log('BASELINE READY: v2 cached with an unfinished photo puzzle save. Waiting up to 5 minutes for deployment.');
  if(process.env.UPGRADE_FIXTURE){
    const destination=path.resolve(process.env.UPGRADE_FIXTURE);
    const source=path.resolve('.');
    for(const item of ['index.html','asset-manifest.js','sw.js','css','js','assets'])await cp(path.join(source,item),path.join(destination,item),{recursive:true,force:true});
    async function fresh(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())await fresh(p);else await utimes(p,new Date(),new Date(Date.now()+10000));}}
    await fresh(destination);
  }
  const deadline=Date.now()+300000;let available=false;
  while(Date.now()<deadline){
    const response=await fetch(new URL(`sw.js?upgrade-check=${Date.now()}`,base));
    if((await response.text()).includes('case02-static-v3-photo-replay')){available=true;break;}
    await new Promise(resolve=>setTimeout(resolve,5000));
  }
  assert.ok(available,'Updated public worker became available within 5 minutes');
  await page.evaluate(async()=>{const registration=await navigator.serviceWorker.getRegistration();await registration.update();});
  // Poll from Node: this Playwright build treats an async waitForFunction
  // predicate as truthy before its Promise resolves, which races activation.
  const activationDeadline=Date.now()+90000;let ready=false;
  while(Date.now()<activationDeadline){
    ready=await page.evaluate(async()=>{
      const keys=await caches.keys();const registration=await navigator.serviceWorker.getRegistration();
      const entry=await caches.match(new URL('./',location.href).href);
      const html=entry?await entry.text():'';
      return keys.includes('case02-static-v3-photo-replay')&&!keys.includes('case02-static-v2-photo-puzzle')&&
        html.includes('css/photo-puzzle.css')&&
        registration.active?.state==='activated'&&navigator.serviceWorker.controller===registration.active;
    });
    if(ready)break;
    await new Promise(resolve=>setTimeout(resolve,300));
  }
  assert.ok(ready,'Complete new cache and activated controller became ready');
  await page.reload({waitUntil:'networkidle'});
  if(process.env.DEBUG_UPGRADE)console.log('UPGRADE DIAGNOSTICS',await page.evaluate(async()=>{
    const html=await (await caches.match(new URL('./',location.href).href))?.text();
    const index=await (await caches.match(new URL('index.html',location.href).href))?.text();
    return{scripts:[...document.scripts].map(script=>script.src),cachedRootIsNew:html?.includes('photo-puzzle.css'),cachedIndexIsNew:index?.includes('photo-puzzle.css'),controller:navigator.serviceWorker.controller?.state};
  }));
  await page.locator('#puzzle-board').waitFor({timeout:5000});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('treasureHunt.case02.v1')));
  assert.equal(saved.puzzle.version,3);assert.equal(saved.evidence.length,4);assert.equal(saved.lockSolved,true);assert.equal(saved.sound,false);
  assert.deepEqual(saved.puzzle.slots,Array(6).fill(null));assert.equal(saved.puzzle.tray.length,6);
  await page.locator('[data-piece="k7"]').click();await page.locator('[data-place="0"]').click();
  await context.setOffline(true);await page.reload({waitUntil:'load'});await page.locator('#puzzle-board').waitFor();
  assert.equal(await page.locator('[data-slot="0"] [data-piece="k7"]').count(),1);
  assert.equal(await page.locator('img').evaluateAll(images=>images.filter(img=>!img.complete||!img.naturalWidth).length),0);
  await context.setOffline(false);
  const completed={...legacy,stage:'complete',puzzle:{version:2,slots:['k7','m2','r9','c4','n6','f1'],tray:[]},blueprintSolved:true,complete:true};
  await page.evaluate(state=>localStorage.setItem('treasureHunt.case02.v1',JSON.stringify(state)),completed);
  await page.reload({waitUntil:'networkidle'});await page.locator('.completion').waitFor();
  assert.match(await page.locator('.destination-card').innerText(),/SPOR SALONU/);
  await page.locator('#play-again').click();await page.locator('#confirm-restart').click();await page.locator('#begin').waitFor();
  assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'false');
  report.result='PASS';report.checks=['Real v2 cached client upgraded to v3','Legacy clues/case/preferences retained','New placements survive offline reload using upgraded cache','Previously completed mission remains complete and can restart with sound retained'];
  console.log('PASS: cached-client upgrade, unfinished/completed legacy saves, new placement persistence and offline images.');
}catch(error){
  report.error=error.stack;report.browserErrors=browserErrors;
  if(activePage)report.debug=await activePage.evaluate(async()=>{
    const runtime=await Promise.all(['js/main.js','js/config.js','js/game-state.js','js/stages/blueprint.js'].map(async path=>{
      const response=await caches.match(new URL(path,location.href).href);
      const text=response?await response.text():'';
      return{path,length:text.length,oldUI:text.includes('RECONSTRUCTION: 3 FRAGMENTS'),newUI:text.includes('photo-puzzle-layout'),newConfig:text.includes('puzzle: {')};
    }));
    return{text:document.body.innerText.slice(0,2500),saved:localStorage.getItem('treasureHunt.case02.v1'),caches:await caches.keys(),runtime};
  }).catch(()=>null);
  console.error(error);console.error(JSON.stringify(report.debug));process.exitCode=1;
}
finally{await mkdir('test-results/photo-replay-upgrade',{recursive:true});await writeFile('test-results/photo-replay-upgrade/report.json',JSON.stringify(report,null,2));await browser.close();}
