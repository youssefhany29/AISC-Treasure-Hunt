import { CONFIG } from '../config.js';
import { stageHeading, bindStageActions, escapeHTML, arrow } from '../components/ui.js';
import { showEvidence } from '../components/evidence-inventory.js';
import { animationDelay, replayAnimation } from '../components/transitions.js';
export function renderCafe(root, ctx) {
  const state = ctx.game.get();
  const all = state.evidence.length === 4;
  root.innerHTML = `<section class="stage-enter" aria-labelledby="stage-title">${stageHeading('01', CONFIG.text.cafeTitle, CONFIG.text.cafeObjective, ctx)}<div class="investigation-layout"><div class="scene-frame"><div class="scene-caption"><span>THE LAST KNOWN LOCATION</span><span>CAFE / TABLE 07</span></div><div class="cafe-scene" role="group" aria-label="Cafe table with four objects to inspect"><img class="desk-bg" src="${CONFIG.assets.desk}" width="1000" height="760" alt="A wooden cafe table lit by a warm lamp, with stationery, scattered coffee beans and a closed case.">${CONFIG.evidence.map((e,i)=>`<button type="button" class="scene-object object-${e.id} ${state.evidence.includes(e.id) ? 'found' : ''}" data-object="${e.id}" aria-label="${escapeHTML(e.action)}${state.evidence.includes(e.id) ? ', evidence collected' : ''}"><span class="object-shadow" aria-hidden="true"></span><img src="${e.image}" alt="" draggable="false"><span class="object-marker" aria-hidden="true">${state.evidence.includes(e.id) ? '✓' : '+'}</span><span class="object-label">${escapeHTML(e.name)}</span></button>`).join('')}<span class="scene-note" aria-hidden="true">HE LEFT IN A HURRY.</span></div><div class="scene-bottom"><span><i class="live-dot" aria-hidden="true"></i> TAP AN OBJECT TO EXAMINE</span><span>4 OBJECTS · 1 CIPHER</span></div></div><aside class="case-notes"><p class="eyebrow">YOUR FIELD NOTES</p><h2>Nothing here<br>is an accident.</h2><p>The informant's last coffee is still on the table. Look closely at what was left behind.</p><div class="evidence-counter"><span>EVIDENCE COLLECTED</span><strong id="evidence-count">${state.evidence.length}<small>/4</small></strong></div><ol class="clue-list">${CONFIG.evidence.map((e,i)=>`<li data-clue="${e.id}" class="${state.evidence.includes(e.id) ? 'collected' : ''}"><span class="clue-number">${String(i+1).padStart(2,'0')}</span><span class="clue-name">${state.evidence.includes(e.id) ? escapeHTML(e.name) : 'Unidentified evidence'}</span><span class="clue-value">${state.evidence.includes(e.id) ? e.symbol+' = '+e.value : '—'}</span></li>`).join('')}</ol><div id="cafe-next" class="stage-next ${all ? 'ready' : ''}">${nextHTML(all)}</div></aside></div></section>`;
  bindStageActions(root, ctx);
  let inspecting = false;
  root.querySelectorAll('[data-object]').forEach(button => button.addEventListener('click', async () => {
    if (inspecting) return; inspecting = true;
    const id = button.dataset.object;
    const clue = CONFIG.evidence.find(e => e.id === id);
    const fresh = !ctx.game.get().evidence.includes(id);
    ctx.game.collect(id); ctx.audio.play(clue.sound); ctx.updateChrome();
    replayAnimation(button, 'examining');
    if (fresh) {
      button.classList.add('found'); button.querySelector('.object-marker').textContent = '✓';
      button.setAttribute('aria-label', `${clue.action}, evidence collected`);
      const current = ctx.game.get(); root.querySelector('#evidence-count').innerHTML = `${current.evidence.length}<small>/4</small>`;
      const li = root.querySelector(`[data-clue="${id}"]`); li.classList.add('collected'); li.querySelector('.clue-name').textContent = clue.name; li.querySelector('.clue-value').textContent = `${clue.symbol} = ${clue.value}`;
      if (current.evidence.length === 4) { root.querySelector('#cafe-next').innerHTML = nextHTML(true); root.querySelector('#cafe-next').classList.add('ready'); bindNext(); }
    }
    await animationDelay(340); inspecting = false;
    if (!ctx.isActive()) return;
    if (fresh) ctx.audio.play('discover');
    showEvidence(id, ctx);
  }));
  function bindNext() { root.querySelector('#open-case')?.addEventListener('click', () => { if (ctx.game.openLock()) { ctx.audio.play('folder'); ctx.render(); } }); }
  bindNext();
}
function nextHTML(all) { return all ? `<p class="success-label"><span aria-hidden="true">✓</span> EVIDENCE RECOVERED</p><p>Four symbols. Four numbers.<br>One locked case.</p><button id="open-case" class="primary-button full" type="button">OPEN THE LOCKED CASE ${arrow}</button>` : '<p class="quiet-note">Recover all four clues to open<br>the informant’s case.</p>'; }
