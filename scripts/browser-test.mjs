import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;
try { playwright=require('playwright'); } catch {
  const modulePath=process.env.PLAYWRIGHT_MODULE_PATH || path.join(process.env.USERPROFILE||'', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  try { playwright=require(modulePath); } catch { throw new Error('Install Playwright for browser QA: npm install --no-save playwright, then npx playwright install chromium.'); }
}
const base=process.env.BASE_URL||'http://localhost:4173/case02/';
const output=path.resolve('test-results',process.env.TEST_LABEL||'local');await mkdir(output,{recursive:true});
const chrome=process.env.BROWSER_EXECUTABLE || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>existsSync(p));
const browser=await playwright.chromium.launch({headless:true,...(chrome?{executablePath:chrome}:{}),args:['--autoplay-policy=no-user-gesture-required']});
const summary={base,engine:'Chromium',widths:[],checks:[],errors:[]};
const widths=process.env.TEST_WIDTHS ? process.env.TEST_WIDTHS.split(',').map(Number) : [320,375,390,430,768,1024];
const motion=process.env.TEST_REDUCED_MOTION==='false'?'no-preference':'reduce';
const pieceIds=['k7','m2','r9','c4','n6','f1'];

async function dragPiece(page,id,targetSelector,touch=false,checkHover=false,cancel=false){
  await page.locator('#photo-puzzle-layout').scrollIntoViewIfNeeded();
  const source=await page.locator(`[data-piece="${id}"]`).boundingBox();
  const target=await page.locator(targetSelector).boundingBox();
  assert.ok(source&&target,'Drag source and target exist');
  const from={x:source.x+source.width/2,y:source.y+source.height/2};
  const to={x:target.x+target.width/2,y:target.y+target.height/2};
  let session;
  const point=(x,y)=>({x,y,id:1,radiusX:7,radiusY:7,force:.8});
  if(touch){session=await page.context().newCDPSession(page);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(from.x,from.y)]});await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(from.x+8,from.y-8)]});}
  else{await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(from.x+8,from.y-8);}
  await page.waitForFunction(()=>!!document.querySelector('.puzzle-drag-ghost'));
  assert.match(await page.locator('#blueprint-status').innerText(),/PICKED UP/);
  if(touch){for(let i=1;i<=12;i++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(from.x+(to.x-from.x)*i/12,from.y+(to.y-from.y)*i/12)]});}}
  else await page.mouse.move(to.x,to.y,{steps:12});
  if(checkHover)assert.equal(await page.locator(targetSelector).evaluate(el=>el.classList.contains('drag-over')),true,'Slot/tray hover feedback');
  if(touch){await session.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});await session.detach();}
  else if(cancel){await page.keyboard.press('Escape');await page.mouse.up();}else await page.mouse.up();
  await page.waitForFunction(()=>!document.querySelector('.puzzle-drag-ghost'));
}
try {
  for(const width of widths){
    const context=await browser.newContext({viewport:{width,height:Number(process.env.TEST_HEIGHT)||900},deviceScaleFactor:1,reducedMotion:motion,hasTouch:width<600,isMobile:width<600});
    const page=await context.newPage();
    const issues=[];
    page.on('pageerror',err=>issues.push(err.message));
    page.on('console',msg=>{if(msg.type()==='error')issues.push(msg.text());});
    page.on('response',response=>{if(response.status()>=400)issues.push(`${response.status()} ${response.url()}`);});
    async function screen(name,hasLogo=false){
      await page.waitForFunction(()=>document.querySelector('#main')?.getAttribute('aria-busy')==='false');
      if(motion==='no-preference')await page.waitForTimeout(700);
      await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=r;img.onerror=r;})));});
      assert.equal(await page.locator('.aisc-logo').count(),hasLogo?1:0,`${width}/${name}: logo placement`);
      const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
      assert.ok(overflow.scroll<=overflow.width,`${width}/${name}: horizontal overflow ${JSON.stringify(overflow)}`);
      const broken=await page.locator('img').evaluateAll(images=>images.filter(img=>!img.complete||img.naturalWidth===0).map(img=>img.src));
      assert.deepEqual(broken,[],`${width}/${name}: image loading`);
      if(name!=='complete')assert.equal((await page.locator('body').innerText()).includes('SPOR SALONU'),false,`${name}: premature destination`);
      // Every visible control must remain inside the viewport horizontally.
      const clipped=await page.locator('button:visible,a:visible').evaluateAll(elements=>elements.filter(e=>{const r=e.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+.5;}).map(e=>e.textContent.trim()));
      assert.deepEqual(clipped,[],`${width}/${name}: clipped controls`);
      await page.screenshot({path:path.join(output,`${width}-${name}.png`),fullPage:true});
    }
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.locator('#begin').waitFor();await screen('intro',true);
    if(width===390){
      await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
      await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
      await context.setOffline(true);
      summary.checks.push('390px entire investigation played offline after initial cache');
    }
    await page.locator('#begin').click();await page.locator('.cafe-scene').waitFor();await screen('cafe');
    await page.locator('[data-object="receipt"]').click();await page.locator('dialog[open]').waitFor();
    assert.match(await page.locator('#modal-content').innerText(),/▲\s*=\s*8/);
    await page.locator('[data-close]').click();
    // Reload mid-investigation and inspect the same clue again: count stays one.
    await page.reload({waitUntil:'domcontentloaded'});await page.locator('.cafe-scene').waitFor();
    assert.match(await page.locator('#evidence-count').innerText(),/1\s*\/4/);
    await page.locator('[data-object="receipt"]').click();await page.locator('[data-close]').click();
    assert.match(await page.locator('#evidence-count').innerText(),/1\s*\/4/);
    for(const [id,symbol,value] of [['cup','●','3'],['napkin','■','6'],['coaster','★','1']]){
      await page.locator(`[data-object="${id}"]`).click();await page.locator('dialog[open]').waitFor();
      const text=await page.locator('.cipher-mark').innerText();assert.ok(text.includes(symbol)&&text.includes(value));
      await page.locator('[data-close]').click();
    }
    await page.locator('#open-case').click();await page.locator('.keypad').waitFor();await screen('lock');
    await page.locator('[data-action="inventory"]').click();assert.equal(await page.locator('.inventory-item img').count(),4);await page.locator('[data-close]').click();
    await page.locator('[data-action="hint"]').click();assert.match(await page.locator('#modal-content').innerText(),/follow the order/i);await page.locator('[data-close]').click();
    for(const key of ['1','2','3','4'])await page.locator(`[data-key="${key}"]`).click();
    await page.locator('#unlock').click();assert.match(await page.locator('#lock-feedback').innerText(),/ACCESS DENIED/);
    // Test clear and delete as well as the successful sequence.
    await page.locator('[data-key="5"]').click();await page.locator('[data-key="DEL"]').click();
    await page.locator('[data-key="9"]').click();await page.locator('[data-key="C"]').click();
    await page.reload({waitUntil:'domcontentloaded'});await page.locator('.keypad').waitFor();
    for(const key of ['6','8','1','3'])await page.locator(`[data-key="${key}"]`).click();
    await page.locator('#unlock').click();await page.locator('#envelope').waitFor();await screen('envelope');
    await page.locator('#envelope').click();await page.locator('#puzzle-board').waitFor();await screen('photo-empty');
    await page.locator('[data-action="hint"]').click();assert.match(await page.locator('#modal-content').innerText(),/Drag the pieces into the correct positions/);await page.locator('[data-close]').click();
    assert.equal(await page.locator('.puzzle-slot').count(),6);assert.equal(await page.locator('#puzzle-board [data-piece]').count(),0);
    let order=await page.locator('#puzzle-tray [data-piece]').evaluateAll(elements=>elements.map(e=>e.dataset.piece));assert.notDeepEqual(order,pieceIds);
    const geometry=await page.locator('.puzzle-slot').evaluateAll(slots=>slots.map(el=>{const r=el.getBoundingClientRect();return{x:Math.round(r.x),y:Math.round(r.y),w:r.width,h:r.height};}));
    assert.equal(new Set(geometry.map(r=>r.x)).size,3);assert.equal(new Set(geometry.map(r=>r.y)).size,2);
    assert.ok(geometry.every((r,i)=>Math.abs(r.w/r.h-164/(i<3?180:181))<.01),'Photo crop proportions retained');
    assert.equal(await page.locator('.piece-ref').count(),0,'No added labels on photo tiles');
    const touch=width<600;
    await dragPiece(page,'k7','[data-slot="1"]',touch,true);assert.match(await page.locator('#blueprint-status').innerText(),/DON’T MATCH/);assert.equal(await page.locator('#puzzle-board [data-piece]').count(),0);
    assert.deepEqual(await page.locator('#puzzle-tray [data-piece]').evaluateAll(elements=>elements.map(e=>e.dataset.piece)),order);
    await dragPiece(page,'k7','[data-slot="0"]',touch,true);assert.equal(await page.locator('[data-slot="0"] [data-piece="k7"]').count(),1);
    await dragPiece(page,'m2','[data-slot="0"]',touch);assert.equal(await page.locator('[data-slot="0"] [data-piece="k7"]').count(),1);
    await dragPiece(page,'k7','#puzzle-tray',touch,true);assert.equal(await page.locator('#puzzle-board [data-piece]').count(),0);
    await dragPiece(page,'k7','[data-slot="0"]',touch);assert.match(await page.locator('#placed-count').innerText(),/1 \/ 6/);
    const savedTray=await page.locator('#puzzle-tray [data-piece]').evaluateAll(elements=>elements.map(e=>e.dataset.piece));
    await page.reload({waitUntil:'domcontentloaded'});await page.locator('#puzzle-board').waitFor();assert.equal(await page.locator('[data-slot="0"] [data-piece="k7"]').count(),1);
    assert.deepEqual(await page.locator('#puzzle-tray [data-piece]').evaluateAll(elements=>elements.map(e=>e.dataset.piece)),savedTray);
    // Native button keyboard activation provides a fully usable drag alternative.
    await page.locator('[data-piece="m2"]').focus();await page.keyboard.press('Space');await page.locator('[data-place="1"]').focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('[data-slot="1"] [data-piece="m2"]').count(),1);
    await dragPiece(page,'r9','[data-slot="2"]',touch,false,true);assert.equal(await page.locator('[data-slot="2"] [data-piece]').count(),0,'Canceled drag preserves state');
    for(let i=2;i<6;i++)await dragPiece(page,pieceIds[i],`[data-slot="${i}"]`,touch);
    await page.locator('#puzzle-board.restored').waitFor();await screen('photo-restored');assert.match(await page.locator('#placed-count').innerText(),/6 \/ 6/);
    // Progression must happen automatically when all six correct slots are full.
    await page.locator('.doors').waitFor();await screen('deduction');
    for(const door of ['A','B','C']){await page.locator(`[data-door="${door}"]`).click();assert.equal(await page.locator('.completion').count(),0);}
    await page.locator('[data-door="D"]').click();await page.locator('.completion').waitFor();await screen('complete',true);
    assert.match(await page.locator('.destination-card').innerText(),/SPOR SALONU/);
    assert.equal(await page.locator('a:has-text("CONTINUE TO THE NEXT CHECKPOINT")').count(),0);
    await page.locator('#show-result').click();
    await page.reload({waitUntil:'domcontentloaded'});await page.locator('.completion').waitFor();assert.equal(await page.locator('.aisc-logo').count(),1);
    if(width===390){
      const decoded=await page.evaluate(async()=>{
        const {CONFIG}=await import('./js/config.js');const context=new (window.AudioContext||window.webkitAudioContext)();
        const results=[];for(const p of new Set(Object.values(CONFIG.sounds))){const response=await fetch(p);const buffer=await context.decodeAudioData(await response.arrayBuffer());results.push({path:p,duration:buffer.duration,channels:buffer.numberOfChannels});}
        await context.close();return results;
      });assert.ok(decoded.length>=10);assert.ok(decoded.every(d=>d.duration>0&&d.channels>0));summary.checks.push(`Audio: ${decoded.length} local WAV effects decoded by browser`);
      // An installed worker must allow an offline refresh of the finished game.
      await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
      await context.setOffline(true);await page.reload({waitUntil:'load'});await page.locator('.completion').waitFor();
      assert.match(await page.locator('.destination-card').innerText(),/SPOR SALONU/);summary.checks.push('Offline refresh and local asset loading passed');
      await context.setOffline(false);
    }
    // Confirm/cancel from the result; then finish and restart two more times.
    await page.locator('#sound-toggle').click();
    const sound=await page.locator('#sound-toggle').getAttribute('aria-pressed');
    await page.evaluate(()=>localStorage.setItem('unrelated.browser.data','keep me'));
    let navigations=0;page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations++;});
    for(let run=0;run<3;run++){
      await page.locator('#play-again').click();
      assert.equal(await page.locator('#modal-title').innerText(),'Restart the mission from the beginning?');
      await page.locator('[data-close]').click();
      assert.equal(await page.locator('.completion').count(),1,'Cancel keeps completed mission');
      await page.locator('#play-again').click();await page.locator('#confirm-restart').click();
      await page.locator('#begin').waitFor();
      assert.equal(navigations,0,'Restart requires no navigation or refresh');
      assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),sound);
      const reset=await page.evaluate(()=>({state:JSON.parse(localStorage.getItem('treasureHunt.case02.v1')),other:localStorage.getItem('unrelated.browser.data')}));
      assert.equal(reset.other,'keep me');assert.equal(reset.state.stage,'intro');assert.equal(reset.state.complete,false);
      assert.deepEqual(reset.state.evidence,[]);assert.deepEqual(reset.state.puzzle.slots,Array(6).fill(null));
      assert.equal(reset.state.lockSolved,false);assert.equal(reset.state.envelopeOpened,false);assert.equal(reset.state.blueprintSolved,false);assert.deepEqual(reset.state.hints,[]);
      if(run===2)break;
      await page.locator('#begin').click();await page.locator('.cafe-scene').waitFor();
      for(const id of ['receipt','cup','napkin','coaster']){
        await page.locator(`[data-object="${id}"]`).click();await page.locator('dialog[open]').waitFor();await page.locator('[data-close]').click();
      }
      await page.locator('#open-case').click();await page.locator('.keypad').waitFor();
      for(const key of ['6','8','1','3'])await page.locator(`[data-key="${key}"]`).click();
      await page.locator('#unlock').click();await page.locator('#envelope').waitFor();await page.locator('#envelope').click();await page.locator('#puzzle-board').waitFor();
      assert.equal(await page.locator('#puzzle-board [data-piece]').count(),0);
      for(let i=0;i<6;i++)await dragPiece(page,pieceIds[i],`[data-slot="${i}"]`,touch);
      await page.locator('.doors').waitFor();await page.locator('[data-door="D"]').click();await page.locator('.completion').waitFor();
    }
    await page.locator('#begin').click();await page.locator('.cafe-scene').waitFor();
    assert.deepEqual(issues,[],`${width}: browser errors`);
    summary.widths.push({width,result:'PASS',flow:'three complete playthroughs, each restarted, then start again',restart:'confirmed and canceled, no refresh, sound and unrelated storage retained',puzzle:'original photograph, 3 columns × 2 rows',dragging:touch?'real touch events':'mouse',screens:8,logo:'intro and complete only',overflow:'none',consoleErrors:0});
    console.log(`PASS ${width}px: ${touch?'touch':'mouse'} dragging and three full complete/restart cycles without navigation.`);
    await context.close();
  }
  // Corrupted storage and disabled browser APIs must degrade safely in the real UI.
  const ctx=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});const page=await ctx.newPage();
  await page.addInitScript(()=>{Object.defineProperty(window,'AudioContext',{value:undefined});Object.defineProperty(window,'webkitAudioContext',{value:undefined});});
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#begin').waitFor();await page.evaluate(()=>localStorage.setItem('treasureHunt.case02.v1','{corrupt'));await page.reload();await page.locator('#begin').waitFor();await page.locator('#begin').click();await page.locator('.cafe-scene').waitFor();
  await page.locator('#sound-toggle').click();assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'false');await page.reload();assert.match(await page.locator('#sound-label').innerText(),/OFF/);
  await page.locator('#organizer').click();await page.locator('#restart-mission').click();await page.locator('#confirm-restart').click();await page.locator('#begin').waitFor();assert.equal(await page.locator('.aisc-logo').count(),1);
  assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'false');
  // Restart every stage, including during the pending puzzle completion timer.
  for(const stage of ['cafe','lock','blueprint','deduction']){
    await page.evaluate(async stage=>{
      const {createGame}=await import('./js/game-state.js');const {pieceOrder}=await import('./js/config.js');
      const g=createGame(localStorage);g.reset();g.start();
      if(stage!=='cafe'){for(const id of ['receipt','cup','napkin','coaster'])g.collect(id);g.openLock();}
      if(['blueprint','deduction'].includes(stage)){g.unlock('6813');g.openEnvelope();}
      if(stage==='deduction'){pieceOrder.forEach((id,i)=>g.placePiece(id,i));g.openDeduction();}
    },stage);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('#main')?.getAttribute('aria-busy')==='false');
    if(stage==='blueprint'){
      for(let i=0;i<6;i++)await dragPiece(page,pieceIds[i],`[data-slot="${i}"]`);
      await page.locator('#puzzle-board.restored').waitFor();
    }
    await page.locator('#organizer').click();await page.locator('#restart-mission').click();await page.locator('[data-close]').click();
    assert.equal(await page.locator('#begin').count(),0,'Cancel preserves current stage');
    await page.locator('#organizer').click();await page.locator('#restart-mission').click();await page.locator('#confirm-restart').click();
    await page.locator('#begin').waitFor();await page.waitForTimeout(2400);
    assert.equal(await page.locator('#begin').count(),1,'Old stage timers cannot advance a restarted mission');
    assert.equal(await page.locator('dialog[open]').count(),0);
    assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'false');
  }
  await page.locator('#begin').click();await page.locator('.cafe-scene').waitFor();
  // Create a deterministic overlap before the 340ms clue animation ends.
  // Reduced motion has a zero-delay timer, so separate automation clicks
  // would open the evidence dialog before the restart can even be requested.
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{
    document.querySelector('[data-object="receipt"]').click();
    document.querySelector('#organizer').click();
    document.querySelector('#restart-mission').click();
    document.querySelector('#confirm-restart').click();
  });
  await page.locator('#begin').waitFor();await page.waitForTimeout(700);
  assert.equal(await page.locator('dialog[open]').count(),0,'A delayed evidence dialog cannot reopen after restart');
  summary.checks.push('Corrupt save, unavailable audio, saved mute, settings restart at every stage, cancel, pending puzzle and evidence animation cancellation');await ctx.close();
  summary.result='PASS';
}catch(error){summary.result='FAIL';summary.errors.push(error.stack);console.error(error);process.exitCode=1;}
finally{await writeFile(path.join(output,'report.json'),JSON.stringify(summary,null,2));await browser.close();console.log(`Browser report: ${path.join(output,'report.json')}`);}
