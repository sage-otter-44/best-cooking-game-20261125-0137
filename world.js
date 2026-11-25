// Sizzle Station — the world: game state and every rule that changes it.
// One file, one job: pure state transitions. No drawing, no input, no sound here.

import {
  INGREDIENTS, RECIPES, STATIONS, SHIFT_SECONDS, MAX_HEARTS, MAX_ORDERS,
  ORDER_LIFETIME, FIRST_ORDER_DELAY, SPAWN_GAP_START, SPAWN_GAP_END,
  SCORE_BASE, SCORE_TIME_BONUS_PER_SECOND, COMBO_STEP, WRONG_SERVE_PENALTY,
  ingredientById,
} from './config.js';
import { makeRng, pickFrom } from './random.js';

export function newWorld(seed) {
  return {
    seed,
    rng: makeRng(seed),
    phase: 'title', // title | playing | over
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    score: 0,
    coins: 0,
    dishes: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    orders: [], // { id, recipe, timeLeft, total }
    nextOrderId: 1,
    spawnIn: FIRST_ORDER_DELAY,
    plate: [], // ingredient ids, in the order added
    stations: Object.fromEntries(STATIONS.map((s) => [s.id, null])), // id -> { ingredient, progress, done } | null
    message: '',
    messageUntil: 0,
    muted: false,
    overReason: '',
    flashServe: false,
    servedFlashUntil: 0,
  };
}

export function startShift(world) {
  world.phase = 'playing';
  world.timeLeft = SHIFT_SECONDS;
  world.elapsed = 0;
  world.score = 0;
  world.coins = 0;
  world.dishes = 0;
  world.combo = 0;
  world.bestCombo = 0;
  world.hearts = MAX_HEARTS;
  world.orders = [];
  world.spawnIn = FIRST_ORDER_DELAY;
  world.plate = [];
  for (const key of Object.keys(world.stations)) world.stations[key] = null;
  world.message = 'First orders are coming in — get cooking!';
  world.messageUntil = world.elapsed + 4;
}

function spawnOrder(world) {
  const recipe = pickFrom(world.rng, RECIPES);
  world.orders.push({
    id: world.nextOrderId++,
    recipe,
    timeLeft: ORDER_LIFETIME,
    total: ORDER_LIFETIME,
  });
}

function spawnGap(world) {
  const done = 1 - world.timeLeft / SHIFT_SECONDS;
  return SPAWN_GAP_START + (SPAWN_GAP_END - SPAWN_GAP_START) * done;
}

// Advance the simulation by dt seconds. Returns a list of event names for sound.
export function tick(world, dt) {
  const events = [];
  if (world.phase !== 'playing') return events;
  world.elapsed += dt;
  world.timeLeft = Math.max(0, world.timeLeft - dt);

  // Orders arrive on a schedule that tightens through the shift.
  world.spawnIn -= dt;
  if (world.spawnIn <= 0 && world.orders.length < MAX_ORDERS) {
    spawnOrder(world);
    world.spawnIn = spawnGap(world);
    events.push('order');
  }

  // Order countdowns; an expired order costs a heart and breaks the combo.
  for (let i = world.orders.length - 1; i >= 0; i--) {
    const order = world.orders[i];
    const wasUrgent = order.timeLeft <= 5;
    order.timeLeft -= dt;
    if (!wasUrgent && order.timeLeft <= 5 && order.timeLeft > 0) events.push('urgent');
    if (order.timeLeft <= 0) {
      world.orders.splice(i, 1);
      world.hearts -= 1;
      world.combo = 0;
      world.message = `${order.recipe.name} walked out — a heart lost!`;
      world.messageUntil = world.elapsed + 3;
      events.push('expired');
    }
  }

  // Cooking stations progress; a finished item dings once.
  for (const station of STATIONS) {
    const slot = world.stations[station.id];
    if (slot && !slot.done) {
      slot.progress += dt / ingredientById(slot.ingredient).cookSeconds;
      if (slot.progress >= 1) {
        slot.progress = 1;
        slot.done = true;
        events.push('cooked');
      }
    }
  }

  if (world.hearts <= 0) {
    endShift(world, 'Out of hearts — the dinner crowd left hungry.');
    events.push('over');
  } else if (world.timeLeft <= 0) {
    endShift(world, 'Shift complete!');
    events.push('over');
  }
  return events;
}

