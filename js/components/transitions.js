import { CONFIG } from '../config.js';
export const reducedMotion = () => !CONFIG.ENABLE_ANIMATIONS || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export const animationDelay = (ms = 600) => new Promise(resolve => setTimeout(resolve, reducedMotion() ? 0 : ms));
export function replayAnimation(element, className) { if (!element) return; element.classList.remove(className); void element.offsetWidth; element.classList.add(className); }
