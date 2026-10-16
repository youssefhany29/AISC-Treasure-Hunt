import { CONFIG } from '../config.js';
import { stageHeading, bindStageActions, arrow } from '../components/ui.js';
import { animationDelay, replayAnimation } from '../components/transitions.js';
import { attachPuzzleDrag } from '../components/drag-puzzle.js';

export function renderBlueprint(root, ctx) {
  if (!ctx.game.get().envelopeOpened) return renderEnvelope(root, ctx);
  let selected = null;
  let completionTimer;
  let alive = true;

  root.innerHTML = `<section class="stage-enter photo-puzzle-stage">
    ${stageHeading('03', CONFIG.text.blueprintTitle, CONFIG.text.blueprintObjective, ctx)}
    <div class="photo-puzzle-workspace">
      <div class="blueprint-toolbar"><span><i class="live-dot" aria-hidden="true"></i> RECOVERED PHOTOGRAPH</span><span>6 PHOTO PIECES · 3 × 2</span></div>
      <p class="photo-puzzle-instructions">Drag a piece into a slot. Match the image edges.<small>Or select a piece, then tap a slot. Keyboard: Tab, Enter or Space.</small></p>
      <div class="photo-puzzle-layout" id="photo-puzzle-layout">
        <div class="puzzle-board-area"><div class="puzzle-area-label"><span>TARGET BOARD</span><span id="placed-count">0 / 6</span></div>
          <div class="puzzle-board" id="puzzle-board" role="group" aria-label="Empty photo puzzle target board, three columns and two rows"></div>
          <p class="board-caption">RECONSTRUCT THE MISSING IMAGE</p>
        </div>
        <div class="puzzle-tray-area"><div class="puzzle-area-label"><span>PIECES</span><span aria-hidden="true">↔</span></div>
          <div class="puzzle-tray" id="puzzle-tray" data-tray role="group" aria-label="Shuffled photo pieces; return placed pieces here"></div>
          <button class="text-button puzzle-return" id="return-piece" type="button" disabled>Return selected piece to tray</button>
        </div>
      </div>
      <div class="photo-puzzle-footer"><div><p id="blueprint-status" class="eyebrow" role="status" aria-live="polite">THE IMAGE HOLDS THE ANSWER</p><p id="blueprint-message">Pick up a piece and follow the court lines, railings and image edges.</p></div>
        <button id="deduce" class="primary-button" type="button" hidden>CONTINUE ${arrow}</button>
      </div>
    </div>
    <p class="stage-footnote"><span aria-hidden="true">◇</span> THE PLACE HAS NO NAME. YET.</p>
  </section>`;

  const layout = root.querySelector('#photo-puzzle-layout');
  const board = root.querySelector('#puzzle-board');
  const tray = root.querySelector('#puzzle-tray');
  const message = root.querySelector('#blueprint-message');
  const status = root.querySelector('#blueprint-status');
  const continueButton = root.querySelector('#deduce');
  const returnButton = root.querySelector('#return-piece');

  function tileHTML(id, solved) {
    const piece = CONFIG.puzzle.pieces.find(p => p.id === id);
    return `<button class="puzzle-piece ${selected === id ? 'selected' : ''}" data-piece="${id}" style="--tile-ratio:${piece.width}/${piece.height}" type="button" aria-label="Photo piece ${piece.label}${selected === id ? ', selected' : ''}" aria-pressed="${selected === id}" ${solved ? 'disabled' : ''}><img src="${piece.image}" width="${piece.width}" height="${piece.height}" alt="" draggable="false"></button>`;
  }

  function draw(justPlaced) {
    const state = ctx.game.get();
    board.classList.toggle('restored', state.blueprintSolved);
    board.setAttribute('aria-label', state.blueprintSolved ? 'Completed sports hall photo puzzle' : 'Photo puzzle target board, three columns and two rows');
    board.innerHTML = state.puzzle.slots.map((id, index) => `<div class="puzzle-slot ${id ? 'occupied' : ''} ${id === justPlaced ? 'just-placed' : ''}" data-slot="${index}" style="--tile-ratio:${CONFIG.puzzle.pieces[index].width}/${CONFIG.puzzle.pieces[index].height}">${id ? tileHTML(id, state.blueprintSolved) : `<button class="slot-target" data-place="${index}" type="button" aria-label="Place selected piece in row ${Math.floor(index / CONFIG.puzzle.columns) + 1}, column ${index % CONFIG.puzzle.columns + 1}"><span aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="slot-corners" aria-hidden="true"></span></button>`}</div>`).join('');
    tray.innerHTML = state.puzzle.tray.length ? state.puzzle.tray.map(id => tileHTML(id, false)).join('') : '<p class="tray-empty">ALL PIECES<br>RECOVERED <span aria-hidden="true">✓</span></p>';
    root.querySelector('#placed-count').textContent = `${state.puzzle.slots.filter(Boolean).length} / 6`;
    returnButton.disabled = !selected || state.blueprintSolved;
    if (state.blueprintSolved) {
      status.textContent = '✓ IMAGE RESTORED'; status.className = 'success-label';
      message.textContent = 'The photograph is whole. Continuing to the final deduction…';
      continueButton.hidden = false;
    }
  }

  function choose(id) {
    if (ctx.game.get().blueprintSolved) return;
    selected = selected === id ? null : id;
    ctx.audio.play('select');
    draw();
    status.className = 'eyebrow';
    status.textContent = selected ? 'PIECE SELECTED' : 'THE IMAGE HOLDS THE ANSWER';
    message.textContent = selected ? 'Now choose a slot, or drag the piece into place.' : 'Pick up a piece and follow the court lines, railings and image edges.';
    layout.querySelector(`[data-piece="${id}"]`)?.focus({ preventScroll: true });
  }

  function drop(id, target) {
    const result = ctx.game.placePiece(id, target);
    if (!result.ok) {
      ctx.audio.play('error');
      status.textContent = target === null ? 'DROP INSIDE THE TARGET BOARD' : 'THOSE EDGES DON’T MATCH';
      status.className = 'puzzle-error-label';
      message.textContent = 'The piece has returned safely. Try a different slot.';
      if (Number.isInteger(target)) replayAnimation(layout.querySelector(`[data-slot="${target}"]`), 'drop-rejected');
      return result;
    }
    selected = null;
    draw(target === 'tray' ? null : id);
    if (!result.complete) {
      status.textContent = target === 'tray' ? 'PIECE RETURNED TO TRAY' : '✓ PIECE IN PLACE';
      status.className = target === 'tray' ? 'eyebrow' : 'success-label';
      message.textContent = target === 'tray' ? 'Your other placements are saved. Move it again whenever you like.' : 'A match. Keep following the image edges.';
      if (result.changed) ctx.audio.play('place');
    } else {
      ctx.audio.play('blueprint');
      ctx.updateChrome();
      scheduleContinuation();
    }
    return result;
  }

  function continueMission() {
    if (!alive || ctx.game.get().stage !== 'blueprint') return;
    if (document.querySelector('dialog[open]')) { completionTimer = setTimeout(continueMission, 500); return; }
    if (ctx.game.openDeduction()) ctx.render();
  }

  function scheduleContinuation() {
    clearTimeout(completionTimer);
    completionTimer = setTimeout(continueMission, ctx.reducedMotion() ? 1400 : 2200);
  }

  draw();
  bindStageActions(root, ctx);
  const detachDrag = attachPuzzleDrag(layout, {
    canDrag: () => !ctx.game.get().blueprintSolved,
    onTap: choose,
    onDrop: drop,
    onPick: () => {
      selected = null;
      layout.querySelectorAll('.selected').forEach(el => { el.classList.remove('selected'); el.setAttribute('aria-pressed', 'false'); });
      returnButton.disabled = true;
      status.textContent = 'PIECE PICKED UP'; status.className = 'eyebrow';
      message.textContent = 'Move over a slot and release to place the piece.';
      ctx.audio.play('select');
    }
  });

  layout.addEventListener('click', event => {
    const piece = event.target.closest('[data-piece]');
    // Pointer taps are handled by the unified drag controller; detail 0 is
    // native keyboard/assistive activation, so both paths remain accessible.
    if (piece && event.detail === 0) { choose(piece.dataset.piece); return; }
    const slot = event.target.closest('[data-place]');
    if (slot) {
      if (selected) drop(selected, Number(slot.dataset.place));
      else { status.textContent = 'SELECT A PIECE FIRST'; status.className = 'eyebrow'; message.textContent = 'Choose a piece from the tray, then choose its slot.'; }
    }
  });
  returnButton.addEventListener('click', () => { if (selected) drop(selected, 'tray'); });
  continueButton.addEventListener('click', continueMission);
  if (ctx.game.get().blueprintSolved) scheduleContinuation();
  return () => { alive = false; clearTimeout(completionTimer); detachDrag(); };
}

