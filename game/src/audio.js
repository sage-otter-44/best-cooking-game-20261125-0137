// Sizzle Station — tiny synthesized sound effects (WebAudio, no audio files).
// One file, one job: every blip, ding and buzz the game makes.

let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

function audio() {
  if (muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, startAt, dur, type = 'sine', vol = 0.12) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + dur + 0.02);
}

export function playEvent(name) {
  switch (name) {
    case 'pick': tone(520, 0, 0.08, 'triangle', 0.1); break;
    case 'place': tone(330, 0, 0.1, 'triangle', 0.1); tone(440, 0.06, 0.1, 'triangle', 0.08); break;
    case 'cooked': tone(880, 0, 0.12, 'sine', 0.12); tone(1174, 0.1, 0.16, 'sine', 0.1); break;
    case 'serve':
      tone(523, 0, 0.12, 'triangle', 0.12);
      tone(659, 0.09, 0.12, 'triangle', 0.12);
      tone(784, 0.18, 0.2, 'triangle', 0.12);
      break;
    case 'error': tone(160, 0, 0.18, 'sawtooth', 0.07); break;
    case 'order': tone(660, 0, 0.07, 'sine', 0.08); tone(990, 0.07, 0.09, 'sine', 0.07); break;
    case 'urgent': tone(740, 0, 0.08, 'square', 0.05); break;
    case 'expired': tone(220, 0, 0.25, 'sawtooth', 0.08); tone(180, 0.15, 0.3, 'sawtooth', 0.07); break;
    case 'trash': tone(300, 0, 0.07, 'triangle', 0.07); break;
    case 'over':
      tone(392, 0, 0.2, 'triangle', 0.1);
      tone(523, 0.18, 0.2, 'triangle', 0.1);
      tone(659, 0.36, 0.35, 'triangle', 0.1);
      break;
    default: break;
  }
}
