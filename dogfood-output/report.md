# Dogfood Report: Clock

| Field | Value |
|-------|-------|
| **Date** | 2026-04-27 |
| **App URL** | http://127.0.0.1:6173/clock/ |
| **Session** | clock-slider-dogfood |
| **Scope** | Tweakpane slider interaction |

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 1 |
| Medium | 0 |
| Low | 0 |
| **Total** | **1** |

## Issues

### ISSUE-001: Tweakpane sliders reset during drag

- **Severity:** high
- **Category:** Functional / UX
- **Status:** Reproduced
- **Repro Video:** N/A
- **Evidence:** `dogfood-output/screenshots/initial.png`; Playwright drag probe showed `Diameter (mm)` values `["197", "200", "200", ...]` during a single continuous pointer drag.

#### Repro Steps
1. Open `http://127.0.0.1:6173/clock/`.
2. Locate the expanded `3D Print Export` controls.
3. Press and hold the `Diameter (mm)` slider, then drag horizontally toward the right.
4. Observe that the value changes once and then snaps back to `200`, so the slider cannot be adjusted smoothly by dragging.

#### Expected
The value should continue changing throughout the drag, and the pointer interaction should not be interrupted.

#### Actual
The control appears to re-render/reset during the pointer drag, causing the active slider interaction to be lost.
