import { CONFIG } from '../config.js';
import { stageHeading, bindStageActions, escapeHTML } from '../components/ui.js';
import { replayAnimation, animationDelay } from '../components/transitions.js';
export function renderDeduction(root,ctx) {
  let busy=false;
  root.innerHTML=`<section class="stage-enter">${stageHeading('04', CONFIG.text.deductionTitle, 'The blueprint is whole. The final destination is one deduction away.', ctx)}<div class="riddle-layout"><div class="riddle-note"><p class="eyebrow">THE INFORMANT’S LAST MESSAGE</p><blockquote>${CONFIG.text.riddle.map(line=>`<p>${escapeHTML(line)}</p>`).join('')}<strong>What place am I?</strong></blockquote><div class="riddle-signoff"><span class="tiny-rule"></span> CHOOSE YOUR DOOR</div></div><div class="blueprint-preview"><img src="${CONFIG.assets.blueprint}" alt="Your reconstructed blueprint: an entrance, an indoor court, a scoreboard and spectator stands."><span>YOUR RECONSTRUCTED EVIDENCE</span></div></div><div class="doors" role="group" aria-label="Choose the location that matches the riddle">${CONFIG.doors.map(d=>`<button class="door" data-door="${d.id}" type="button" aria-label="Door ${d.id}: ${escapeHTML(d.title)}"><span class="door-arch"><img src="${d.image}" alt="${escapeHTML(d.title)} interior illustration"><span class="door-leaf" aria-hidden="true"></span><span class="door-letter">${d.id}</span></span><span class="door-caption"><small>DOOR ${d.id}</small><strong>${escapeHTML(d.title)}</strong><span aria-hidden="true">↗</span></span></button>`).join('')}</div><div id="door-feedback" class="door-feedback" role="status" aria-live="polite">Follow the evidence. Choose the place that fits every line.</div></section>`;
  bindStageActions(root,ctx);
  root.querySelectorAll('[data-door]').forEach(button=>button.addEventListener('click',async()=>{
    if(busy) return;
    const id=button.dataset.door;
    if (!ctx.game.chooseDoor(id)) { ctx.audio.play('error'); replayAnimation(button,'wrong-door'); root.querySelector('#door-feedback').textContent=CONFIG.doors.find(d=>d.id===id).feedback; return; }
    busy=true; ctx.audio.play('correct'); button.classList.add('door-opening'); root.querySelector('#door-feedback').textContent='DESTINATION CONFIRMED. THE NEXT CHAPTER AWAITS.'; root.querySelectorAll('[data-door]').forEach(b=>b.disabled=true); ctx.updateChrome(); await animationDelay(850); ctx.audio.play('final'); ctx.render();
  }));
}
