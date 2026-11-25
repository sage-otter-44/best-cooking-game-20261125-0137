# Sizzle Station — a tiny late-night diner game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/sage-otter-44/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/sage-otter-44/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

You run a tiny late-night diner. Orders land on the board, ingredients wait on
the counter, and the grill, the pot and the pan are all yours. Build each dish
exactly as ordered and serve it before its timer runs out — fast serves pay
tips, wrong serves cost points, and three missed orders end the shift.

## How to play

- **Click an ingredient** on the counter (or press keys `1`–`8`).
  Bun, lettuce, tomato, cheese and sauce go straight onto your plate.
  Patty goes to the **Grill** (3s), noodle to the **Pot** (4s), egg to the **Pan** (2.5s).
- **When a station dings READY**, click it to move the cooked item onto your plate.
- **Click an item on the plate** to take it off. `X` clears the whole plate.
- **Match an order ticket exactly** — no extras, no missing bits — then hit
  **SERVE** (or `SPACE`). Tips grow with the time left on the order and with
  your combo. A wrong serve costs 15 points and breaks the combo.
- A 120-second shift, 3 hearts. Orders arrive faster as the night goes on.
  `R` restarts, `M` mutes.

## The game

- `game/index.html` — the page shell; opens in desktop Chrome, plays offline.
- `game/src/config.js` — recipes, ingredients, timings, layout, palette.
- `game/src/world.js` — game state and every rule that changes it.
- `game/src/render.js` — all canvas drawing: kitchen, order board, stations, plate, counter.
- `game/src/input.js` — mouse and keyboard input.
- `game/src/audio.js` — synthesized sound effects (WebAudio, no audio files).
- `game/src/random.js` — seeded RNG for reproducible screenshot states.
- `game/src/shots.js` — deterministic states for `?shot=start|play|serve|end`.
- `game/src/main.js` — bootstrap and game loop.
- `main.ts` — the entry program: copies `game/` and `screenshots/` to `/output`
  and writes `/output/dossier.json` with the kit's `vendor/makefun-game.ts`.

## Play it locally

```sh
python3 -m http.server 8080 --directory game
# open http://localhost:8080
```

Screenshots are real renders of the game's own code, taken in headless Chromium
at 1280×720 (`?shot=start`, `?shot=play`, `?shot=serve`, `?shot=end`).

## License

MIT — see `LICENSE`.
