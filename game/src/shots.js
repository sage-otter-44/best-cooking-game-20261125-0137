// Sizzle Station — deterministic screenshot states for ?shot=.
// One file, one job: set up a fixed, good-looking world per shot name.
// The kitchen, order board, counter, one dish mid-assembly, the timer and a
// plate ready to serve must all read at a glance in these four frames.

import { recipeByName } from './config.js';
import { newWorld, startShift } from './world.js';

function order(world, recipeName, timeLeft) {
  const recipe = recipeByName(recipeName);
  world.orders.push({
    id: world.nextOrderId++,
    recipe,
    timeLeft,
    total: 30,
  });
}

export function worldForShot(shot, seed) {
  const world = newWorld(seed);
  world.phase = 'playing';
  startShift(world);
  world.phase = 'playing';
  switch (shot) {
    case 'start': {
      // Title screen over a fresh kitchen: two orders on the board, full counter.
      world.phase = 'title';
      world.timeLeft = 120;
      world.elapsed = 0;
      world.message = '';
      world.messageUntil = 0;
      order(world, 'Classic Burger', 27);
      order(world, 'Garden Salad', 24);
      break;
    }
    case 'play': {
      // Mid-assembly: bun + lettuce on the plate, patty on the grill at 65%,
      // one order running low, score and a combo already on the board.
      world.timeLeft = 86;
      world.elapsed = 34;
      world.score = 240;
      world.coins = 240;
      world.dishes = 2;
      world.combo = 2;
      world.bestCombo = 2;
      order(world, 'Classic Burger', 9);
      order(world, 'Noodle Bowl', 22);
      order(world, 'Cheese Melt', 26);
      world.plate = ['bun', 'lettuce'];
      world.stations.grill = { ingredient: 'patty', progress: 0.65, done: false };
      world.message = 'Patty on the grill — watch it!';
      world.messageUntil = 9999;
      break;
    }
    case 'serve': {
      // Plate complete and matching the top order: the SERVE button glows.
      world.timeLeft = 74;
      world.elapsed = 46;
      world.score = 340;
      world.coins = 340;
      world.dishes = 3;
      world.combo = 3;
      world.bestCombo = 3;
      order(world, 'Classic Burger', 19);
      order(world, 'Garden Salad', 25);
      world.plate = ['bun', 'patty', 'lettuce'];
      // No toast here: the green match line under the plate carries the message.
      world.message = '';
      world.messageUntil = 0;
      break;
    }
    case 'end': {
      // Shift complete: final score screen over the kitchen.
      world.timeLeft = 0;
      world.elapsed = 120;
      world.score = 1250;
      world.coins = 1250;
      world.dishes = 9;
      world.combo = 0;
      world.bestCombo = 4;
      world.phase = 'over';
      world.overReason = 'Shift complete!';
      order(world, 'Noodle Bowl', 12);
      break;
    }
    default: {
      world.timeLeft = 118;
      order(world, 'Classic Burger', 27);
      break;
    }
  }
  return world;
}
