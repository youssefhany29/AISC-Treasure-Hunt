// Visual/contrast QA only. No audit library is shipped to game participants.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
let pw;
try { pw=require('playwright'); } catch {
  pw=require(process.env.PLAYWRIGHT_MODULE_PATH||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
}
let axePath=process.env.AXE_PATH||path.resolve('test-results/axe.min.js');
if(!existsSync(axePath)){
  try { axePath=require.resolve('axe-core/axe.min.js'); }
  catch { throw Error('Install axe-core for QA or set AXE_PATH to its axe.min.js. The game has no runtime dependencies.'); }
}
const base=process.env.BASE_URL||'http://127.0.0.1:4174/case02/';
const widths=(process.env.AUDIT_WIDTHS||'320,375,390,430,768,1024,1440').split(',').map(Number);
const output=path.resolve('test-results',process.env.AUDIT_LABEL||'olive-theme-audit');
await mkdir(output,{recursive:true});
const browser=await pw.chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={base,engine:'Chromium',checker:'axe-core color-contrast',views:[],errors:[],result:'FAIL'};
try {
  for(const width of widths){
    const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<600,isMobile:width<600,reducedMotion:'reduce'});
    const page=await context.newPage();
    page.on('pageerror',error=>report.errors.push(error.message));
    await page.goto(base,{waitUntil:'networkidle'});
    if(!report.paletteContrast){
      report.paletteContrast=await page.evaluate(()=>{
        const probe=document.createElement('span');document.body.append(probe);
        const color=name=>{probe.style.color=`var(--color-${name})`;return getComputedStyle(probe).color.match(/[\d.]+/g).map(Number);};
        const luminance=c=>c.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);
        const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
        const pairs=[['ink','background'],['ink','secondary'],['ink','surface'],['on-olive','olive'],['on-olive','hover'],['on-olive','heading'],['heading','border']];
        const results=pairs.map(([fg,bg])=>({foreground:fg,background:bg,ratio:ratio(color(fg),color(bg)),minimum:4.5}));
        const wash=color('paper-wash'),worstPaper=wash.slice(0,3).map(v=>v*wash[3]);
        // Even an entirely black source texture beneath the 94% cream wash
        // must retain AA contrast. This bounds every possible texture pixel.
        results.push({foreground:'ink',background:'worst-case textured surface',ratio:ratio(color('ink'),worstPaper),minimum:4.5});
        results.push({foreground:'control-border',background:'secondary',ratio:ratio(color('control-border'),color('secondary')),minimum:3});
        results.push({foreground:'focus',background:'background',ratio:ratio(color('focus'),color('background')),minimum:3});
        probe.remove();return results;
      });
      assert.ok(report.paletteContrast.every(pair=>pair.ratio>=pair.minimum),'All text, texture bounds, gradient stops, control borders and focus pairs pass contrast thresholds');
    }
    async function audit(name){
      await page.waitForFunction(()=>document.querySelector('#main')?.getAttribute('aria-busy')==='false');
      await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
      if(!await page.evaluate(()=>!!window.axe))await page.addScriptTag({path:axePath});
      // Also check computed foreground/background pairs, including single-digit
      // keys and symbols that axe deliberately leaves for human inspection.
      const computed=await page.evaluate(()=>{
        const rgba=s=>{const n=s.match(/[\d.]+/g)?.map(Number);return n?.length>=3?[...n.slice(0,3),n[3]??1]:[0,0,0,0];};
        const over=(a,b)=>[0,1,2].map(i=>a[i]*a[3]+b[i]*(1-a[3])).concat(1);
        const luminance=c=>c.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);
        const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
        const root=document.querySelector('dialog[open]')||document.body;
        const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
        let node,checked=0,minimum=Infinity;const failures=[];
        while(node=walker.nextNode()){
          const el=node.parentElement,text=node.textContent.trim();
          if(!text||!el||el.closest('script,style,[aria-hidden="true"],[hidden],:disabled'))continue;
          const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
          if(!rect.width||!rect.height||rect.bottom<0||style.visibility!=='visible')continue;
          const chain=[];let opacity=1;
          for(let p=el;p;p=p.parentElement){chain.unshift(p);opacity*=Number(getComputedStyle(p).opacity);}
          if(opacity<.01)continue;
          let bg=[250,240,230,1];
          for(const p of chain){const s=getComputedStyle(p);bg=over(rgba(s.backgroundColor),bg);}
          let foreground=over(rgba(style.color),bg);
          foreground=over([...foreground.slice(0,3),opacity],bg);
          const value=ratio(foreground,bg),large=parseFloat(style.fontSize)>=24||(parseFloat(style.fontSize)>=18.667&&Number(style.fontWeight)>=700);
          checked++;minimum=Math.min(minimum,value);
          if(value<(large?3:4.5))failures.push({text:text.slice(0,70),class:el.className,foreground,bg,value});
        }
        return {checked,minimumRatio:minimum,failures};
      });
      assert.deepEqual(computed.failures,[],`${width}/${name}: computed text contrast`);
      const result=await page.evaluate(async()=>{
        const root=document.querySelector('dialog[open]')||document.body;
        return window.axe.run(root,{runOnly:{type:'rule',values:['color-contrast']}});
      });
      const failures=result.violations.flatMap(v=>v.nodes.map(n=>({target:n.target,reason:n.failureSummary})));
      assert.deepEqual(failures,[],`${width}/${name}: text contrast`);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}/${name}: no overflow`);
      report.views.push({width,name,contrast:'PASS',computedText:computed,checkedNodes:result.passes.flatMap(p=>p.nodes).length,
        manualReview:result.incomplete.flatMap(v=>v.nodes.map(n=>({target:n.target,reason:n.failureSummary})))});
      await page.screenshot({path:path.join(output,`${width}-${name}.png`),fullPage:true});
    }
    async function stage(name){
      await page.evaluate(async name=>{
        const {createGame}=await import('./js/game-state.js');
        const {pieceOrder}=await import('./js/config.js');
        const g=createGame(localStorage);g.reset();
        if(name!=='intro')g.start();
        if(['lock','envelope','photo','deduction','complete'].includes(name)){
          for(const id of ['receipt','cup','napkin','coaster'])g.collect(id);
          g.openLock();
        }
        if(['envelope','photo','deduction','complete'].includes(name))g.unlock('6813');
        if(['photo','deduction','complete'].includes(name))g.openEnvelope();
        if(['deduction','complete'].includes(name)){
          pieceOrder.forEach((id,i)=>g.placePiece(id,i));g.openDeduction();
        }
        if(name==='complete')g.chooseDoor('D');
      },name);
      await page.reload({waitUntil:'networkidle'});await audit(name);
    }
    await audit('intro');
    assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'),'#FAF0E6');
    assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(250, 240, 230)');
    await page.locator('#begin').focus();
    const focus=await page.locator('#begin').evaluate(el=>({style:getComputedStyle(el).outlineStyle,width:parseFloat(getComputedStyle(el).outlineWidth)}));
    assert.equal(focus.style,'solid');assert.ok(focus.width>=2);
    await audit('intro-focus');
    for(const name of ['cafe','lock','envelope','photo','deduction','complete']){
      await stage(name);
      if(name==='cafe'){
        await page.locator('[data-object="receipt"]').hover();await audit('cafe-hover');
        await page.locator('[data-object="receipt"]').click();await page.locator('dialog[open]').waitFor();await audit('evidence');
        await page.locator('[data-close]').click();
        await page.reload({waitUntil:'networkidle'});
        await page.locator('[data-action="inventory"]').click();await audit('inventory-partial');await page.locator('[data-close]').click();
      }
      if(['cafe','lock','photo','deduction'].includes(name)){
        await page.locator('[data-action="hint"]').click();await audit(`${name}-hint`);await page.locator('[data-close]').click();
      }
      if(name==='lock'){
        await page.locator('.key').first().hover();await audit('key-hover');
        for(const key of ['1','2','3','4'])await page.locator(`[data-key="${key}"]`).click();
        await page.locator('#unlock').click();await audit('wrong-code');
        await page.locator('[data-action="inventory"]').click();await audit('inventory-full');await page.locator('[data-close]').click();
      }
      if(name==='photo'){
        // Hold a real mouse pointer over a target while auditing the hover state.
        await page.locator('#photo-puzzle-layout').scrollIntoViewIfNeeded();
        const tile=await page.locator('[data-piece]').first().boundingBox();
        const target=await page.locator('[data-slot="0"]').boundingBox();
        await page.mouse.move(tile.x+tile.width/2,tile.y+tile.height/2);await page.mouse.down();
        await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:8});
        await page.locator('.puzzle-drag-ghost').waitFor();await audit('photo-drag-hover');
        await page.keyboard.press('Escape');await page.mouse.up();
      }
    }
    await page.locator('#play-again').click();await audit('restart-confirm');await page.locator('[data-close]').click();
    await page.locator('#organizer').click();await audit('settings');await page.locator('[data-close]').click();
    console.log(`PASS ${width}px: all stage/dialog contrast and theme snapshots.`);
    await context.close();
  }
  assert.deepEqual(report.errors,[]);
  report.result='PASS';
} catch(error){report.errors.push(error.stack);console.error(error);process.exitCode=1;}
finally {await writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));await browser.close();console.log(`Theme audit: ${output}`);}
