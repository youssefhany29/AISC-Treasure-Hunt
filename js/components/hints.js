import { CONFIG } from '../config.js';
import { showModal } from './modal.js';
import { escapeHTML } from './ui.js';
export function showHint(ctx) {
  const stage = ctx.game.get().stage;
  const hint = CONFIG.text.hints[stage];
  if (!CONFIG.ENABLE_HINTS || !hint) return;
  ctx.game.useHint(stage); ctx.audio.play('paper');
  showModal(`<p class="eyebrow">A NOTE FROM YOUR CONTACT</p><h2 id="modal-title">A little direction.</h2><div class="hint-note"><span class="hint-number" aria-hidden="true">?</span><p>${escapeHTML(hint)}</p></div><p class="muted">Good investigators ask questions. There is no penalty for a hint.</p><button class="primary-button full" type="button" data-close>BACK TO THE CASE <span aria-hidden="true">↗</span></button>`);
}
