// Sizzle Station — bootstrap and game loop.
// One file, one job: start the canvas, run frames, wire input to the world.

import { VIEW_W, VIEW_H } from './config.js';
import { newWorld, tick } from './world.js';
import { renderWorld } from './render.js';
import { handleClick, handleKey } from './input.js';
import { worldForShot } from './shots.js';
import { playEvent } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') ?? '7') || 7;

let world;
let frozenNow = 1.2; // fixed clock for screenshot mode so frames are stable

if (shot) {
  world = worldForShot(shot, seed);
  renderWorld(ctx, world, frozenNow);
} else {
  world = newWorld(Date.now() % 2147483647);
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const events = tick(world, dt);
    for (const e of events) playEvent(e);
    renderWorld(ctx, world, now / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
    y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
  };
}

canvas.addEventListener('click', (event) => {
  const p = canvasPoint(event);
  handleClick(world, p.x, p.y);
  if (shot) renderWorld(ctx, world, frozenNow);
});

window.addEventListener('keydown', (event) => {
  if ([' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
  handleKey(world, event.key);
  if (shot) renderWorld(ctx, world, frozenNow);
});
