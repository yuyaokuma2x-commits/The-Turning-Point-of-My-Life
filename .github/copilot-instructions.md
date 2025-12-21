<!-- .github/copilot-instructions.md
Purpose: guidance for AI coding agents working on this repository.
Keep short, concrete, and tied to discoverable code patterns.
-->

# Agent instructions for The-Turning-Point-of-My-Life

This is a small static frontend project: a three-file demo (HTML, CSS, JS) that implements an intro "scene" with a timed transition from Scene1 to Scene2 and a placeholder for Scene3.

Key files
- `index.html` — root markup: two scenes (intro + next). The intro uses `.frame`, `.center`, and `.ui-progress` regions. Script `functions.js` is loaded with `defer`.
- `styles.css` — theme tokens, scene layout, and transition rules. Important CSS tokens: `--load-ms` (expected load duration), `--frame-margin`, and the `.is-scene2` modifier that drives most visual changes.
- `functions.js` — DOM-ready logic that toggles `.is-scene2` on the document root after `LOAD_MS` (2600ms) and updates accessibility attributes (`aria-hidden`) for the center texts.

Big picture and design intent
- Single-page, static UI focused on a staged intro animation. The project's behaviour is driven by toggling a single state class `.is-scene2` on `:root` (documentElement). CSS owns layout and transitions; JS only flips the class and adjusts ARIA attributes.
- The `ui-progress__line` uses scaleY transforms to animate a progress line; its final length is computed by CSS when `.is-scene2` is applied.

Developer conventions and patterns
- State model: prefer toggling global modifier classes on `document.documentElement` (e.g., `.is-scene2`) rather than mutating many elements directly.
- Timing: respect `--load-ms`/`LOAD_MS` constants when changing animations to keep CSS/JS in sync.
- Accessibility: `functions.js` updates `aria-hidden` on the two center texts. Mirror any additional scene text updates with correct ARIA attributes.
- Reduced-motion: CSS contains a `prefers-reduced-motion` media query that forces final states and removes transitions — ensure JS doesn't fight that (avoid forcing inline transitions when reduced motion is requested).

Working with this repo (build / run / test)
- No build step — this is static. To preview locally, open `index.html` in a browser or serve via a lightweight server (e.g., `python -m http.server` in the repo root).
- Tests: none present. Keep changes small and visually verifiable in-browser.

Typical tasks and how to approach them
- Add a new scene: add markup in `index.html` (new `.scene`), write CSS to target `.is-sceneX` modifiers, and add minimal JS to toggle the appropriate class and ARIA attributes.
- Change timings: update both `--load-ms` in `styles.css` and `LOAD_MS` in `functions.js` so CSS transitions and JS timers stay in sync.
- Improve accessibility: when adding or removing visible content, update `aria-hidden` and ensure keyboard/touch users can skip or advance scenes. Follow the pattern in `functions.js`.

Examples from the codebase
- State toggle (functions.js): toggles `.is-scene2` after LOAD_MS and flips `aria-hidden` on `.center__text--s1` / `.center__text--s2`.
- CSS modifier (styles.css): `.is-scene2 .center__text--s2 { opacity: 1; }` and `.is-scene2 .ui-progress__line { transform: scaleY(1); }` — use the same modifier pattern for new transitions.

What NOT to change without verifying
- Do not hard-code animation timings in JS only. Keep timing mirrored between `styles.css` and `functions.js`.
- Avoid directly setting inline styles that override the `prefers-reduced-motion` block.

If you need more info
- I can expand this file with commands to run a local server or with visual regression testing suggestions if you want automated checks.

Please review and tell me any missing project-specific details you want added.
