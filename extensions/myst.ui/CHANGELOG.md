## 0.3.0 (?)
- `BUGFIX` Shapes can now have a size of zero.
- `FEATURE` Added `Label` and `BMPLabel` controls.

## 0.2.4 (May 26, 2023)
- `FEATURE` Upgrade to ES6 standard.

## 0.2.3 (June 25, 2022)
- `FEATURE` Added `TileImage` control.

## 0.2.2 (June 25, 2022)
- `FEATURE` Added `applyToGroup` and `delayedAction` functions.
- `FEATURE` `Image` can now be instantiated without providing `width` and `height` parameters - texture size will be used instead.
- `BUGFIX` Fix `TileButton` not initializing correctly with a given normal tile.
- `BUGFIX` Fix `tween` calling `options.onDone` multiple times for a single tween.
- `FEATURE` Add `delay` option to `tween`.
- `FEATURE` `AbstractButton` now returns coordinates in events.

## 0.2.1 (June 23, 2022)
- `BUGFIX` Make `centerX` and `centerY` methods work correctly.
