import { CONFIG } from '../config.js';
import { stageHeading, bindStageActions, arrow } from '../components/ui.js';
import { animationDelay, replayAnimation } from '../components/transitions.js';
import { isModalOpen } from '../components/modal.js';
export function renderLock(root, ctx) {
  let code = ''; let busy = false;
  root.innerHTML = `<section class="stage-enter">${stageHeading('02', CONFIG.text.lockTitle, CONFIG.text.lockObjective, ctx)}<div class="lock-layout"><aside class="case-notes lock-notes"><p class="eyebrow">EXHIBIT 02-B</p><h2>A case with<br>something to hide.</h2><p>Four symbols are etched above the security panel. Your evidence file holds their meaning.</p><div class="note-paper"><span class="paper-pin" aria-hidden="true"></span><p>“The order matters.<br>The numbers are<br>already with you.”</p><small>— THE INFORMANT</small></div><div class="quiet-note">No attempt limit.<br>Take your time. Follow the evidence.</div></aside><div class="security-case" id="security-case"><div class="case-handle" aria-hidden="true"></div><div class="case-hardware"><span>FIELD SECURITY / MK.02</span><span class="status-led"><i aria-hidden="true"></i> <b id="case-status">SEALED</b></span></div><div class="case-lid"><div class="case-bolt bolt-tl" aria-hidden="true"></div><div class="case-bolt bolt-tr" aria-hidden="true"></div><div class="case-bolt bolt-bl" aria-hidden="true"></div><div class="case-bolt bolt-br" aria-hidden="true"></div><div class="security-panel"><p class="device-label">ENTER ACCESS SEQUENCE</p><div class="code-display" role="group" aria-label="Four digit security code">${CONFIG.lockOrder.map((id,i)=>`<div class="code-column"><span class="code-symbol">${CONFIG.evidence.find(e=>e.id===id).symbol}</span><span class="digit-slot" id="digit-${i}" aria-label="Digit ${i+1}, empty">—</span></div>`).join('')}</div><p id="lock-feedback" class="lock-feedback" role="status" aria-live="polite">AWAITING INPUT</p><div class="keypad">${['1','2','3','4','5','6','7','8','9','C','0','DEL'].map(key=>`<button type="button" data-key="${key}" class="key ${key==='C'||key==='DEL'?'key-function':''}" aria-label="${key==='C'?'Clear code':key==='DEL'?'Delete last digit':key}">${key==='DEL'?'⌫':key}</button>`).join('')}</div><button id="unlock" class="primary-button full unlock-button" type="button">UNLOCK CASE <span aria-hidden="true">◇</span></button></div><div class="case-serial" aria-hidden="true">SECURED EVIDENCE // 002-0719<br><span>▌▏▎▌▍▏▌▎▍▌▏▎▌▍▌▏</span></div></div><div class="case-latch left" aria-hidden="true"></div><div class="case-latch right" aria-hidden="true"></div></div></div></section>`;
  bindStageActions(root, ctx);
  function draw() { for (let i=0;i<4;i++) { const slot = root.querySelector(`#digit-${i}`); slot.textContent = code[i] || '—'; slot.classList.toggle('filled', !!code[i]); slot.classList.toggle('active', i===code.length); slot.setAttribute('aria-label', `Digit ${i+1}, ${code[i] || 'empty'}`); } }
  function press(key) {
    if (busy) return;
    ctx.audio.play('keypad');
    if (key === 'C') code = '';
    else if (key === 'DEL') code = code.slice(0,-1);
    else if (/^\d$/.test(key) && code.length < 4) code += key;
    root.querySelector('#lock-feedback').textContent = code.length===4 ? 'SEQUENCE READY' : 'AWAITING INPUT';
    root.querySelector('#lock-feedback').className = 'lock-feedback'; draw();
  }
  root.querySelectorAll('[data-key]').forEach(b=>b.addEventListener('click',()=>press(b.dataset.key)));
  async function unlock() {
    if (busy) return;
    const feedback = root.querySelector('#lock-feedback');
    if (code.length !== 4) { feedback.textContent = 'ENTER ALL FOUR DIGITS'; ctx.audio.play('error'); return; }
    if (!ctx.game.unlock(code)) { feedback.textContent = 'ACCESS DENIED · TRY AGAIN'; feedback.className = 'lock-feedback denied'; ctx.audio.play('error'); replayAnimation(root.querySelector('.security-panel'),'shake'); code=''; draw(); return; }
    busy=true; feedback.textContent='ACCESS GRANTED'; feedback.className='lock-feedback granted';
    root.querySelector('#case-status').textContent='UNSEALED'; root.querySelector('#security-case').classList.add('unlocked');
    root.querySelectorAll('button[data-key],#unlock').forEach(b=>b.disabled=true);
    ctx.updateChrome(); ctx.audio.play('correct'); await animationDelay(450); ctx.audio.play('unlock'); await animationDelay(600); ctx.render();
  }
  root.querySelector('#unlock').addEventListener('click', unlock);
  const keyboard = e => { if (isModalOpen() || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('button,a,input')) return; if (/^\d$/.test(e.key)) { e.preventDefault(); press(e.key); } else if (e.key==='Backspace'||e.key==='Delete') { e.preventDefault(); press('DEL'); } else if(e.key==='Escape') press('C'); else if(e.key==='Enter') { e.preventDefault(); unlock(); } };
  document.addEventListener('keydown',keyboard);
  draw(); return () => document.removeEventListener('keydown', keyboard);
}
