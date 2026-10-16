import { showModal } from './modal.js';

export function confirmRestart(onConfirm) {
  showModal(`<p class="eyebrow">CASE SETTINGS / RESTART MISSION</p><h2 id="modal-title">Restart the mission from the beginning?</h2><p>This resets your evidence, puzzles and mission progress on this browser. Your sound preference is kept.</p><button id="confirm-restart" class="primary-button full" type="button">RESTART MISSION</button><button class="secondary-button full" type="button" data-close>CANCEL</button>`, root => {
    root.querySelector('#confirm-restart').addEventListener('click', event => {
      event.currentTarget.disabled = true;
      onConfirm();
    }, { once: true });
  });
}
