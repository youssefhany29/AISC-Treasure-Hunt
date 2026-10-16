import { CONFIG } from '../config.js';
import { stageHeading, bindStageActions, arrow } from '../components/ui.js';
import { animationDelay } from '../components/transitions.js';
export function renderBlueprint(root, ctx) {
  const state = ctx.game.get();
  if (!state.envelopeOpened) return renderEnvelope(root, ctx);
  let selected = null;
  root.innerHTML = `<section class="stage-enter">${stageHeading('03', CONFIG.text.blueprintTitle, CONFIG.text.blueprintObjective, ctx)}<div class="blueprint-workspace"><div class="blueprint-toolbar"><span><i class="live-dot" aria-hidden="true"></i> ARCHITECTURAL RECORD / REDACTED</span><span>RECONSTRUCTION: 3 FRAGMENTS</span></div><div class="blueprint-instructions"><span class="instruction-number">01</span><p>Tap a fragment to select it.</p><span class="instruction-number">02</span><p>Tap another to swap their positions.</p></div><div class="blueprint-board ${state.blueprintSolved?'restored':''}" id="blueprint-board" role="group" aria-label="Three blueprint fragments, tap two to swap"></div><div class="blueprint-ruler" aria-hidden="true"><span>0</span><span>5</span><span>10</span><span>15</span><span>20 M</span></div><div class="blueprint-footer"><div><p id="blueprint-status" class="${state.blueprintSolved?'success-label':'eyebrow'}" role="status" aria-live="polite">${state.blueprintSolved?'✓ BLUEPRINT RESTORED':'THE EDGES TELL A STORY'}</p><p id="blueprint-message">${state.blueprintSolved?'An entrance. Court markings. A place built for a crowd.':'Follow the walls and floor markings. Which pieces belong together?'}</p></div><button id="deduce" class="primary-button" type="button" ${state.blueprintSolved?'':'hidden'}>FOLLOW THE BLUEPRINT ${arrow}</button></div></div><p class="stage-footnote"><span aria-hidden="true">◇</span> THE PLACE HAS NO NAME. YET.</p></section>`;
  function draw() {
    const current = ctx.game.get();
    root.querySelector('#blueprint-board').innerHTML = current.fragments.map((id,i) => `<button class="fragment ${selected===i?'selected':''}" type="button" data-position="${i}" data-fragment="${id}" aria-label="${CONFIG.fragments[id].label}, position ${i+1}${selected===i?', selected':''}" aria-pressed="${selected===i}" ${current.blueprintSolved?'disabled':''}><span class="fragment-viewport"><img src="${CONFIG.assets.blueprint}" alt="${id==='entrance'?'Architectural drawing of an entrance and corridor':id==='court'?'Architectural drawing of indoor court markings':'Architectural drawing of a scoreboard and spectator stands'}" style="left:-${CONFIG.fragments[id].offset*100}%" draggable="false"></span><span class="fragment-label">${CONFIG.fragments[id].label}<span>${current.blueprintSolved?'✓':selected===i?'SELECTED':'↔'}</span></span></button>`).join('');
    root.querySelectorAll('[data-position]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.position))));
  }
  async function select(position) {
    if (ctx.game.get().blueprintSolved) return;
    ctx.audio.play('select');
    if (selected === null) selected=position;
    else if (selected===position) selected=null;
    else { const first=selected; selected=null; ctx.game.swap(first,position); ctx.audio.play('paper'); }
    draw();
    if (ctx.game.get().blueprintSolved) {
      root.querySelector('#blueprint-board').classList.add('restored');
      root.querySelector('#blueprint-status').textContent='✓ BLUEPRINT RESTORED'; root.querySelector('#blueprint-status').className='success-label';
      root.querySelector('#blueprint-message').textContent='An entrance. Court markings. A place built for a crowd.';
      ctx.audio.play('blueprint'); await animationDelay(400); root.querySelector('#deduce').hidden=false; ctx.updateChrome();
    } else if (selected!==null) {
      root.querySelector('#blueprint-message').textContent='Fragment selected. Tap another fragment to swap.';
      root.querySelector(`[data-position="${position}"]`).focus({preventScroll:true});
    } else root.querySelector('#blueprint-message').textContent='Follow the walls and floor markings. Which pieces belong together?';
  }
  draw(); bindStageActions(root,ctx);
  root.querySelector('#deduce').addEventListener('click',()=>{ if(ctx.game.openDeduction()) { ctx.audio.play('tap'); ctx.render(); } });
}
function renderEnvelope(root,ctx) {
  root.innerHTML=`<section class="stage-enter">${stageHeading('03', CONFIG.text.blueprintTitle, 'The case is open. One sealed envelope remains inside.', ctx)}<div class="envelope-scene"><p class="eyebrow">ACCESS GRANTED / EVIDENCE UNSEALED</p><button class="envelope" id="envelope" type="button" aria-label="Open the sealed investigation envelope"><span class="envelope-flap" aria-hidden="true"></span><span class="envelope-stamp">CONFIDENTIAL</span><span class="envelope-address">FOR THE INVESTIGATOR<br><small>RECONSTRUCT WHAT WAS LOST.</small></span><span class="wax-seal" aria-hidden="true">02</span><span class="envelope-tap">OPEN THE ENVELOPE <span aria-hidden="true">↗</span></span></button><p class="envelope-note">“If you're reading this, you followed the evidence.<br>The destination was erased. Its outline wasn't.”</p></div></section>`;
  bindStageActions(root,ctx);
  root.querySelector('#envelope').addEventListener('click',async e=> { e.currentTarget.disabled=true; e.currentTarget.classList.add('opening'); ctx.game.openEnvelope(); ctx.audio.play('folder'); await animationDelay(550); ctx.render(); });
}
