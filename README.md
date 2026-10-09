# SIDE A — For the record

A complete redesign of the original coffee concept as a fictional listening bar. Palette: burnt orange `#d5360c`, warm ivory `#e6d5bd`, soft black `#101010`.

## Run

`npm run dev` serves the static site at http://127.0.0.1:4173. `npm run check` checks the JavaScript syntax. Deploy `dist` to a static host; no build step or API keys are required.

## The scrolling experience

1. Reflective, rotating 3D vinyl with microgrooves and a custom printed label.
2. Turntable assembly: plinth, feet, strobe platter, record, spindle, tonearm, cartridge, and controls.
3. Exploded speaker components: cabinet, woofer, tweeter, magnet, and copper coil.
4. Paired speakers and concentric waves in 3D space.
5. Scroll-expanded circular room reveal with a camera-like push through custom architectural imagery.
6. Word-by-word manifesto, interactive graphic record sleeves, and three optional synthesized sound studies.

All 3D geometry and textures are created in `dist/app.js` using locally vendored Three.js. The site defaults to muted. The audio is original procedural synthesis, not commercial recordings. Native dialogs handle the full-screen navigation and session picker. Ambient motion can be paused, reduced-motion preferences are honored, and WebGL failure shows a graphic fallback. No bookings, payments, mailing lists, or personal data collection.

## Verification

Checked in the browser at desktop and mobile widths. Verified all four 3D states, mobile model framing, chapter controls, navigation dialog, record selection, sound on/off state, session picker, image loading, and absence of horizontal overflow and console errors. Physical-device GPU performance has not been benchmarked.

Screenshots are in `qa/side-a-*.jpg`. The custom room photograph was generated with the built-in image-generation tool. Source and prompt details are in `ART-DIRECTION.md`. Original Ember files are preserved in Git history and `art-originals/ember-v1.*`.

The same Sites project and private access are preserved. Its existing URL retains the original coffee slug.
