// One-time integration check: run while v1 is public, then deploy v2.
// Keeps a real v1 service-worker cache and legacy save alive across the release.
import { createRequire } from 'node:module';
import path from 'node:path';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(process.env.PLAYWRIGHT_MODULE_PATH||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const base=process.env.BASE_URL||'https://youssefhany29.github.io/AISC-Treasure-Hunt/';
const browser=await pw.chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={base,upgrade:'v1 → v2 photo puzzle',result:'FAIL'};
try{
  const context=await browser.newContext({viewport:{width:375,height:812},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const legacy={version:1,stage:'blueprint',evidence:['receipt','cup','napkin','coaster'],lockSolved:true,envelopeOpened:true,
    fragments:['court','entrance','scoreboard'],blueprintSolved:false,complete:false,sound:false,hints:['blueprint']};
  await page.evaluate(state=>localStorage.setItem('treasureHunt.case02.v1',JSON.stringify(state)),legacy);
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#blueprint-board').waitFor();
  assert.equal(await page.locator('[data-fragment]').count(),3);
  console.log('BASELINE READY: original public v1 cached with an unfinished legacy blueprint save. Waiting up to 5 minutes for deployment.');
  const deadline=Date.now()+300000;let available=false;
  while(Date.now()<deadline){
    const response=await fetch(new URL(`sw.js?upgrade-check=${Date.now()}`,base));
    if((await response.text()).includes('case02-static-v2-photo-puzzle')){available=true;break;}
    await new Promise(resolve=>setTimeout(resolve,5000));
  }
  assert.ok(available,'Updated public worker became available within 5 minutes');
  await page.evaluate(async()=>{const registration=await navigator.serviceWorker.getRegistration();await registration.update();});
  await page.waitForFunction(async()=>{const keys=await caches.keys();return keys.includes('case02-static-v2-photo-puzzle')&&!keys.includes('case02-static-v1');},null,{timeout:90000});
  await page.reload({waitUntil:'networkidle'});await page.locator('#puzzle-board').waitFor();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('treasureHunt.case02.v1')));
  assert.equal(saved.evidence.length,4);assert.equal(saved.lockSolved,true);assert.equal(saved.sound,false);
  assert.deepEqual(saved.puzzle.slots,Array(6).fill(null));assert.equal(saved.puzzle.tray.length,6);
  await page.locator('[data-piece="k7"]').click();await page.locator('[data-place="0"]').click();
  await context.setOffline(true);await page.reload({waitUntil:'load'});await page.locator('#puzzle-board').waitFor();
  assert.equal(await page.locator('[data-slot="0"] [data-piece="k7"]').count(),1);
  assert.equal(await page.locator('img').evaluateAll(images=>images.filter(img=>!img.complete||!img.naturalWidth).length),0);
  await context.setOffline(false);
  const completed={...legacy,stage:'complete',fragments:['entrance','court','scoreboard'],blueprintSolved:true,complete:true};
  await page.evaluate(state=>localStorage.setItem('treasureHunt.case02.v1',JSON.stringify(state)),completed);
  await page.reload({waitUntil:'networkidle'});await page.locator('.completion').waitFor();
  assert.match(await page.locator('.destination-card').innerText(),/SPOR SALONU/);
  report.result='PASS';report.checks=['Real v1 cached client upgraded to v2','Legacy clues/case/preferences retained','New placements survive offline reload using upgraded cache','Legacy completed mission remains complete'];
  console.log('PASS: public cache upgrade, unfinished/completed legacy saves, new placement persistence and offline images.');
}catch(error){report.error=error.stack;console.error(error);process.exitCode=1;}
finally{await mkdir('test-results/photo-upgrade',{recursive:true});await writeFile('test-results/photo-upgrade/report.json',JSON.stringify(report,null,2));await browser.close();}
