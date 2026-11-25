// Sizzle Station — all canvas drawing: kitchen, order board, stations, plate, counter.
// One file, one job: turn a world state into a readable picture. No rules live here.

import { LAYOUT, PALETTE, INGREDIENTS, STATIONS, ingredientById, VIEW_W, VIEW_H } from './config.js';
import { plateMatchesAnyOrder } from './world.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(-8, -3, -4, -9, 0, -4);
  ctx.bezierCurveTo(4, -9, 8, -3, 0, 5);
  ctx.closePath();
  ctx.fillStyle = filled ? '#ff4d5e' : '#4a3226';
  ctx.fill();
  ctx.restore();
}

// One little vector drawing per ingredient — food that looks worth serving.
export function drawFood(ctx, id, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  switch (id) {
    case 'bun': {
      ctx.fillStyle = '#e8b06a';
      ctx.beginPath();
      ctx.arc(0, 2, r, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#c98d4b';
      ctx.fillRect(-r, 2, r * 2, r * 0.35);
      ctx.fillStyle = '#fff2cf';
      for (const [sx, sy] of [[-0.4, -0.45], [0.1, -0.6], [0.5, -0.35]]) {
        ctx.beginPath();
        ctx.ellipse(sx * r, sy * r, r * 0.12, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'patty': {
      ctx.fillStyle = '#7a4a2b';
      rr(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.5);
      ctx.fill();
      ctx.strokeStyle = '#5d3419';
      ctx.lineWidth = r * 0.12;
      for (const dx of [-0.45, 0, 0.45]) {
        ctx.beginPath();
        ctx.moveTo(dx * r, -r * 0.4);
        ctx.lineTo(dx * r, r * 0.4);
        ctx.stroke();
      }
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = '#7dc24a';
      for (const [dx, dy, s] of [[-0.45, 0.1, 0.55], [0, -0.25, 0.65], [0.45, 0.15, 0.5]]) {
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, s * r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#5da338';
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, r * 0.1);
      ctx.quadraticCurveTo(0, -r * 0.5, r * 0.7, r * 0.15);
      ctx.stroke();
      break;
    }
    case 'tomato': {
      ctx.fillStyle = '#e2483d';
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8a7a';
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.25, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a9e3f';
      ctx.fillRect(-r * 0.1, -r * 1.05, r * 0.2, r * 0.3);
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#f7c948';
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.6);
      ctx.lineTo(r, r * 0.6);
      ctx.lineTo(0, -r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e0a92e';
      for (const [hx, hy] of [[-0.25, 0.15], [0.3, 0.3], [0.05, -0.3]]) {
        ctx.beginPath();
        ctx.arc(hx * r, hy * r, r * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'noodle': {
      ctx.strokeStyle = '#f2d06b';
      ctx.lineWidth = r * 0.22;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const y0 = (-0.5 + i * 0.45) * r;
        ctx.beginPath();
        ctx.moveTo(-r * 0.8, y0);
        ctx.bezierCurveTo(-r * 0.3, y0 - r * 0.4, r * 0.3, y0 + r * 0.4, r * 0.8, y0);
        ctx.stroke();
      }
      break;
    }
    case 'sauce': {
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.moveTo(-r * 0.35, -r * 0.9);
      ctx.lineTo(r * 0.35, -r * 0.9);
      ctx.lineTo(r * 0.55, r * 0.7);
      ctx.lineTo(-r * 0.55, r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#8e2318';
      ctx.fillRect(-r * 0.45, -r * 1.05, r * 0.9, r * 0.25);
      ctx.fillStyle = '#ff6b5e';
      ctx.beginPath();
      ctx.arc(0, r * 0.15, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'egg': {
      ctx.fillStyle = '#fdf3d0';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.95, r * 0.75, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff9d1a';
      ctx.beginPath();
      ctx.arc(r * 0.1, 0, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffc95e';
      ctx.beginPath();
      ctx.arc(r * 0.02, -r * 0.08, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: break;
  }
  ctx.restore();
}

function drawKitchenBackground(ctx) {
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Tile band across the top of the kitchen.
  ctx.fillStyle = PALETTE.wallTile;
  for (let x = 0; x < VIEW_W; x += 64) {
    ctx.fillRect(x, 68, 62, 10);
  }
  ctx.fillStyle = '#3a2a1c';
  ctx.fillRect(0, 78, VIEW_W, 4);
  // Warm floor strip behind the counter.
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 528, VIEW_W, 16);
}

function drawHud(ctx, world) {
  const h = LAYOUT.hud;
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(h.x, h.y, h.w, h.h);
  text(ctx, '🍳 SIZZLE STATION', 24, 36, 26, PALETTE.accent);
  const lowTime = world.timeLeft <= 20 && world.phase === 'playing';
  text(ctx, `⏱ ${formatTime(world.timeLeft)}`, 330, 36, 30, lowTime ? PALETTE.bad : PALETTE.text);
  text(ctx, `SCORE ${world.score}`, 520, 36, 24, PALETTE.text);
  text(ctx, `🪙 ${world.coins}`, 700, 36, 24, PALETTE.gold);
  text(ctx, `DISHES ${world.dishes}`, 830, 36, 24, PALETTE.text);
  for (let i = 0; i < 3; i++) drawHeart(ctx, 1000 + i * 34, 36, 26, i < world.hearts);
  text(ctx, world.combo > 1 ? `COMBO x${world.combo}` : '', 1120, 36, 22, PALETTE.good);
}

function drawOrderTicket(ctx, order, x, y, w, h) {
  const urgent = order.timeLeft <= 8;
  ctx.fillStyle = PALETTE.ticket;
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = urgent ? PALETTE.bad : PALETTE.ticketEdge;
  ctx.lineWidth = urgent ? 3 : 2;
  ctx.stroke();
  text(ctx, `#${order.id}  ${order.recipe.name}`, x + 14, y + 22, 19, PALETTE.boardInk);
  // Recipe icons in a row.
  let ix = x + 26;
  for (const item of order.recipe.items) {
    drawFood(ctx, item, ix, y + 62, 20);
    ix += 52;
  }
  // Countdown bar (leaves room for the seconds label at the right).
  const frac = Math.max(0, order.timeLeft / order.total);
  const barW = w - 28 - 46;
  ctx.fillStyle = '#e8dcc0';
  rr(ctx, x + 14, y + h - 26, barW, 12, 6);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#58c96b' : frac > 0.25 ? '#f7c948' : '#e2483d';
  if (frac > 0) {
    rr(ctx, x + 14, y + h - 26, barW * frac, 12, 6);
    ctx.fill();
  }
  text(ctx, `${Math.ceil(order.timeLeft)}s`, x + w - 16, y + h - 20, 15, PALETTE.boardInk, 'bold', 'right');
  if (urgent) text(ctx, 'HURRY!', x + w - 16, y + 22, 14, PALETTE.bad, 'bold', 'right');
}

function drawOrderBoard(ctx, world) {
  const b = LAYOUT.board;
  ctx.fillStyle = PALETTE.boardPaper;
  rr(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fill();
  ctx.strokeStyle = '#d9c48f';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '📋 ORDER BOARD', b.x + 16, b.y + 26, 22, PALETTE.boardInk);
  if (world.orders.length === 0) {
    text(ctx, 'No orders yet —', b.x + b.w / 2, b.y + 120, 18, '#8a7a5c', 'bold', 'center');
    text(ctx, 'the lunch rush is coming!', b.x + b.w / 2, b.y + 148, 18, '#8a7a5c', 'bold', 'center');
  }
  world.orders.forEach((order, i) => {
    drawOrderTicket(ctx, order, b.x + 14, b.y + 52 + i * 128, b.w - 28, 116);
  });
  text(ctx, 'Serve the exact dish — no extras, no missing bits.', b.x + 16, b.y + b.h - 14, 14, '#8a7a5c');
}

function drawStation(ctx, station, slot, now) {
  const { x, y, w, h } = station;
  const done = slot?.done;
  ctx.fillStyle = '#3d2b1e';
  rr(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = done ? PALETTE.good : '#5a4230';
  ctx.lineWidth = done ? 3 : 2;
  ctx.stroke();
  text(ctx, station.name.toUpperCase(), x + w / 2, y + 20, 17, PALETTE.dim, 'bold', 'center');
  if (!slot) {
    text(ctx, 'empty', x + w / 2, y + 68, 16, '#7a6248', 'bold', 'center');
    return;
  }
  const ing = ingredientById(slot.ingredient);
  // Cooker body.
  if (station.id === 'grill') {
    ctx.fillStyle = '#1a1a1a';
    rr(ctx, x + 18, y + 40, w - 36, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 18 + i * ((w - 36) / 4), y + 44);
      ctx.lineTo(x + 18 + i * ((w - 36) / 4), y + 80);
      ctx.stroke();
    }
  } else if (station.id === 'pot') {
    ctx.fillStyle = '#4a4a55';
    rr(ctx, x + 22, y + 40, w - 44, 46, 8);
    ctx.fill();
    ctx.fillStyle = '#e8d9a0';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 44, (w - 44) / 2 - 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#33333a';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 62, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#55555e';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 62, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  drawFood(ctx, slot.ingredient, x + w / 2, y + 62, 18);
  if (done) {
    const pulse = 0.6 + 0.4 * Math.sin(now * 6);
    ctx.fillStyle = `rgba(88, 201, 107, ${0.25 + 0.35 * pulse})`;
    rr(ctx, x + 4, y + 4, w - 8, h - 8, 10);
    ctx.fill();
    text(ctx, 'READY!', x + w / 2, y + h - 14, 18, PALETTE.good, 'bold', 'center');
  } else {
    // Progress ring around the cooking item.
    ctx.strokeStyle = '#ffb347';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 62, 30, -Math.PI / 2, -Math.PI / 2 + slot.progress * Math.PI * 2);
    ctx.stroke();
    text(ctx, `${ing.name} ${Math.round(slot.progress * 100)}%`, x + w / 2, y + h - 14, 14, PALETTE.text, 'bold', 'center');
  }
}

function drawPlateArea(ctx, world) {
  const p = LAYOUT.plate;
  ctx.fillStyle = '#3d2b1e';
  rr(ctx, p.x, p.y, p.w, p.h, 14);
  ctx.fill();
  text(ctx, 'YOUR PLATE  —  click an item to take it off', p.x + 16, p.y + 24, 16, PALETTE.dim);
  // The plate itself.
  const cx = p.x + p.w / 2;
  const cy = p.y + 150;
  ctx.fillStyle = PALETTE.plateRim;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 190, 78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.plate;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 168, 64, 0, 0, Math.PI * 2);
  ctx.fill();
  if (world.plate.length === 0) {
    text(ctx, 'Empty — pick ingredients below', cx, cy, 18, '#a89a80', 'bold', 'center');
  } else {
    const n = world.plate.length;
    world.plate.forEach((item, i) => {
      const px = cx + (i - (n - 1) / 2) * 74;
      drawFood(ctx, item, px, cy - 6, 30);
    });
  }
  const match = plateMatchesAnyOrder(world);
  if (match && world.plate.length > 0) {
    text(ctx, `✓ matches #${match.id} ${match.recipe.name} — SERVE IT!`, cx, p.y + p.h - 22, 18, PALETTE.good, 'bold', 'center');
  }
}

function drawServeButton(ctx, world, now) {
  const s = LAYOUT.serve;
  const ready = world.plate.length > 0 && plateMatchesAnyOrder(world) !== null;
  const glow = ready ? 0.5 + 0.5 * Math.sin(now * 5) : 0;
  ctx.fillStyle = ready ? `rgba(255, 140, 26, ${0.25 + 0.3 * glow})` : 'rgba(0,0,0,0)';
  rr(ctx, s.x - 6, s.y - 6, s.w + 12, s.h + 12, 18);
  ctx.fill();
  ctx.fillStyle = ready ? PALETTE.accent : '#5a4230';
  rr(ctx, s.x, s.y, s.w, s.h, 16);
  ctx.fill();
  ctx.strokeStyle = ready ? '#ffd9a0' : '#7a6248';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, '🍽  SERVE', s.x + s.w / 2, s.y + s.h / 2 - 8, 34, '#fff', 'bold', 'center');
  text(ctx, ready ? 'dish matches an order!' : 'or press SPACE', s.x + s.w / 2, s.y + s.h / 2 + 24, 15, ready ? '#fff' : '#c9b18f', 'bold', 'center');
}

function drawInfoPanel(ctx, world) {
  const b = LAYOUT.info;
  ctx.fillStyle = '#2e2018';
  rr(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fill();
  ctx.strokeStyle = '#4a3524';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'HOW TO PLAY', b.x + 16, b.y + 26, 19, PALETTE.accent);
  const lines = [
    '1. Click an ingredient on the counter.',
    '   Patty → Grill · Noodle → Pot · Egg → Pan.',
    '2. When it dings READY, click the station',
    '   to move it onto your plate.',
    '3. Match an order ticket exactly,',
    '   then SERVE before its timer runs out.',
    '4. Fast serves pay tips — over 20s left',
    '   earns a Speedy +25. Wrong serves',
    '   cost points. 3 missed orders ends it.',
  ];
  lines.forEach((line, i) => text(ctx, line, b.x + 16, b.y + 58 + i * 26, 16, PALETTE.text, 'normal'));
  text(ctx, `Best combo: x${world.bestCombo}`, b.x + 16, b.y + b.h - 24, 16, PALETTE.gold);
}

function drawCounter(ctx, world) {
  const c = LAYOUT.counter;
  ctx.fillStyle = PALETTE.counterTop;
  rr(ctx, c.x, c.y, c.w, c.h, 14);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterFace;
  ctx.fillRect(c.x + 8, c.y + c.h - 26, c.w - 16, 18);
  text(ctx, 'COUNTER — click an ingredient (or press 1–8)', c.x + 16, c.y + 22, 17, '#fff2d8');
  const slotW = (c.w - 32) / INGREDIENTS.length;
  INGREDIENTS.forEach((ing, i) => {
    const x = c.x + 16 + i * slotW;
    const y = c.y + 38;
    const w = slotW - 10;
    const h = 100;
    ctx.fillStyle = '#f7ead2';
    rr(ctx, x, y, w, h, 10);
    ctx.fill();
    drawFood(ctx, ing.id, x + w / 2, y + 34, 26);
    text(ctx, ing.name, x + w / 2, y + 70, 16, PALETTE.boardInk, 'bold', 'center');
    const hint = ing.station ? `→ ${ing.station}` : 'ready';
    text(ctx, `[${ing.key}] ${hint}`, x + w / 2, y + 90, 13, '#8a7a5c', 'bold', 'center');
  });
}

function drawMessage(ctx, world) {
  if (!world.message || world.elapsed > world.messageUntil) return;
  const msg = world.message;
  ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
  const w = ctx.measureText(msg).width + 36;
  const x = (VIEW_W - w) / 2;
  const y = 470;
  ctx.fillStyle = 'rgba(23, 16, 11, 0.92)';
  rr(ctx, x, y, w, 40, 20);
  ctx.fill();
  ctx.strokeStyle = PALETTE.accent;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, msg, VIEW_W / 2, y + 21, 20, PALETTE.text, 'bold', 'center');
}

function drawTitleOverlay(ctx, world) {
  ctx.fillStyle = 'rgba(20, 12, 7, 0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawFood(ctx, 'egg', VIEW_W / 2, 150, 58);
  text(ctx, 'SIZZLE STATION', VIEW_W / 2, 250, 64, PALETTE.accent, 'bold', 'center');
  text(ctx, 'A tiny late-night diner. A very hungry crowd. One pair of hands.', VIEW_W / 2, 310, 22, PALETTE.text, 'normal', 'center');
  text(ctx, 'Build every dish exactly as ordered — and beat the clock.', VIEW_W / 2, 344, 22, PALETTE.text, 'normal', 'center');
  text(ctx, 'CLICK TO START YOUR SHIFT  ·  120 seconds  ·  3 hearts', VIEW_W / 2, 420, 22, PALETTE.gold, 'bold', 'center');
  text(ctx, 'Mouse or keys 1–8 · SPACE serves · R restarts · M mutes', VIEW_W / 2, 462, 17, PALETTE.dim, 'normal', 'center');
}

function drawGameOverOverlay(ctx, world) {
  ctx.fillStyle = 'rgba(20, 12, 7, 0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, world.overReason, VIEW_W / 2, 200, 34, PALETTE.accent, 'bold', 'center');
  text(ctx, `FINAL SCORE  ${world.score}`, VIEW_W / 2, 280, 44, '#fff', 'bold', 'center');
  text(ctx, `Dishes served: ${world.dishes}      Best combo: x${world.bestCombo}      Coins earned: ${world.coins}`, VIEW_W / 2, 340, 22, PALETTE.text, 'normal', 'center');
  const verdict = world.score >= 1200 ? 'Head-chef material. The crowd wants an encore.'
    : world.score >= 700 ? 'Solid shift — the regulars are coming back.'
    : 'A rough night in the kitchen. The grill believes in you.';
  text(ctx, verdict, VIEW_W / 2, 390, 20, PALETTE.gold, 'normal', 'center');
  text(ctx, 'Press R or CLICK to cook again', VIEW_W / 2, 460, 22, PALETTE.text, 'bold', 'center');
}

export function renderWorld(ctx, world, now) {
  drawKitchenBackground(ctx);
  drawHud(ctx, world);
  drawOrderBoard(ctx, world);
  for (const station of STATIONS) drawStation(ctx, station, world.stations[station.id], now);
  drawPlateArea(ctx, world);
  drawServeButton(ctx, world, now);
  drawInfoPanel(ctx, world);
  drawCounter(ctx, world);
  drawMessage(ctx, world);
  if (world.phase === 'title') drawTitleOverlay(ctx, world);
  if (world.phase === 'over') drawGameOverOverlay(ctx, world);
}