function endShift(world, reason) {
  world.phase = 'over';
  world.overReason = reason;
}

function sameMultiset(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const x of a) count.set(x, (count.get(x) ?? 0) + 1);
  for (const x of b) {
    const n = count.get(x) ?? 0;
    if (n === 0) return false;
    count.set(x, n - 1);
  }
  return true;
}

export function plateMatchesOrder(world, order) {
  return sameMultiset(world.plate, order.recipe.items);
}

export function plateMatchesAnyOrder(world) {
  return world.orders.find((o) => plateMatchesOrder(world, o)) ?? null;
}

// Click an ingredient on the counter: ready food goes straight to the plate,
// food that needs heat goes to its station (if the station is free).
// Returns an event name for sound, or '' when nothing happened.
export function addIngredient(world, ingredientId) {
  if (world.phase !== 'playing') return '';
  const ing = ingredientById(ingredientId);
  if (!ing) return '';
  if (world.plate.length >= 4) {
    world.message = 'The plate is full — serve it or clear an item.';
    world.messageUntil = world.elapsed + 2;
    return 'error';
  }
  if (ing.station) {
    const slot = world.stations[ing.station];
    if (slot) {
      world.message = `The ${ing.station} is busy — wait for it to finish.`;
      world.messageUntil = world.elapsed + 2;
      return 'error';
    }
    world.stations[ing.station] = { ingredient: ing.id, progress: 0, done: false };
    return 'place';
  }
  world.plate.push(ing.id);
  return 'pick';
}

// Click a cooking station: collect a finished item onto the plate.
export function collectStation(world, stationId) {
  if (world.phase !== 'playing') return '';
  const slot = world.stations[stationId];
  if (!slot) return '';
  if (!slot.done) {
    world.message = 'Still cooking — give it a moment.';
    world.messageUntil = world.elapsed + 2;
    return 'error';
  }
  if (world.plate.length >= 4) {
    world.message = 'The plate is full — serve it first.';
    world.messageUntil = world.elapsed + 2;
    return 'error';
  }
  world.plate.push(slot.ingredient);
  world.stations[stationId] = null;
  return 'pick';
}

// Click an item on the plate to take it off (trash it).
export function removeFromPlate(world, index) {
  if (world.phase !== 'playing') return '';
  if (index < 0 || index >= world.plate.length) return '';
  world.plate.splice(index, 1);
  return 'trash';
}

// Serve the plate. A matching order pays score + time bonus + combo;
// a wrong plate buzzes and costs a few points.
export function servePlate(world) {
  if (world.phase !== 'playing') return '';
  if (world.plate.length === 0) {
    world.message = 'Nothing on the plate to serve yet.';
    world.messageUntil = world.elapsed + 2;
    return 'error';
  }
  const order = plateMatchesAnyOrder(world);
  if (!order) {
    world.score = Math.max(0, world.score - WRONG_SERVE_PENALTY);
    world.combo = 0;
    world.message = 'That is not what anyone ordered — check the board!';
    world.messageUntil = world.elapsed + 3;
    return 'error';
  }
  const timeBonus = Math.round(order.timeLeft * SCORE_TIME_BONUS_PER_SECOND);
  const comboBonus = world.combo * COMBO_STEP;
  // Speedy serve: plenty of time left on the ticket earns a flat bonus.
  const speedyBonus = order.timeLeft > 20 ? 25 : 0;
  const earned = SCORE_BASE + timeBonus + comboBonus + speedyBonus;
  world.score += earned;
  world.coins += earned;
  world.dishes += 1;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.orders = world.orders.filter((o) => o.id !== order.id);
  world.plate = [];
  world.flashServe = true;
  world.servedFlashUntil = world.elapsed + 0.6;
  world.message = `Served ${order.recipe.name}! +${earned}${speedyBonus ? ' (Speedy +25)' : ''}${world.combo > 1 ? ` (combo x${world.combo})` : ''}`;
  world.messageUntil = world.elapsed + 3;
  return 'serve';
}

export function clearPlate(world) {
  if (world.phase !== 'playing') return '';
  if (world.plate.length === 0) return '';
  world.plate = [];
  return 'trash';
}

export { INGREDIENTS, STATIONS };