function renderEnvelope(root, ctx) {
  root.innerHTML = `<section class="stage-enter">${stageHeading('03', CONFIG.text.blueprintTitle, 'The case is open. One sealed envelope remains inside.', ctx)}<div class="envelope-scene"><p class="eyebrow">ACCESS GRANTED / EVIDENCE UNSEALED</p><button class="envelope" id="envelope" type="button" aria-label="Open the sealed investigation envelope"><span class="envelope-flap" aria-hidden="true"></span><span class="envelope-stamp">CONFIDENTIAL</span><span class="envelope-address">FOR THE INVESTIGATOR<br><small>RECONSTRUCT WHAT WAS LOST.</small></span><span class="wax-seal" aria-hidden="true">02</span><span class="envelope-tap">OPEN THE ENVELOPE <span aria-hidden="true">↗</span></span></button><p class="envelope-note">“If you're reading this, you followed the evidence.<br>The destination was erased. This photograph wasn't.”</p></div></section>`;
  bindStageActions(root, ctx);
  root.querySelector('#envelope').addEventListener('click', async event => {
    event.currentTarget.disabled = true; event.currentTarget.classList.add('opening');
    ctx.game.openEnvelope(); ctx.audio.play('folder'); await animationDelay(550); ctx.render();
  });
}
