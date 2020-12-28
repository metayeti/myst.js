## 0.9.1 (December 28, 2020)
- `FEATURE` Added `resetf` to `Tween` for cases where a tween.finish() would interrupt a nested tween which would cause only the currently active tween to finalize, potentially resulting in animation stuck in mid-state. A reset function can now be used to restore the animation to the original state, or finalize it manually.

## 0.9.0 (December 20, 2020)
- Initial commit
