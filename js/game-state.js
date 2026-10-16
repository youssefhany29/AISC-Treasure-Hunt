import { CONFIG, correctCode, storageKey, pieceOrder } from './config.js';
import { initialPuzzle, sanitizePuzzle, shuffledPieces, isPhotoPuzzleSolved, movePiece } from './photo-puzzle-state.js';

export const unsolvedOrder = shuffledPieces;
export const isBlueprintSolved = isPhotoPuzzleSolved;
export function initialState(random) {
  return { version: CONFIG.STORAGE_VERSION, stage: 'intro', evidence: [], lockSolved: false,
    envelopeOpened: false, puzzle: initialPuzzle(random), blueprintSolved: false,
    complete: false, sound: CONFIG.ENABLE_SOUND, hints: [] };
}
export function sanitizeState(raw, random) {
  const fallback = initialState(random);
  if (!raw || typeof raw !== 'object' || raw.version !== CONFIG.STORAGE_VERSION) return fallback;
  const evidence = [...new Set(Array.isArray(raw.evidence) ? raw.evidence.filter(id => CONFIG.evidence.some(e => e.id === id)) : [])];
  const lockSolved = raw.lockSolved === true && evidence.length === 4;
  const envelopeOpened = lockSolved && raw.envelopeOpened === true;
  // Retain the existing v1 save key. Already solved legacy missions keep their
  // deduction/completion. Mid-puzzle players get the new board and keep clues.
  const legacyOrder = ['entrance', 'court', 'scoreboard'];
  const legacySolved = !raw.puzzle && envelopeOpened && raw.blueprintSolved === true &&
    Array.isArray(raw.fragments) && raw.fragments.length === 3 && raw.fragments.every((id, i) => id === legacyOrder[i]);
  const puzzle = !envelopeOpened ? sanitizePuzzle(raw.puzzle ? { ...raw.puzzle, slots: [] } : null, random) : legacySolved ?
    { version: CONFIG.puzzle.version, slots: [...pieceOrder], tray: [] } : sanitizePuzzle(raw.puzzle, random);
  const blueprintSolved = envelopeOpened && isPhotoPuzzleSolved(puzzle);
  const complete = blueprintSolved && raw.complete === true;
  let stage = ['intro','cafe','lock','blueprint','deduction','complete'].includes(raw.stage) ? raw.stage : 'intro';
  if (complete) stage = 'complete';
  else if (stage === 'complete') stage = blueprintSolved ? 'deduction' : lockSolved ? 'blueprint' : evidence.length === 4 ? 'lock' : 'cafe';
  if (stage === 'deduction' && !blueprintSolved) stage = 'blueprint';
  if (stage === 'blueprint' && !lockSolved) stage = evidence.length === 4 ? 'lock' : 'cafe';
  if (stage === 'lock' && evidence.length !== 4) stage = 'cafe';
  return { ...fallback, stage, evidence, puzzle, lockSolved, envelopeOpened,
    blueprintSolved, complete,
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
  save(); // Persist repaired/migrated saves and the initial shuffled tray.
  return {
    get, get persistenceAvailable() { return persistenceAvailable; },
    start() { return commit(s => { if (s.stage === 'intro') s.stage = 'cafe'; }); },
    collect(id) { if (state.stage !== 'cafe' || !CONFIG.evidence.some(e => e.id === id)) return false; commit(s => { if (!s.evidence.includes(id)) s.evidence.push(id); }); return true; },
    openLock() { if (state.evidence.length !== 4 || !['cafe','lock'].includes(state.stage)) return false; commit(s => { s.stage = 'lock'; }); return true; },
    unlock(code) { if (state.stage !== 'lock' || state.evidence.length !== 4 || code !== correctCode()) return false; commit(s => { s.lockSolved = true; s.stage = 'blueprint'; }); return true; },
    openEnvelope() { if (state.stage !== 'blueprint' || !state.lockSolved) return false; commit(s => { s.envelopeOpened = true; }); return true; },
    placePiece(id, target) {
      if (state.stage !== 'blueprint' || !state.envelopeOpened || state.blueprintSolved) return { ok: false, reason: 'locked' };
      const result = movePiece(state.puzzle, id, target);
      if (result.ok && result.changed) commit(s => { s.puzzle = result.puzzle; s.blueprintSolved = isPhotoPuzzleSolved(s.puzzle); });
      return { ...result, complete: state.blueprintSolved };
    },
    openDeduction() { if (!state.blueprintSolved || !state.lockSolved) return false; commit(s => { s.stage = 'deduction'; }); return true; },
    chooseDoor(id) { if (state.stage !== 'deduction' || !state.blueprintSolved || id !== CONFIG.correctDoor) return false; commit(s => { s.complete = true; s.stage = 'complete'; }); return true; },
    setSound(enabled) { return commit(s => { s.sound = !!enabled; }); },
    useHint(stage) { if (!(stage in CONFIG.text.hints)) return; return commit(s => { if (!s.hints.includes(stage)) s.hints.push(stage); }); },
    reset() { const sound = state.sound; state = initialState(random); state.sound = sound; save(); return get(); }
  };
}
export function visibleDestination(state) { return state.complete && state.stage === 'complete' ? CONFIG.DESTINATION_NAME : ''; }
