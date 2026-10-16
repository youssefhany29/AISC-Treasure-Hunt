import { CONFIG } from '../config.js';
export function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export const arrow = '<span aria-hidden="true">↗</span>';
export const logo = () => `<div class="club-brand"><img class="aisc-logo" src="${CONFIG.assets.logo}" width="640" height="640" alt="AISC — International Students Club"><span>INTERNATIONAL STUDENTS CLUB<small>A SHARED ADVENTURE. A NEW CONNECTION.</small></span></div>`;
export function stageHeading(number, title, description, ctx) {
  return `<div class="stage-heading"><div><p class="eyebrow"><span class="tiny-rule"></span> INVESTIGATION ${number} <span class="muted">/ CASE ${CONFIG.CASE_NUMBER}</span></p><h1 id="stage-title">${escapeHTML(title)}</h1><p class="stage-description">${escapeHTML(description)}</p></div><div class="stage-actions">${ctx.state.evidence.length ? '<button type="button" class="utility-button" data-action="inventory"><span aria-hidden="true">▤</span> EVIDENCE <span class="button-count">'+ctx.state.evidence.length+'</span></button>' : ''}${CONFIG.ENABLE_HINTS ? '<button type="button" class="utility-button" data-action="hint"><span aria-hidden="true">?</span> HINT</button>' : ''}</div></div>`;
}
export function bindStageActions(root, ctx) {
  root.querySelector('[data-action="inventory"]')?.addEventListener('click', ctx.inventory);
  root.querySelector('[data-action="hint"]')?.addEventListener('click', ctx.hint);
}
