import { CONFIG } from '../config.js';
import { showModal, closeModal } from './modal.js';
import { escapeHTML } from './ui.js';
export function showEvidence(id, ctx, afterClose) {
  const clue = CONFIG.evidence.find(e => e.id === id);
  if (!clue || !ctx.game.get().evidence.includes(id)) return;
  const dialog = document.querySelector('#modal');
  if (afterClose) dialog.addEventListener('close', afterClose, { once: true });
  showModal(`<p class="eyebrow">RECOVERED EVIDENCE <span class="muted">/ ${String(CONFIG.evidence.indexOf(clue)+1).padStart(2,'0')}</span></p><h2 id="modal-title">${escapeHTML(clue.name)}</h2><div class="evidence-reveal ${id}"><img src="${clue.image}" alt=""><div class="cipher-mark"><span>${clue.symbol}</span><span>=</span><strong>${clue.value}</strong></div></div><p>${escapeHTML(clue.note)}</p><p class="saved-note"><span aria-hidden="true">✓</span> Added to your evidence file</p><button class="primary-button full" type="button" data-close>RETURN TO THE INVESTIGATION <span aria-hidden="true">↗</span></button>`);
}
export function showInventory(ctx) {
  const state = ctx.game.get();
  showModal(`<p class="eyebrow">CASE ${CONFIG.CASE_NUMBER} / COLLECTED INTELLIGENCE</p><h2 id="modal-title">Your evidence file</h2><p>Every symbol is a piece of the cipher. Tap an item to inspect it again.</p><div class="inventory-grid">${CONFIG.evidence.map((e,i) => state.evidence.includes(e.id) ? `<button class="inventory-item" data-evidence="${e.id}" type="button"><img src="${e.image}" alt=""><strong>${e.symbol} = ${e.value}</strong><span>${escapeHTML(e.name)}</span></button>` : `<div class="inventory-item missing"><span class="unknown">?</span><span>Evidence ${String(i+1).padStart(2,'0')}<br>Not yet recovered</span></div>`).join('')}</div><button class="secondary-button full" type="button" data-close>CLOSE EVIDENCE FILE</button>`, root => {
    root.querySelectorAll('[data-evidence]').forEach(b => b.addEventListener('click', () => { closeModal(); ctx.audio.play('paper'); showEvidence(b.dataset.evidence, ctx); }));
  });
}
