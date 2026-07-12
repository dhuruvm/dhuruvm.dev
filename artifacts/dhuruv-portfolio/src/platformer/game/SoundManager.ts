class SoundManager {
  private ctx: AudioContext | null = null;
  private _enabled = true;

  get enabled() { return this._enabled; }
  setEnabled(v: boolean) { this._enabled = v; }
  toggle() { this._enabled = !this._enabled; return this._enabled; }

  private ctx_(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.1, delay = 0) {
    if (!this._enabled) return;
    try {
      const ctx = this.ctx_();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = type;
      osc.frequency.value = freq;
      const t = ctx.currentTime + delay;
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch { /* audio unavailable */ }
  }

  jump() {
    if (!this._enabled) return;
    try {
      const ctx = this.ctx_();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.07, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch { }
  }

  land() {
    if (!this._enabled) return;
    try {
      const ctx = this.ctx_();
      const size = Math.floor(ctx.sampleRate * 0.06);
      const buf = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const flt = ctx.createBiquadFilter();
      flt.type = 'lowpass';
      flt.frequency.value = 180;
      const g = ctx.createGain();
      src.connect(flt);
      flt.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.22, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      src.start();
    } catch { }
  }

  interact() {
    [440, 554, 659].forEach((f, i) => this.tone(f, 0.18, 'sine', 0.1, i * 0.07));
  }

  score() {
    [523, 784].forEach((f, i) => this.tone(f, 0.1, 'sine', 0.07, i * 0.06));
  }

  tabScore() {
    [392, 523, 659].forEach((f, i) => this.tone(f, 0.14, 'sine', 0.09, i * 0.07));
  }

  death() {
    [400, 300, 200, 100].forEach((f, i) => this.tone(f, 0.12, 'sawtooth', 0.12, i * 0.1));
  }

  win() {
    [261, 329, 392, 523, 659, 784].forEach((f, i) => this.tone(f, 0.4, 'sine', 0.1, i * 0.09));
  }
}

export const sound = new SoundManager();
