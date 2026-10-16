import { CONFIG } from './config.js';
// Decoded buffers allow short effects to overlap without restarting a shared player.
// An optional context factory makes unavailable-audio behavior testable without a browser.
export class AudioManager {
  constructor(enabled = true, contextFactory) {
    this.enabled = enabled; this.context = null; this.buffers = new Map(); this.loading = new Map();
    this.contextFactory = contextFactory || (() => { const Audio = globalThis.AudioContext || globalThis.webkitAudioContext; return Audio ? new Audio() : null; });
  }
  async activate() {
    if (!this.enabled || !CONFIG.ENABLE_SOUND) return false;
    try { this.context ||= this.contextFactory(); if (!this.context) return false; if (this.context.state === 'suspended') await this.context.resume(); return true; } catch { return false; }
  }
  setEnabled(value) { this.enabled = value; }
  async load(name) {
    if (this.buffers.has(name)) return this.buffers.get(name);
    if (this.loading.has(name)) return this.loading.get(name);
    if (!this.context || !CONFIG.sounds[name]) return null;
    const work = (async () => {
      try { const r = await fetch(CONFIG.sounds[name]); if (!r.ok) return null; const b = await this.context.decodeAudioData(await r.arrayBuffer()); this.buffers.set(name, b); return b; } catch { return null; }
    })();
    this.loading.set(name, work); return work;
  }
  async play(name) {
    if (!this.enabled || !CONFIG.ENABLE_SOUND) return false;
    try {
      if (!(await this.activate())) return false;
      const buffer = await this.load(name);
      if (!buffer || !this.enabled) return false;
      const source = this.context.createBufferSource(); const gain = this.context.createGain();
      source.buffer = buffer; gain.gain.value = name === 'final' ? 0.24 : 0.18;
      source.connect(gain); gain.connect(this.context.destination); source.start();
      source.onended = () => { source.disconnect(); gain.disconnect(); }; return true;
    } catch { return false; }
  }
}
