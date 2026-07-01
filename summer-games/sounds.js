/* ============================================================
   קיץ ישראלי - מנוע סאונד וקונפטי משותף
   ============================================================ */

class SoundEngine {
  constructor() {
    this._ctx = null;
    this.enabled = true;
  }

  get ctx() {
    if (!this._ctx) {
      try {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) { return null; }
    }
    if (this._ctx && this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  tone(freq, type = 'sine', dur = 0.2, vol = 0.4, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.connect(g);
      g.connect(this.ctx.destination);
      o.type = type;
      o.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      g.gain.setValueAtTime(0, this.ctx.currentTime + delay);
      g.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + dur);
      o.start(this.ctx.currentTime + delay);
      o.stop(this.ctx.currentTime + delay + dur + 0.05);
    } catch(e) {}
  }

  noise(dur = 0.1, vol = 0.2, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const bufSize = this.ctx.sampleRate * dur;
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const g = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      src.connect(filter);
      filter.connect(g);
      g.connect(this.ctx.destination);
      g.gain.setValueAtTime(vol, this.ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + dur);
      src.start(this.ctx.currentTime + delay);
    } catch(e) {}
  }

  /* --- Sound effects --- */

  flip() {
    this.tone(800, 'sine', 0.05, 0.25);
    this.tone(600, 'sine', 0.05, 0.15, 0.03);
  }

  match() {
    // Rising chime
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 'sine', 0.22, 0.45, i * 0.09));
    this.noise(0.08, 0.1, 0.05);
  }

  wrong() {
    this.tone(220, 'sawtooth', 0.22, 0.35);
    this.tone(180, 'sawtooth', 0.18, 0.28, 0.14);
    this.noise(0.15, 0.15);
  }

  correct() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 'sine', 0.18, 0.5, i * 0.07));
  }

  win() {
    // Full fanfare melody
    const melody = [523, 587, 659, 523, 659, 784, 880, 1047, 880, 1047];
    melody.forEach((f, i) => {
      this.tone(f, 'sine', 0.28, 0.5, i * 0.1);
      this.tone(f * 2, 'sine', 0.1, 0.15, i * 0.1 + 0.01);
    });
  }

  tick() {
    this.tone(1200, 'square', 0.04, 0.12);
  }

  urgentTick() {
    this.tone(1400, 'square', 0.06, 0.2);
    this.tone(1000, 'square', 0.04, 0.15, 0.04);
  }

  reveal() {
    this.tone(440, 'sine', 0.1, 0.3);
    this.tone(660, 'sine', 0.1, 0.3, 0.07);
    this.tone(880, 'sine', 0.1, 0.3, 0.14);
  }

  button() {
    this.tone(500, 'sine', 0.06, 0.2);
  }

  hint() {
    this.tone(400, 'sine', 0.12, 0.3);
    this.tone(533, 'sine', 0.12, 0.3, 0.09);
    this.tone(666, 'sine', 0.12, 0.3, 0.18);
  }

  letterType() {
    this.tone(700 + Math.random() * 200, 'sine', 0.04, 0.15);
  }

  celebrate() {
    // Quick happy jingle
    [784, 988, 784, 988, 1175].forEach((f, i) => this.tone(f, 'sine', 0.12, 0.4, i * 0.08));
  }
}

const sound = new SoundEngine();

// Activate audio context on first user interaction
document.addEventListener('click', () => { if (sound.ctx) {} }, { once: true });

/* ============================================================
   CONFETTI ENGINE
   ============================================================ */

function launchConfetti(count = 130, options = {}) {
  const {
    originX = null,  // null = random across top
    originY = 'top', // 'top' or 'center' or px value
    burst = false,   // explode from center
  } = options;

  const colors = [
    '#FFB800','#FF6B6B','#0077B6','#52B788',
    '#90E0EF','#A855F7','#F97316','#10B981',
    '#EF4444','#3B82F6','#F59E0B','#8B5CF6',
  ];

  const SHAPES = ['square', 'circle', 'ribbon'];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const size = shape === 'ribbon' ? `${4 + Math.random() * 4}px` : `${7 + Math.random() * 9}px`;
    const w = shape === 'ribbon' ? `${3 + Math.random() * 3}px` : size;
    const h = shape === 'ribbon' ? `${12 + Math.random() * 14}px` : size;
    const delay = burst ? Math.random() * 0.3 : Math.random() * 1.6;
    const dur = 2 + Math.random() * 2.5;
    const drift = (Math.random() - 0.5) * 350;
    const rotate = (Math.random() - 0.5) * 1440;
    const startX = originX !== null ? originX : Math.random() * 100;
    const startY = originY === 'top' ? '-20px' : originY === 'center' ? '40vh' : originY;
    const initVY = burst ? `-${80 + Math.random() * 120}px` : '0px';

    el.style.cssText = `
      position:fixed;
      top:${startY};
      left:${startX}${typeof startX === 'number' ? 'vw' : ''};
      width:${w};height:${h};
      background:${color};
      border-radius:${shape === 'circle' ? '50%' : shape === 'ribbon' ? '2px' : '3px'};
      animation: confettiDrop ${dur}s cubic-bezier(.25,.46,.45,.94) ${delay}s forwards;
      --drift:${drift}px;
      --rotate:${rotate}deg;
      --initVY:${initVY};
      z-index:9999;pointer-events:none;opacity:1;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), (delay + dur + 0.2) * 1000);
  }

  // Shoot some from bottom as "fireworks"
  if (!burst) {
    for (let i = 0; i < 20; i++) {
      const el = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 8 + Math.random() * 8;
      const x = 10 + Math.random() * 80;
      const delay = Math.random() * 1;

      el.style.cssText = `
        position:fixed;bottom:0;left:${x}vw;
        width:${size}px;height:${size}px;
        background:${color};border-radius:50%;
        animation:fireworkUp ${0.8 + Math.random() * 0.6}s ease-out ${delay}s forwards;
        z-index:9999;pointer-events:none;
        --targetY:${-(20 + Math.random() * 60)}vh;
        --targetX:${(Math.random()-0.5)*200}px;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), (delay + 1.6) * 1000);
    }
  }
}

// Sparkle burst at a DOM element
function sparkleAt(el, count = 16) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['#FFB800','#FF6B6B','#52B788','#0077B6','#A855F7','#F97316'];

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    const angle = (i / count) * 360;
    const dist = 30 + Math.random() * 50;
    const size = 5 + Math.random() * 7;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const dx = Math.cos(angle * Math.PI / 180) * dist;
    const dy = Math.sin(angle * Math.PI / 180) * dist;

    dot.style.cssText = `
      position:fixed;left:${cx}px;top:${cy}px;
      width:${size}px;height:${size}px;
      background:${color};border-radius:50%;
      animation:sparkleOut 0.6s ease-out forwards;
      --dx:${dx}px;--dy:${dy}px;
      z-index:9999;pointer-events:none;
      transform:translate(-50%,-50%);
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 700);
  }
}
