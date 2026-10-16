import { reducedMotion } from './transitions.js';

/** Unified Pointer Events handle real mouse, pen and touch drags. Native HTML
 * drag events are deliberately avoided because mobile support varies. */
export function attachPuzzleDrag(root, { onDrop, onTap, onPick, canDrag }) {
  let drag = null;
  let frame = 0;
  const ghosts = new Set();

  function targetAt(x, y) {
    const target = document.elementFromPoint(x, y)?.closest('[data-slot], [data-tray]');
    return target && root.contains(target) ? target : null;
  }

  function updateHover() {
    root.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    const target = targetAt(drag.x, drag.y);
    if (target) target.classList.add('drag-over');
  }

  function positionGhost() {
    if (!drag?.ghost) return;
    drag.ghost.style.left = `${drag.x - drag.offsetX}px`;
    drag.ghost.style.top = `${drag.y - drag.offsetY - 8}px`;
    updateHover();
  }

  function autoScroll() {
    if (!drag?.active) return;
    const margin = 70;
    const amount = drag.y < margin ? -Math.ceil((margin - drag.y) / 7) :
      drag.y > innerHeight - margin ? Math.ceil((drag.y - innerHeight + margin) / 7) : 0;
    if (amount) { window.scrollBy(0, Math.max(-12, Math.min(12, amount))); updateHover(); }
    frame = requestAnimationFrame(autoScroll);
  }

  function begin() {
    drag.active = true;
    const ghost = drag.source.cloneNode(true);
    ghost.removeAttribute('data-piece');
    ghost.removeAttribute('id');
    ghost.className = 'puzzle-piece puzzle-drag-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.tabIndex = -1;
    ghost.disabled = true;
    Object.assign(ghost.style, { width: `${drag.rect.width}px`, height: `${drag.rect.height}px` });
    document.body.append(ghost);
    ghosts.add(ghost);
    drag.ghost = ghost;
    drag.source.classList.add('drag-source');
    root.classList.add('is-dragging');
    onPick(drag.id);
    positionGhost();
    frame = requestAnimationFrame(autoScroll);
  }

  function down(event) {
    const source = event.target.closest('[data-piece]');
    if (!source || !root.contains(source) || drag || !canDrag() || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    const rect = source.getBoundingClientRect();
    source.focus({ preventScroll: true });
    drag = { id: source.dataset.piece, pointer: event.pointerId, source, rect,
      startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY,
      offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, active: false };
    root.setPointerCapture(event.pointerId);
  }

  function move(event) {
    if (!drag || event.pointerId !== drag.pointer) return;
    event.preventDefault();
    drag.x = event.clientX; drag.y = event.clientY;
    if (!drag.active && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) > 5) begin();
    if (drag.active) positionGhost();
  }

  function finish(event, canceled = false) {
    if (!drag || event.pointerId !== drag.pointer) return;
    event.preventDefault();
    const current = drag;
    const target = current.active && !canceled ? targetAt(event.clientX, event.clientY) : null;
    drag = null;
    cancelAnimationFrame(frame);
    root.classList.remove('is-dragging');
    root.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    current.source.classList.remove('drag-source');
    if (root.hasPointerCapture(current.pointer)) root.releasePointerCapture(current.pointer);
    if (!current.active) { if (!canceled) onTap(current.id); return; }
    if (!canceled && target) onDrop(current.id, target.hasAttribute('data-tray') ? 'tray' : Number(target.dataset.slot));
    else if (!canceled) onDrop(current.id, null);
    const destination = root.querySelector(`[data-piece="${current.id}"]`);
    const rect = destination?.getBoundingClientRect() || current.rect;
    const ghost = current.ghost;
    const remove = () => { ghost.remove(); ghosts.delete(ghost); };
    if (ghost.animate && !reducedMotion()) {
      ghost.animate([{ left: ghost.style.left, top: ghost.style.top, transform: 'scale(1.06)' },
        { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, transform: 'scale(1)' }],
      { duration: 180, easing: 'ease-out', fill: 'forwards' }).finished.then(remove, remove);
    } else remove();
  }

  const up = event => finish(event);
  const cancel = event => finish(event, true);
  const key = event => { if (event.key === 'Escape' && drag) finish({ pointerId: drag.pointer, preventDefault() {} }, true); };
  root.addEventListener('pointerdown', down);
  root.addEventListener('pointermove', move, { passive: false });
  root.addEventListener('pointerup', up);
  root.addEventListener('pointercancel', cancel);
  root.addEventListener('lostpointercapture', cancel);
  document.addEventListener('keydown', key);
  return () => {
    if (drag) finish({ pointerId: drag.pointer, preventDefault() {} }, true);
    cancelAnimationFrame(frame);
    for (const ghost of ghosts) ghost.remove();
    ghosts.clear();
    root.removeEventListener('pointerdown', down);
    root.removeEventListener('pointermove', move);
    root.removeEventListener('pointerup', up);
    root.removeEventListener('pointercancel', cancel);
    root.removeEventListener('lostpointercapture', cancel);
    document.removeEventListener('keydown', key);
  };
}
