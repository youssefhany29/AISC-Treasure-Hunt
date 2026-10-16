// Serve the previous release in UPGRADE_FIXTURE, then replace it with this tree.
import { createRequire } from 'node:module';
import { cp,mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(process.env.PLAYWRIGHT_MODULE_PATH||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const base=process.env.BASE_URL||'http://127.0.0.1:4175/case02/';
assert.ok(process.env.UPGRADE_FIXTURE,'Set UPGRADE_FIXTURE to an isolated copy of the previous runtime.');
const fixture=path.resolve(process.env.UPGRADE_FIXTURE);
assert.notEqual(fixture,path.resolve('.'),'Never replace the working project with a test fixture.');
const browser=await pw.chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={base,upgrade:'v3 photo/replay → v4 olive/cream',result:'FAIL'};
try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const before=await page.evaluate(async()=>{
    const {createGame}=await import('./js/game-state.js');const g=createGame(localStorage);
    g.reset();g.start();for(const id of ['receipt','cup','napkin','coaster'])g.collect(id);
    g.openLock();g.unlock('6813');g.openEnvelope();g.placePiece('k7',0);g.placePiece('r9',2);g.setSound(false);g.useHint('blueprint');
    localStorage.setItem('unrelated.data','retained');await caches.open('unrelated-cache');return g.get();
  });
  await page.reload({waitUntil:'networkidle'});await page.locator('#puzzle-board').waitFor();
  assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(16, 25, 35)');
  for(const item of ['index.html','sw.js','asset-manifest.js','css','js','assets'])await cp(path.resolve(item),path.join(fixture,item),{recursive:true,force:true});
  await page.evaluate(async()=>{await (await navigator.serviceWorker.getRegistration()).update();});
  const deadline=Date.now()+60000;let ready=false;
  while(Date.now()<deadline){
    ready=await page.evaluate(async()=>{
      const registration=await navigator.serviceWorker.getRegistration(),keys=await caches.keys();
      return keys.includes('case02-static-v4-olive-cream')&&!keys.includes('case02-static-v3-photo-replay')&&registration.active?.state==='activated'&&navigator.serviceWorker.controller===registration.active;
    });
    if(ready)break;await new Promise(resolve=>setTimeout(resolve,300));
  }
  assert.ok(ready,'New cache installed and controller activated');
  await page.reload({waitUntil:'networkidle'});await page.locator('#puzzle-board').waitFor();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('treasureHunt.case02.v1'))),before);
  assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(250, 240, 230)');
  assert.equal(await page.locator('[data-slot="0"] [data-piece="k7"]').count(),1);
  assert.equal(await page.locator('[data-slot="2"] [data-piece="r9"]').count(),1);
  assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'false');
  assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated.data')),'retained');
  assert.ok(await page.evaluate(async()=>(await caches.keys()).includes('unrelated-cache')));
  await context.setOffline(true);await page.reload({waitUntil:'load'});await page.locator('#puzzle-board').waitFor();
  assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(250, 240, 230)');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('treasureHunt.case02.v1'))),before);
  assert.equal(await page.locator('img').evaluateAll(images=>images.filter(i=>!i.complete||!i.naturalWidth).length),0);
  report.result='PASS';report.checks=['Real v3 cache upgraded to v4','Entire saved state unchanged, including partial photo positions/tray and muted sound','Unrelated storage/cache retained','New cream theme and original images work after offline reload'];
  console.log('PASS: theme cache update preserves the entire saved mission and works offline.');
}catch(error){report.error=error.stack;console.error(error);process.exitCode=1;}
finally{await mkdir('test-results/theme-upgrade',{recursive:true});await writeFile('test-results/theme-upgrade/report.json',JSON.stringify(report,null,2));await browser.close();}
