# Style lock - 808 Audio (/audio)

Established: 2026-10-12. Source: user-specified brief (dark B2B palette, #f0ede8 text, one muted accent, DM Sans + DM Serif Display italic) plus Studio 808 brand pairing. Scope: the /audio tree only (src/pages/audio/audio.css, all under `.a8`). The main site keeps its own tokens in src/index.css.

Direction contract: a quiet, premium voiceover and audiobook post house. Restraint carries it; the one memorable element is the speech-shaped waveform with a slow playhead in the hero.

## Palette
- Background: #0f0f0e (page)
- Surface: #171715 (image wells, future panels)
- Text: #f0ede8 - 16.42:1 on bg
- Muted text: #a8a49c - 7.72:1 on bg
- Accent: #9fb4c6 muted steel blue - 8.97:1 on bg. Interactive states only (hover, focus ring, playhead, played waveform).
- Coral #e8355a: one 1px tally line under the wordmark. Never a fill, never text.
- Primary button: #f0ede8 fill, #0f0f0e label (16.42:1); hover fills accent with #0f0f0e label (8.97:1).
- Dark mode: single mode only.

## Color contract
check_contrast.py --matrix text=#f0ede8 bg=#0f0f0e surface=#171715 primary=#f0ede8 accent=#9fb4c6 border=#3a3936 on-primary=#0f0f0e
- Text-safe: text/bg, text/surface, bg/primary, bg/accent, surface/accent, accent/on-primary, text/border, accent/border
- UI-safe: none
- Decorative: text/accent, bg/border, surface/border, bg/surface. Hairlines (rgba(240,237,232,0.1)) are decorative only.

## Typography
- Headings and UI: DM Sans 600 (wordmark 700), tracking -0.035em at display size, line-height 1.04.
- Subheads, production names, pull quotes: DM Serif Display italic, whole line, never a single accented word.
- Hero h1 clamp(40px, 7.4vw, 84px); subhead clamp(20px, 2.3vw, 26px); body 16px/1.6; captions 14px 500 sentence case (no all-caps eyebrows).

## Shape language
- Radius 4px on buttons and images (the main site uses 12px cards and 999px pills; 808 Audio is squarer on purpose).
- No shadows. 1px hairlines separate regions.

## Density & spacing
- 4px base: s1 4, s2 8, s3 12, s4 16, s6 24, s8 32, s12 48, s16 64, s24 96, s32 128.
- Gutter 20px under 768px, 40px above. Max width 1200px.
- Header 104px (two rows) under 768px, 72px above.

## Motion
- --a8-ease cubic-bezier(0.25, 1, 0.5, 1) (easeOutQuart), calmer than the site's --s8-ease.
- UI 240ms; entrances 1000ms with 140ms stagger; hero photo settles over 2400ms; waveform draws 1800ms, then a 42s linear playhead loop.
- Logo marquee linear, 9s per logo (min 48s), pauses on hover and from its own button.
- Reduced motion: no movement; waveform rests at 38% played, logos become a static wrapped grid.
- No per-section scroll reveals.

## Assets
- No photography or illustration sourced in this pass: hero background, logos and talent photos come from Sanity. The dev fixture (/audio?fixture) uses a local studio photo and generated SVG placeholders.

## Showreel player (added 2026-10-12, PR feat/808-audio-player)
- Waveform: wavesurfer bars 2px, gap 2px, radius 1; wave #4a4946 (opaque: progress is painted source-in over the bars, so a translucent wave colour makes the progress translucent too), progress #9fb4c6, no cursor.
- Play buttons: solid #f0ede8 squares (52px panel, 40px mini) with #0f0f0e glyphs; hover fills accent.
- Playlist rows: hairline-separated, active row on surface with a 2px accent bar; type tags are 1px-outlined 4px chips in sentence case.
- Motion: panel fades in on clip change (320ms easeOutQuart, 6px rise); mini-player slides up (280ms); three-bar playing indicator loops (760-1040ms ease-in-out, alternate). Reduced motion: opacity only, bars still.
