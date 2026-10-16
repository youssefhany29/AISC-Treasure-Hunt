import { CONFIG, pieceOrder } from './config.js';

export function shuffledPieces(random = Math.random) {
  const order = [...pieceOrder];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.every((id, i) => id === pieceOrder[i])) [order[0], order[1]] = [order[1], order[0]];
  return order;
}

export function initialPuzzle(random) {
  return { version: CONFIG.puzzle.version, slots: Array(pieceOrder.length).fill(null), tray: shuffledPieces(random) };
}

export function isPhotoPuzzleSolved(puzzle) {
  return Array.isArray(puzzle?.slots) && puzzle.slots.length === pieceOrder.length &&
    puzzle.slots.every((id, i) => id === pieceOrder[i]);
}

export function sanitizePuzzle(raw, random) {
  const fallback = initialPuzzle(random);
  if (!raw || raw.version !== CONFIG.puzzle.version) return fallback;
  // Recover valid placements; put invalid, missing or duplicate tiles in the tray.
  const storedSlots = Array.isArray(raw.slots) ? raw.slots : [];
  const slots = pieceOrder.map((id, i) => storedSlots[i] === id ? id : null);
  const placed = new Set(slots.filter(Boolean));
  const tray = [];
  if (Array.isArray(raw.tray)) for (const id of raw.tray) {
    if (pieceOrder.includes(id) && !placed.has(id) && !tray.includes(id)) tray.push(id);
  }
  for (const id of fallback.tray) if (!placed.has(id) && !tray.includes(id)) tray.push(id);
  return { version: CONFIG.puzzle.version, slots, tray };
}

export function movePiece(puzzle, id, target) {
  if (!pieceOrder.includes(id) || (!puzzle.tray.includes(id) && !puzzle.slots.includes(id))) return { ok: false, reason: 'unknown' };
  const next = structuredClone(puzzle);
  const origin = next.slots.indexOf(id);
  if (target === 'tray') {
    if (origin < 0) return { ok: true, changed: false, puzzle: next };
    next.slots[origin] = null;
    next.tray.push(id);
  } else {
    if (!Number.isInteger(target) || target < 0 || target >= pieceOrder.length) return { ok: false, reason: 'outside' };
    if (pieceOrder[target] !== id) return { ok: false, reason: 'incorrect' };
    if (next.slots[target] === id) return { ok: true, changed: false, puzzle: next };
    if (next.slots[target]) return { ok: false, reason: 'occupied' };
    if (origin >= 0) next.slots[origin] = null;
    next.tray = next.tray.filter(piece => piece !== id);
    next.slots[target] = id;
  }
  return { ok: true, changed: true, puzzle: next, complete: isPhotoPuzzleSolved(next) };
}
