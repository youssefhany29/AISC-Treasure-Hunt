const dialog = document.querySelector('#modal');
const content = document.querySelector('#modal-content');
let returnFocus;
export function closeModal() { if (dialog.open) dialog.close(); }
export function showModal(html, onOpen) {
  returnFocus = document.activeElement;
  content.innerHTML = html;
  if (!dialog.open) dialog.showModal();
  onOpen?.(content);
}
document.querySelector('#modal-x').addEventListener('click', closeModal);
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeModal(); } });
dialog.addEventListener('close', () => { if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true }); });
content.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
export const isModalOpen = () => dialog.open;
