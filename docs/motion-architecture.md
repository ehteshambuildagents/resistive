# Cinematic film
One CSS sticky stage owns the viewport. One GSAP master timeline and ScrollTrigger scrub the complete story. One Lenis instance uses the GSAP ticker, autoRaf false, lerp .18, wheelMultiplier 1, scrub .22. Desktop travel is 780 viewport heights in percent units (7.8 viewport lengths); mobile travel is 9.2 viewport lengths. No React scroll updates, snap points, nested pins or CSS smooth scrolling.

Narrative ranges: premise 0–8; history 8–17; evidence 17–29; insight 29–37; hypothesis and territory 37–46; decision pause 46–50; creation reveal 50–57; brief and script 57–66; storyboard 66–73; QA 73–79; edit 79–84; finished ad 84–91; result 91–97; next experiment 97–100. These are sub-beats on one continuous timeline, not pinned sections.

Five persistent 9:16 frames carry consistent unbranded product photographs into the storyboard, QA and edit. Twelve additional history thumbnails are decorative examples. Every narrative leaves completely before the next enters; inert and aria-hidden track semantic ownership. The waitlist is in normal flow after the stage, using the existing API.

Reduced motion presents readable narrative flow and a manually playable video. Mobile lays evidence below the narrative, uses a two-row storyboard and simpler movement. The optional ?hud diagnostic and window.__resistiveMotion are development-only.

Sample imagery generated using the built-in image-generation tool. Full prompt and provenance: public/demo/README.md. The 15-second video is an illustrative motion edit of the same stills, with local synthesized narration and captions, not an actual client campaign or live Resistive output.

Verification: scripts/verify-film.mjs uses Playwright with local Chrome to capture desktop/mobile keyframes, check headline exclusivity forward and backward, validate text bounds and persistent DOM identity, and inspect reduced-motion flow. Runtime evidence is in docs/verification/results.json. These measurements do not establish universal device frame rate.
