// Sizzle Station — mouse and keyboard input.
// One file, one job: turn clicks and keys into world actions, nothing else.

import { LAYOUT, INGREDIENTS, STATIONS } from './config.js';
import {
  addIngredient, collectStation, removeFromPlate, servePlate, clearPlate,
  startShift,
} from './world.js';
import { playEvent, setMuted } from './audio.js';

function pointIn(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function counterSlotAt(px, py) {
  const c = LAYOUT.counter;
  if (!pointIn(px, py, c)) return null;
  const slotW = (c.w - 32) / INGREDIENTS.length;
  const i = Math.floor((px - (c.x + 16)) / slotW);
  if (i < 0 || i >= INGREDIENTS.length) return null;
  const y = c.y + 38;
  if (py < y || py > y + 100) return null;
  return INGREDIENTS[i].id;
}

function plateItemAt(world, px, py) {
  const p = LAYOUT.plate;
  if (world.plate.length === 0) return -1;
  const cx = p.x + p.w / 2;
  const cy = p.y + 150;
  if (py < cy - 70 || py > cy + 70) return -1;
  const n = world.plate.length;
  const idx = Math.round((px - cx) / 74 + (n - 1) / 2);
  if (idx < 0 || idx >= n) return -1;
  return idx;
}

export function handleClick(world, px, py) {
  if (world.phase === 'title') {
    startShift(world);
    playEvent('order');
    return;
  }
  if (world.phase === 'over') {
    startShift(world);
    playEvent('order');
    return;
  }
  // Serve button first — it is the big one.
  if (pointIn(px, py, LAYOUT.serve)) {
    playEvent(servePlate(world));
    return;
  }
  // Cooking stations: collect a finished item.
  for (const station of STATIONS) {
    if (pointIn(px, py, station)) {
      playEvent(collectStation(world, station.id));
      return;
    }
  }
  // Plate: click an item to take it off.
  const plateIdx = plateItemAt(world, px, py);
  if (plateIdx >= 0) {
    playEvent(removeFromPlate(world, plateIdx));
    return;
  }
  // Counter: add an ingredient.
  const ing = counterSlotAt(px, py);
  if (ing) {
    playEvent(addIngredient(world, ing));
  }
}

export function handleKey(world, key) {
  const k = key.toLowerCase();
  if (k === 'm') {
    world.muted = !world.muted;
    setMuted(world.muted);
    return;
  }
  if (k === 'r') {
    startShift(world);
    playEvent('order');
    return;
  }
  if (world.phase === 'title' && (k === ' ' || k === 'enter')) {
    startShift(world);
    playEvent('order');
    return;
  }
  if (world.phase === 'over' && (k === ' ' || k === 'enter')) {
    startShift(world);
    playEvent('order');
    return;
  }
  if (world.phase !== 'playing') return;
  if (k === ' ') {
    playEvent(servePlate(world));
    return;
  }
  if (k === 'x' || k === 'backspace' || k === 'delete') {
    playEvent(clearPlate(world));
    return;
  }
  const ing = INGREDIENTS.find((i) => i.key === k);
  if (ing) playEvent(addIngredient(world, ing.id));
}
