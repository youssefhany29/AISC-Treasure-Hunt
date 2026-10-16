import { CONFIG, correctCode, storageKey } from './config.js';

export function unsolvedOrder(random = Math.random) {
  const order = [...CONFIG.fragmentOrder];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (isBlueprintSolved(order)) [order[0], order[1]] = [order[1], order[0]];
  return order;
}
export const isBlueprintSolved = order => Array.isArray(order) && order.length === CONFIG.fragmentOrder.length && order.every((id, i) => id === CONFIG.fragmentOrder[i]);
export function initialState(random) {
  return { version: CONFIG.STORAGE_VERSION, stage: 'intro', evidence: [], lockSolved: false,
    envelopeOpened: false, fragments: unsolvedOrder(random), blueprintSolved: false,
    complete: false, sound: CONFIG.ENABLE_SOUND, hints: [] };
}
export function sanitizeState(raw, random) {
  const fallback = initialState(random);
  if (!raw || typeof raw !== 'object' || raw.version !== CONFIG.STORAGE_VERSION) return fallback;
  const evidence = [...new Set(Array.isArray(raw.evidence) ? raw.evidence.filter(id => CONFIG.evidence.some(e => e.id === id)) : [])];
  const fragments = Array.isArray(raw.fragments) && raw.fragments.length === 3 && new Set(raw.fragments).size === 3 && raw.fragments.every(id => CONFIG.fragmentOrder.includes(id)) ? [...raw.fragments] : fallback.fragments;
  const lockSolved = raw.lockSolved === true && evidence.length === 4;
  const envelopeOpened = lockSolved && raw.envelopeOpened === true;
  const blueprintSolved = envelopeOpened && raw.blueprintSolved === true && isBlueprintSolved(fragments);
  const complete = blueprintSolved && raw.complete === true;
  let stage = ['intro','cafe','lock','blueprint','deduction','complete'].includes(raw.stage) ? raw.stage : 'intro';
  if (complete) stage = 'complete';
  else if (stage === 'complete') stage = blueprintSolved ? 'deduction' : lockSolved ? 'blueprint' : evidence.length === 4 ? 'lock' : 'cafe';
  if (stage === 'deduction' && !blueprintSolved) stage = 'blueprint';
  if (stage === 'blueprint' && !lockSolved) stage = evidence.length === 4 ? 'lock' : 'cafe';
  if (stage === 'lock' && evidence.length !== 4) stage = 'cafe';
  // A refresh between the last swap and its animation must never leave a solved board stuck.
  const recoveredBlueprint = envelopeOpened && isBlueprintSolved(fragments);
  return { ...fallback, stage, evidence, fragments, lockSolved, envelopeOpened,
    blueprintSolved: blueprintSolved || recoveredBlueprint, complete,
    sound: typeof raw.sound === 'boolean' ? raw.sound : fallback.sound,
    hints: Array.isArray(raw.hints) ? [...new Set(raw.hints.filter(x => typeof x === 'string' && x in CONFIG.text.hints))] : [] };
}
export function createGame(storage, random = Math.random) {
  let state;
  let persistenceAvailable = !!storage;
  try { state = sanitizeState(JSON.parse(storage?.getItem(storageKey) || 'null'), random); }
  catch { state = initialState(random); }
  const save = () => { try { storage?.setItem(storageKey, JSON.stringify(state)); } catch { persistenceAvailable = false; } };
  const get = () => structuredClone(state);
  const commit = fn => { fn(state); save(); return get(); };
  return {
    get, get persistenceAvailable() { return persistenceAvailable; },
    start() { return commit(s => { if (s.stage === 'intro') s.stage = 'cafe'; }); },
    collect(id) { if (state.stage !== 'cafe' || !CONFIG.evidence.some(e => e.id === id)) return false; commit(s => { if (!s.evidence.includes(id)) s.evidence.push(id); }); return true; },
    openLock() { if (state.evidence.length !== 4 || !['cafe','lock'].includes(state.stage)) return false; commit(s => { s.stage = 'lock'; }); return true; },
    unlock(code) { if (state.stage !== 'lock' || state.evidence.length !== 4 || code !== correctCode()) return false; commit(s => { s.lockSolved = true; s.stage = 'blueprint'; }); return true; },
    openEnvelope() { if (state.stage !== 'blueprint' || !state.lockSolved) return false; commit(s => { s.envelopeOpened = true; }); return true; },
    swap(a,b) { if (state.stage !== 'blueprint' || !state.envelopeOpened || state.blueprintSolved || !Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a > 2 || b > 2) return false; commit(s => { [s.fragments[a], s.fragments[b]] = [s.fragments[b], s.fragments[a]]; s.blueprintSolved = isBlueprintSolved(s.fragments); }); return true; },
    openDeduction() { if (!state.blueprintSolved || !state.lockSolved) return false; commit(s => { s.stage = 'deduction'; }); return true; },
    chooseDoor(id) { if (state.stage !== 'deduction' || !state.blueprintSolved || id !== CONFIG.correctDoor) return false; commit(s => { s.complete = true; s.stage = 'complete'; }); return true; },
    setSound(enabled) { return commit(s => { s.sound = !!enabled; }); },
    useHint(stage) { if (!(stage in CONFIG.text.hints)) return; return commit(s => { if (!s.hints.includes(stage)) s.hints.push(stage); }); },
    reset() { const sound = state.sound; state = initialState(random); state.sound = sound; save(); return get(); }
  };
}
export function visibleDestination(state) { return state.complete && state.stage === 'complete' ? CONFIG.DESTINATION_NAME : ''; }
