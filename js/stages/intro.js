import { CONFIG } from '../config.js';
import { logo, escapeHTML, arrow } from '../components/ui.js';
import { animationDelay } from '../components/transitions.js';
export function renderIntro(root, ctx, briefing = false) {
  const state = ctx.game.get();
  const resumed = state.stage !== 'intro';
  const titleWords = CONFIG.GAME_TITLE.split(' ');
  const titleLast = titleWords.pop();
  root.innerHTML = `<section class="intro stage-enter" aria-labelledby="intro-title"><div class="intro-copy"><p class="eyebrow"><span class="classified-dot" aria-hidden="true"></span> CLASSIFIED <span class="muted">// CASE ${CONFIG.CASE_NUMBER}</span></p><p class="intro-pretitle">An informant vanished.<br>A trail remains.</p><h1 id="intro-title">${escapeHTML(titleWords.join(' '))}<br><em>${escapeHTML(titleLast)}.</em></h1><div class="intro-story"><p class="lead">${escapeHTML(CONFIG.text.introLines[0])}</p><p>${escapeHTML(CONFIG.text.introLines[1])} ${escapeHTML(CONFIG.text.introLines[2])}</p><p class="intro-last">${escapeHTML(CONFIG.text.introLines[3])}</p></div><button class="primary-button intro-start" id="begin" type="button">${resumed ? state.complete ? 'SHOW MISSION RESULT' : 'RESUME INVESTIGATION' : 'BEGIN INVESTIGATION'} ${arrow}</button><div class="mission-meta"><span><i aria-hidden="true"></i> 3–5 MINUTES</span><span>03 CHALLENGES</span><span>ONE MISSING PLACE</span></div>${logo()}</div><div class="intro-art"><div class="art-caption"><span>RECOVERED / 21:08</span><span>EXHIBIT 02-A</span></div><img class="dossier-art" src="${CONFIG.assets.dossier}" alt="An open confidential dossier, a mysterious cafe photograph, handwritten notes and a coffee cup on a detective’s desk."><div class="scan-window" aria-hidden="true"><div class="fingerprint"></div><span>IDENTITY CONFIRMED</span></div><div class="art-bottom"><span class="coordinate">FIELD COPY — EYES ONLY</span><span class="case-seal" aria-hidden="true">${CONFIG.CASE_NUMBER}</span></div></div></section>`;
  root.querySelector('#begin').addEventListener('click', async e => {
    if (e.currentTarget.disabled) return;
    e.currentTarget.disabled = true; ctx.audio.play('folder');
    root.querySelector('.intro')?.classList.add('file-opening');
    ctx.game.start(); await animationDelay(380); ctx.render();
  });
}
