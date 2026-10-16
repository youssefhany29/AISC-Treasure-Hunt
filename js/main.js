import { CONFIG } from './config.js';
import { createGame } from './game-state.js';
import { AudioManager } from './audio-manager.js';
import { preloadImages } from './asset-loader.js';
import { showInventory } from './components/evidence-inventory.js';
import { showHint } from './components/hints.js';
import { showModal, closeModal } from './components/modal.js';
import { reducedMotion } from './components/transitions.js';
import { renderIntro } from './stages/intro.js';
import { renderCafe } from './stages/cafe.js';
import { renderLock } from './stages/lock.js';
import { renderBlueprint } from './stages/blueprint.js';
import { renderDeduction } from './stages/deduction.js';
import { renderCompletion } from './stages/completion.js';

let storage; try { storage=window.localStorage; } catch { storage=null; }
const game=createGame(storage);
document.title=`CASE ${CONFIG.CASE_NUMBER} — ${CONFIG.GAME_TITLE}`;
document.querySelector('.case-wordmark>span:last-child').firstChild.textContent=CONFIG.GAME_TITLE;
const audio=new AudioManager(game.get().sound);
const main=document.querySelector('#main');
let cleanup; let renderId=0; let toastTimer;
const stageRenderers={intro:renderIntro,cafe:renderCafe,lock:renderLock,blueprint:renderBlueprint,deduction:renderDeduction,complete:renderCompletion};
if (!CONFIG.ENABLE_ANIMATIONS) document.documentElement.classList.add('no-motion');
const ctx={game,audio,get state(){return game.get();},render,updateChrome,reducedMotion,
  inventory:()=>showInventory(ctx),hint:()=>showHint(ctx),toast};

function updateChrome() {
  const state=game.get();
  const toggle=document.querySelector('#sound-toggle'); toggle.hidden=!CONFIG.ENABLE_SOUND;
  toggle.setAttribute('aria-pressed',String(state.sound)); document.querySelector('#sound-label').textContent=state.sound?'SOUND ON':'SOUND OFF'; toggle.classList.toggle('muted-sound',!state.sound);
  const progress=document.querySelector('#progress'); progress.hidden=!CONFIG.SHOW_PROGRESS||state.stage==='intro'||state.complete;
  const stages=['cafe','lock','blueprint','deduction']; const labels=['CAFE EVIDENCE','SECURITY CODE','BLUEPRINT','FINAL DEDUCTION'];
  const active=stages.indexOf(state.stage);
  progress.innerHTML=stages.map((id,i)=>`<div class="progress-step ${i===active?'current':i<active?'done':''}" ${i===active?'aria-current="step"':''}><span class="step-dot">${i<active?'✓':String(i+1).padStart(2,'0')}</span><span class="step-label">${labels[i]}</span></div>`).join('');
  const footerStatus=document.querySelector('.footer-status');
  footerStatus.innerHTML=`<i aria-hidden="true"></i> ${game.persistenceAvailable?'YOUR PROGRESS IS SAVED':'PROGRESS KEPT FOR THIS VISIT'}`;
}
function stageAssets(stage) {
  if(stage==='intro')return [CONFIG.assets.dossier,CONFIG.assets.logo];
  if(stage==='cafe')return [CONFIG.assets.desk,...CONFIG.evidence.map(e=>e.image)];
  if(stage==='blueprint')return [CONFIG.assets.blueprint];
  if(stage==='deduction')return [CONFIG.assets.blueprint,...CONFIG.doors.map(d=>d.image)];
  if(stage==='complete')return [CONFIG.assets.hall,CONFIG.assets.logo];
  return [];
}
async function render() {
  const id=++renderId; cleanup?.(); cleanup=null; closeModal();
  updateChrome(); const stage=game.get().stage;
  main.setAttribute('aria-busy','true');
  const loaded=await preloadImages(stageAssets(stage));
  if(id!==renderId)return;
  cleanup=stageRenderers[stage](main,ctx);
  main.setAttribute('aria-busy','false');
  main.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'});
  if(loaded.some(x=>!x.ok)) toast('An illustration could not load. The investigation can still continue.');
  const next={intro:'cafe',cafe:'blueprint',lock:'blueprint',blueprint:'deduction',deduction:'complete'}[stage];
  if(next) preloadImages(stageAssets(next));
}
function toast(message) { const el=document.querySelector('#toast'); el.textContent=message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('visible'),4500); }
document.querySelector('#sound-toggle').addEventListener('click',()=> { const enabled=!game.get().sound; game.setSound(enabled); audio.setEnabled(enabled); if(enabled)audio.play('tap'); updateChrome(); });
document.addEventListener('pointerdown',()=>audio.activate(),{once:true});
document.addEventListener('keydown',()=>audio.activate(),{once:true});
document.querySelector('#case-home').addEventListener('click',e=>{
  e.preventDefault();
  if(game.get().stage==='intro')return;
  showModal(`<p class="eyebrow">CLASSIFIED // CASE ${CONFIG.CASE_NUMBER}</p><h2 id="modal-title">The mission briefing</h2><p>Your contact has disappeared. Recover four clues from the cafe, open the locked case, and reconstruct the erased destination.</p><p>Your progress stays saved as you investigate.</p><button class="primary-button full" type="button" data-close>RETURN TO YOUR INVESTIGATION ↗</button>`);
});
document.querySelector('#organizer').addEventListener('click',()=>{
  showModal(`<p class="eyebrow">FIELD OPERATIONS / CASE SETTINGS</p><h2 id="modal-title">Your investigation</h2><p>Your progress is ${game.persistenceAvailable?'saved on this browser':'available for this visit. Browser storage is unavailable'}. No personal information is collected.</p>${game.get().complete?'<button class="secondary-button full" id="reopen-result" type="button">SHOW MISSION RESULT ↗</button>':''}${CONFIG.ALLOW_RESTART?'<details class="reset-details"><summary>Organizer: reset this mission</summary><p>This clears all clues and puzzle progress on this browser. Sound preferences are kept.</p><button id="confirm-reset" class="danger-button" type="button">CLEAR PROGRESS AND RESTART</button></details>':''}<button class="secondary-button full" type="button" data-close>BACK TO THE CASE</button>`,root=>{
    root.querySelector('#confirm-reset')?.addEventListener('click',()=>{game.reset();render();});
    root.querySelector('#reopen-result')?.addEventListener('click',()=>render());
  });
});
render();
// All static resources are cached after the first successful visit. The worker
// is relative to this directory, so repository subpaths work on GitHub Pages.
if ('serviceWorker' in navigator && (location.protocol==='https:' || ['localhost','127.0.0.1'].includes(location.hostname))) {
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
