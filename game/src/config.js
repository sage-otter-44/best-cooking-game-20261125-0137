// Sizzle Station — configuration: recipes, ingredients, timings, layout, palette.
// One file, one job: every tunable number of the game lives here.

export const VIEW_W = 1280;
export const VIEW_H = 720;

export const SHIFT_SECONDS = 120;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 3;
export const ORDER_LIFETIME = 30;
export const FIRST_ORDER_DELAY = 2.0;

// Spawn gap shrinks as the shift goes on: early orders are gentle, late ones rush.
export const SPAWN_GAP_START = 13;
export const SPAWN_GAP_END = 7;

export const SCORE_BASE = 100;
export const SCORE_TIME_BONUS_PER_SECOND = 2;
export const COMBO_STEP = 25;
export const WRONG_SERVE_PENALTY = 15;

// Cooking stations: each ingredient that needs heat names its station and cook time.
export const INGREDIENTS = [
  { id: 'bun',     name: 'Bun',     key: '1', station: null,    cookSeconds: 0,   color: '#e8b06a' },
  { id: 'patty',   name: 'Patty',   key: '2', station: 'grill', cookSeconds: 3.0, color: '#7a4a2b' },
  { id: 'lettuce', name: 'Lettuce', key: '3', station: null,    cookSeconds: 0,   color: '#7dc24a' },
  { id: 'tomato',  name: 'Tomato',  key: '4', station: null,    cookSeconds: 0,   color: '#e2483d' },
  { id: 'cheese',  name: 'Cheese',  key: '5', station: null,    cookSeconds: 0,   color: '#f7c948' },
  { id: 'noodle',  name: 'Noodle',  key: '6', station: 'pot',   cookSeconds: 4.0, color: '#f2d06b' },
  { id: 'sauce',   name: 'Sauce',   key: '7', station: null,    cookSeconds: 0,   color: '#c0392b' },
  { id: 'egg',     name: 'Egg',     key: '8', station: 'pan',   cookSeconds: 2.5, color: '#fdf3d0' },
];

export const STATIONS = [
  { id: 'grill', name: 'Grill', x: 400, y: 100, w: 150, h: 120 },
  { id: 'pot',   name: 'Pot',   x: 565, y: 100, w: 150, h: 120 },
  { id: 'pan',   name: 'Pan',   x: 730, y: 100, w: 150, h: 120 },
];

// Recipes: an order is a dish name plus the exact multiset of ingredients it needs.
export const RECIPES = [
  { name: 'Classic Burger', items: ['bun', 'patty', 'lettuce'] },
  { name: 'Cheese Melt',    items: ['bun', 'patty', 'cheese'] },
  { name: 'Garden Salad',   items: ['lettuce', 'tomato', 'egg'] },
  { name: 'Noodle Bowl',    items: ['noodle', 'sauce', 'egg'] },
  { name: 'Veggie Stack',   items: ['bun', 'lettuce', 'tomato', 'cheese'] },
  { name: 'Breakfast Plate', items: ['egg', 'patty', 'tomato'] },
];

export function ingredientById(id) {
  return INGREDIENTS.find((ing) => ing.id === id);
}

export function recipeByName(name) {
  return RECIPES.find((r) => r.name === name);
}

// Layout rectangles (canvas space, 1280x720).
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 68 },
  board: { x: 20, y: 84, w: 340, h: 440 },
  plate: { x: 400, y: 244, w: 480, h: 280 },
  serve: { x: 920, y: 96, w: 340, h: 96 },
  info: { x: 920, y: 208, w: 340, h: 316 },
  counter: { x: 20, y: 544, w: 1240, h: 156 },
};

export const PALETTE = {
  wall: '#241812',
  wallTile: '#2e2018',
  floor: '#1c130e',
  counterTop: '#8a5a33',
  counterFace: '#6b4423',
  boardPaper: '#fff6df',
  boardInk: '#3a2a1a',
  ticket: '#fffdf4',
  ticketEdge: '#e5d3a8',
  plate: '#f4f1e6',
  plateRim: '#d8d2bd',
  hud: '#17100b',
  accent: '#ff8c1a',
  accentHot: '#ff5a2a',
  good: '#58c96b',
  bad: '#e2483d',
  gold: '#f7c948',
  text: '#f7ead2',
  dim: '#b99f83',
};
