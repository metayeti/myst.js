## 0.9.4 (?)
- `BUGFIX` Fixed `render.circle` and `render.arc` so they don't continue drawing from old paths.
- `API CHANGE` Renamed `render.polygon` to `render.polygonFill`.
- `FEATURE` Added `render.polygon` which renders polygon outlines only.
- `API CHANGE` Changed `render.arc` to accept degrees instead of radians.
- `FEATURE` Added `render.arcFill`.
- `FEATURE` Added `myst.pick` which works the same as `myst.choose` except it also removes the selected item from the array.
- `FEATURE` Added `radius` parameter to `render.rect` and `render.rectFill` that can be used to render rounded borders on rectangles.

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
