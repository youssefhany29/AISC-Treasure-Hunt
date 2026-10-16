import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, correctCode, storageKey, verifiedNextURL, pieceOrder } from '../js/config.js';
import { createGame, initialState, sanitizeState, unsolvedOrder, visibleDestination } from '../js/game-state.js';
import { initialPuzzle, sanitizePuzzle, isPhotoPuzzleSolved, movePiece } from '../js/photo-puzzle-state.js';
import { AudioManager } from '../js/audio-manager.js';

const memory = () => { const data = new Map(); return { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value) }; };
function readyLock(game) { game.start(); for (const e of CONFIG.evidence) game.collect(e.id); game.openLock(); }
function readyPuzzle(game) { readyLock(game); game.unlock('6813'); game.openEnvelope(); }
function solvePuzzle(game) { pieceOrder.forEach((id, slot) => game.placePiece(id, slot)); }
const legacy = () => ({ version: 1, stage: 'blueprint', evidence: CONFIG.evidence.map(e => e.id), lockSolved: true,
  envelopeOpened: true, fragments: ['court', 'entrance', 'scoreboard'], blueprintSolved: false,
  complete: false, sound: false, hints: ['cafe', 'blueprint'] });

test('initial game has an empty six-slot board and six shuffled pieces', () => {
  const state = initialState(); assert.equal(state.stage, 'intro'); assert.deepEqual(state.evidence, []);
  assert.equal(state.complete, false); assert.deepEqual(state.puzzle.slots, Array(6).fill(null));
  assert.equal(state.puzzle.tray.length, 6); assert.equal(isPhotoPuzzleSolved(state.puzzle), false);
});
test('starting enters cafe and cannot skip the clues', () => {
  const g = createGame(memory()); assert.equal(g.openLock(), false); assert.equal(g.start().stage, 'cafe'); assert.equal(g.openLock(), false);
});
test('each evidence object is recoverable; duplicates and unknown clues never increase the count', () => {
  const g = createGame(memory()); assert.equal(g.collect('receipt'), false); g.start();
  for (const e of CONFIG.evidence) { assert.equal(g.collect(e.id), true); g.collect(e.id); }
  assert.equal(g.get().evidence.length, 4); assert.equal(g.collect('invented'), false);
});
test('all four clues are required to open the locked case', () => {
  const g = createGame(memory()); g.start(); g.collect('receipt'); assert.equal(g.openLock(), false);
  for (const e of CONFIG.evidence) g.collect(e.id); assert.equal(g.openLock(), true); assert.equal(g.get().stage, 'lock');
});
test('the original symbols still derive code 6813', () => {
  assert.equal(correctCode(), '6813'); assert.deepEqual(CONFIG.lockOrder.map(id => CONFIG.evidence.find(e => e.id === id).symbol), ['■', '▲', '★', '●']);
});
test('wrong codes allow unlimited retries while preserving evidence', () => {
  const g = createGame(memory()); readyLock(g); for (let i = 0; i < 20; i++) assert.equal(g.unlock('1234'), false);
  assert.equal(g.get().stage, 'lock'); assert.equal(g.get().evidence.length, 4); assert.equal(g.unlock('6813'), true);
});
test('the photo puzzle stays locked until the code and envelope are opened', () => {
  const g = createGame(memory()); assert.equal(g.unlock('6813'), false); assert.equal(g.openEnvelope(), false);
  assert.equal(g.placePiece(pieceOrder[0], 0).ok, false); readyLock(g); assert.equal(g.unlock('6813'), true);
  assert.equal(g.get().stage, 'blueprint'); assert.equal(g.placePiece(pieceOrder[0], 0).ok, false);
  assert.equal(g.openEnvelope(), true); assert.equal(g.placePiece(pieceOrder[0], 0).ok, true);
});
test('shuffling produces six unique pieces and never the original ordered tray', () => {
  for (let i = 0; i < 1000; i++) { const order = unsolvedOrder(); assert.notDeepEqual(order, pieceOrder); assert.deepEqual([...order].sort(), [...pieceOrder].sort()); }
  for (const value of [0, .2, .5, .999999, 1]) assert.notDeepEqual(unsolvedOrder(() => value), pieceOrder);
});
test('a correct drop snaps to its slot and removes that tile from the tray', () => {
  const g = createGame(memory()); readyPuzzle(g); const result = g.placePiece(pieceOrder[2], 2);
  assert.equal(result.ok, true); assert.equal(g.get().puzzle.slots[2], pieceOrder[2]); assert.equal(g.get().puzzle.tray.includes(pieceOrder[2]), false);
});
test('wrong, unknown and out-of-board drops leave all progress intact', () => {
  const g = createGame(memory()); readyPuzzle(g); const before = g.get();
  for (const [id, slot] of [[pieceOrder[0], 1], ['invented', 2], [pieceOrder[0], 9], [pieceOrder[0], null], [pieceOrder[0], '0']]) {
    assert.equal(g.placePiece(id, slot).ok, false); assert.deepEqual(g.get(), before);
  }
});
test('already placed pieces can return to the tray and be placed again', () => {
  const g = createGame(memory()); readyPuzzle(g); g.placePiece(pieceOrder[0], 0); g.placePiece(pieceOrder[1], 1);
  assert.equal(g.placePiece(pieceOrder[0], 'tray').ok, true); assert.equal(g.get().puzzle.slots[0], null);
  assert.equal(g.get().puzzle.slots[1], pieceOrder[1]); assert.equal(g.get().puzzle.tray.includes(pieceOrder[0]), true);
  g.placePiece(pieceOrder[0], 0); assert.equal(g.get().puzzle.slots[0], pieceOrder[0]);
});
test('a misplaced attempt cannot overwrite an occupied correct slot', () => {
  const g = createGame(memory()); readyPuzzle(g); g.placePiece(pieceOrder[0], 0); const before = g.get();
  assert.equal(g.placePiece(pieceOrder[1], 0).ok, false); assert.deepEqual(g.get(), before);
});
test('repeated placement never duplicates a piece', () => {
  const g = createGame(memory()); readyPuzzle(g); g.placePiece(pieceOrder[0], 0);
  assert.equal(g.placePiece(pieceOrder[0], 0).changed, false); assert.equal(g.get().puzzle.slots.filter(Boolean).length, 1); assert.equal(g.get().puzzle.tray.length, 5);
});
test('only all six correct slots complete the puzzle and unlock the next stage', () => {
  const g = createGame(memory()); readyPuzzle(g); assert.equal(g.openDeduction(), false);
  for (let i = 0; i < 5; i++) g.placePiece(pieceOrder[i], i); assert.equal(g.get().blueprintSolved, false);
  assert.equal(g.openDeduction(), false); assert.equal(g.placePiece(pieceOrder[5], 5).complete, true);
  assert.equal(g.placePiece(pieceOrder[0], 'tray').ok, false); assert.equal(g.openDeduction(), true); assert.equal(g.get().stage, 'deduction');
});
test('incorrect doors remain harmless; Door D still completes the case', () => {
  const g = createGame(memory()); readyPuzzle(g); solvePuzzle(g); g.openDeduction();
  for (const door of ['A', 'B', 'C']) { assert.equal(g.chooseDoor(door), false); assert.equal(g.get().stage, 'deduction'); }
  assert.equal(g.chooseDoor('D'), true); assert.equal(g.get().complete, true);
});
test('destination name remains hidden until mission completion', () => {
  const g = createGame(memory()); assert.equal(visibleDestination(g.get()), ''); readyPuzzle(g); assert.equal(visibleDestination(g.get()), '');
  solvePuzzle(g); g.openDeduction(); assert.equal(visibleDestination(g.get()), ''); g.chooseDoor('D'); assert.equal(visibleDestination(g.get()), 'SPOR SALONU');
});
test('placements, remaining tray order, preferences and hints survive refresh', () => {
  const store = memory(); const g = createGame(store); readyPuzzle(g); g.setSound(false); g.useHint('blueprint');
  g.placePiece(pieceOrder[0], 0); g.placePiece(pieceOrder[2], 2); assert.deepEqual(createGame(store).get(), g.get());
});
test('the initial shuffled tray is persisted even before a first drop', () => {
  const store = memory(); const g = createGame(store); assert.deepEqual(createGame(store).get().puzzle.tray, g.get().puzzle.tray);
});
test('completed progress still reopens Mission Complete', () => {
  const store = memory(); const g = createGame(store); readyPuzzle(g); solvePuzzle(g); g.openDeduction(); g.chooseDoor('D'); assert.equal(createGame(store).get().stage, 'complete');
});
test('corrupt JSON and incompatible storage versions fall back safely', () => {
  const store = memory(); store.setItem(storageKey, '{bad json'); assert.equal(createGame(store).get().stage, 'intro');
  store.setItem(storageKey, JSON.stringify({ version: 999, stage: 'complete', complete: true })); assert.equal(createGame(store).get().complete, false);
});
test('corrupted photo state recovers every tile once and retains valid placements', () => {
  const puzzle = sanitizePuzzle({ version: 2, slots: [pieceOrder[0], pieceOrder[0], 'wrong'], tray: [pieceOrder[0], pieceOrder[1], pieceOrder[1], 'unknown'] });
  assert.equal(puzzle.slots[0], pieceOrder[0]); assert.equal(puzzle.slots[1], null);
  const all = [...puzzle.slots.filter(Boolean), ...puzzle.tray]; assert.equal(all.length, 6); assert.deepEqual([...all].sort(), [...pieceOrder].sort());
});
test('untrusted save flags cannot skip the game stages', () => {
  const raw = { ...initialState(), stage: 'complete', evidence: ['receipt', 'receipt', 'bogus'], lockSolved: true, blueprintSolved: true, complete: true };
  const state = sanitizeState(raw); assert.equal(state.complete, false); assert.equal(state.stage, 'cafe'); assert.deepEqual(state.evidence, ['receipt']); assert.equal(state.lockSolved, false);
});
test('a refresh during the last-drop animation retains the solved photo', () => {
  const g = createGame(memory()); readyPuzzle(g); const state = g.get(); state.puzzle.slots = [...pieceOrder]; state.puzzle.tray = []; state.blueprintSolved = false;
  assert.equal(sanitizeState(state).blueprintSolved, true);
});
test('legacy unfinished blueprint saves retain earlier progress and get an empty photo board', () => {
  const state = sanitizeState(legacy()); assert.equal(state.stage, 'blueprint'); assert.equal(state.lockSolved, true); assert.equal(state.envelopeOpened, true);
  assert.equal(state.evidence.length, 4); assert.equal(state.sound, false); assert.deepEqual(state.hints, ['cafe', 'blueprint']);
  assert.deepEqual(state.puzzle.slots, Array(6).fill(null)); assert.equal(state.puzzle.tray.length, 6);
});
test('legacy solved blueprint saves retain deduction and completed missions', () => {
  for (const stage of ['deduction', 'complete']) {
    const old = { ...legacy(), stage, fragments: ['entrance', 'court', 'scoreboard'], blueprintSolved: true, complete: stage === 'complete' };
    const state = sanitizeState(old); assert.equal(state.stage, stage); assert.equal(state.blueprintSolved, true); assert.equal(isPhotoPuzzleSolved(state.puzzle), true);
  }
});
test('pure placement does not mutate its input', () => {
  const puzzle = initialPuzzle(); const before = structuredClone(puzzle); movePiece(puzzle, pieceOrder[0], 0); assert.deepEqual(puzzle, before);
});
test('reset clears the six-piece puzzle while retaining sound preference', () => {
  const g = createGame(memory()); readyPuzzle(g); g.placePiece(pieceOrder[0], 0); g.setSound(false); g.reset();
  assert.equal(g.get().stage, 'intro'); assert.deepEqual(g.get().evidence, []); assert.equal(g.get().sound, false); assert.deepEqual(g.get().puzzle.slots, Array(6).fill(null));
});
test('unavailable storage does not block play or completion', () => {
  const broken = { getItem() { throw Error('denied'); }, setItem() { throw Error('full'); } }; const g = createGame(broken);
  readyPuzzle(g); solvePuzzle(g); g.openDeduction(); assert.equal(g.chooseDoor('D'), true); assert.equal(g.persistenceAvailable, false);
});
test('muted or unavailable audio remains non-blocking', async () => {
  const muted = new AudioManager(false, () => { throw Error('must not initialize'); }); assert.equal(await muted.play('tap'), false);
  const unavailable = new AudioManager(true, () => null); assert.equal(await unavailable.play('tap'), false);
  const broken = new AudioManager(true, () => { throw Error('unavailable'); }); assert.equal(await broken.activate(), false);
});
test('the optional navigation button remains absent without a verified URL', () => assert.equal(verifiedNextURL(), null));
