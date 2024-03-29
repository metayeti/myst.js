## 0.9.8 (June 19, 2023)
- Replace old clunky build scripts with yabs.js.

## 0.9.7 (May 26, 2023)
- `FEATURE` Upgrade to ES6 standard.

## 0.9.6 (June 25, 2022)
- `FEATURE` Added an `index` parameter to `iter` function's callback.

## 0.9.5 (June 21, 2022)
- `FEATURE` Added `sector` and `sectorFill` functions to `Render`.
- `BUGFIX` Fixed the "bounce" of the `myst.ease.backIn` easing function to be closer to that of `myst.ease.backOut`.
- `FEATURE` Added `diceRoll` function.
- `BUGFIX` Fixed `getRandomInt` function to always return integer.

## 0.9.4 (February 7, 2021)
- `BUGFIX` Fixed `Render.circle` and `Render.arc` so they don't continue drawing from old paths.
- `API CHANGE` Renamed `Render.polygon` to `Render.polygonFill`.
- `FEATURE` Added `Render.polygon` which renders polygon outlines only.
- `API CHANGE` Changed `Render.arc` to accept degrees instead of radians.
- `FEATURE` Added `Render.arcFill`.
- `FEATURE` Added `myst.pick` which works the same as `myst.choose` except it also removes the selected item from the array.
- `FEATURE` Added `radius` parameter to `Render.rect` and `Render.rectFill` that can be used to render rectangles with rounded borders.
- `BUGFIX` Optimized `Math.pow` calls to multiplication calls.

## 0.9.3 (February 6, 2021)
- `BUGFIX` Fix `myst.iter` to allow iterating over members named `hasOwnProperty`.
- `FEATURE` Added `myst.rotatePoint` function.
- `FEATURE` Added `myst.applyToGroup` function.

## 0.9.2 (January 25, 2021)
- Increased frametime for Tween for smoother animations on slower browsers or machines.
- `BUGFIX` Remove obsolete build flag.

## 0.9.1 (December 28, 2020)
- `FEATURE` Added `resetf` to `Tween` for cases where a tween.finish() would interrupt a nested tween which would cause only the currently active tween to finalize, potentially resulting in animation stuck in mid-state. A reset function can now be used to restore the animation to the original state, or finalize it manually.

## 0.9.0 (December 20, 2020)
- Initial commit
