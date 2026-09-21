import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/** One clock and one viewport owner. Every state can be scrubbed in either direction. */
export function createFilmMotion(root: HTMLElement, sequence: HTMLElement) {
  const media = gsap.matchMedia();
  media.add({ mobile: "(max-width: 700px)", desktop: "(min-width: 701px)", reduced: "(prefers-reduced-motion: reduce)" }, context => {
    const { mobile, reduced } = context.conditions!;
    const TOTAL = 150;
    const select = gsap.utils.selector(root);
    const stage = root.querySelector<HTMLElement>(".film-stage")!;
    const narratives = Array.from(root.querySelectorAll<HTMLElement>(".narrative"));
    const video = root.querySelector<HTMLVideoElement>("video")!;
    root.dataset.motion = reduced ? "reduced" : "running";
    if (reduced) {
      narratives.forEach(node => { node.inert = false; node.removeAttribute("aria-hidden"); });
      video.controls = true;
      return () => { video.pause(); video.controls = false; delete root.dataset.motion; };
    }
    const lenis = new Lenis({ lerp: .2, smoothWheel: true, wheelMultiplier: 1.25, touchMultiplier: 1.15, autoRaf: false });
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    let w = 0, h = 0, sw = 0, sh = 0, fw = 0, fh = 0, aw = 0, ah = 0;
    // A phone composes each scene under the copy it has to clear, so these are
    // measured from the laid-out headlines rather than guessed as fractions.
    const GAP = 6;
    let heroFloor = 0, wallTop = 0, wallLeft = 0, boardTop = 0, stripTop = 0, finalTop = 0, shelfTop = 0, shelfW = 0;
    const bottomOf = (selector: string) => { const el = root.querySelector<HTMLElement>(selector)!; return el.offsetTop + el.offsetHeight; };
    const measure = () => {
      w = stage.clientWidth; h = stage.clientHeight;
      sw = mobile ? Math.min(w * .37, h * .22) : Math.min(w * .18, h * .31);
      sh = sw * 16 / 9;
      if (mobile) {
        heroFloor = bottomOf(".n-premise") + h * .03;
        // the library wall: a centred 4 × 4 grid filling what the headline leaves
        wallTop = Math.max(h * .3, bottomOf(".n-history") + h * .035);
        fw = Math.min((w * .88 - 3 * GAP) / 4, (h * .96 - wallTop - 3 * GAP) / 4 * 9 / 16);
        wallLeft = (w - 4 * fw - 3 * GAP) / 2;
        boardTop = Math.max(h * .36, bottomOf(".n-shots") + h * .035);
        // the edit strip spans the text column; the tracks follow it
        stripTop = Math.max(h * .36, bottomOf(".n-edit") + h * .03);
        stage.style.setProperty("--strip-end", `${stripTop + (w * .88 - 4 * GAP) / 5 * 16 / 9}px`);
        finalTop = bottomOf(".n-finished") + h * .025;
        stage.style.setProperty("--final-y", `${finalTop}px`);
        // the returning library: six across, three rows, above the model note
        shelfTop = Math.max(h * .3, bottomOf(".n-model") + h * .035);
        shelfW = Math.min((w * .88 - 5 * GAP) / 6, h * .1 * 9 / 16);
        stage.style.setProperty("--shelf-end", `${shelfTop + 3 * shelfW * 16 / 9 + 2 * GAP}px`);
      } else fw = Math.min(w * .068, h * .108);
      fh = fw * 16 / 9;
      stage.style.setProperty("--shot-w", `${sw}px`); stage.style.setProperty("--shot-h", `${sh}px`);
      stage.style.setProperty("--frame-w", `${fw}px`); stage.style.setProperty("--frame-h", `${fh}px`);
      stage.style.setProperty("--run-h", `${fh * (mobile ? .30 : .30)}px`);
      // Act 3 subject: tall enough to be the dominant object on the stage,
      // capped so it never crowds the annotation column beside it.
      aw = mobile ? w * .46 : Math.min(h * .70 * 9 / 16, w * .26);
      ah = aw * 16 / 9;
      stage.style.setProperty("--ad-w", `${aw}px`);
      stage.style.setProperty("--ad-h", `${ah}px`);
      placeMarks();
    };
    // A marker label sits on whichever side of its marker has room, never
    // closer than SAFE to the track edge, so any timing or copy length holds.
    const SAFE = 18;
    const placeMarks = () => {
      for (const track of Array.from(root.querySelectorAll<HTMLElement>(".cmp-track, .bet-track"))) {
        const label = track.querySelector("b");
        if (!label) continue;
        const at = parseFloat(getComputedStyle(track).getPropertyValue("--at")) || 0;
        const w = track.clientWidth, lw = label.offsetWidth, mark = at * w;
        const fitsRight = mark + 9 + lw <= w - SAFE;
        const fitsLeft = mark - 9 - lw >= SAFE;
        label.dataset.side = fitsRight || !fitsLeft ? "right" : "left";
      }
    };
    measure(); ScrollTrigger.addEventListener("refreshInit", measure);
    const shots = select(".shot-frame") as HTMLElement[];
    const history = select(".history-frame") as HTMLElement[];
    const layers = select(".visual-layer");
    const hud = process.env.NODE_ENV === "development" ? root.querySelector<HTMLOutputElement>(".motion-hud") : null;
    const label = root.querySelector<HTMLElement>(".beat-label")!;
    const stages: [number,string][] = [[0,""],[8,"Creative history"],[17,"Inside one ad"],[29,"Comparing three ads"],[38,"A pattern emerging"],[46,"A testable idea"],[52,"The experiment portfolio"],[66.6,""],[79,"Creative brief"],[86,"Storyboard"],[94,"Making the shots"],[99,"Quality control"],[106,"The edit"],[112,"The finished ad"],[119,"The market"],[126,"What it learned"],[135,"The model updates"],[141.5,""]];
    let currentLabel = "", playing = false;
    const master = gsap.timeline({ paused: true, defaults: { ease: "none" }, onUpdate: () => {
      const t = master.time();
      narratives.forEach(node => {
        const active = t >= Number(node.dataset.start) && t < Number(node.dataset.end);
        if (node.inert === active) { node.inert = !active; node.setAttribute("aria-hidden", String(!active)); }
      });
      const next = stages.filter(([at]) => t >= at).at(-1)![1];
      if (next !== currentLabel) { currentLabel = next; label.textContent = next; }
      const shouldPlay = t >= 113.8 && t < 120;
      if (shouldPlay !== playing) { playing = shouldPlay; if (playing) { video.currentTime = 0; void video.play().catch(() => {}); } else video.pause(); }
      if (process.env.NODE_ENV === "development" && hud && !hud.hidden) hud.textContent = `SCROLL: ${(t / TOTAL).toFixed(3)}\n${next}`;
    } });
    gsap.set([...narratives, ...layers, ...shots, ...history], { autoAlpha: 0 });
    gsap.set(narratives[0], { autoAlpha: 1 });
    gsap.set([...shots, ...history], { force3D: true });
    gsap.set(select(".history-frame span"), { autoAlpha: 0 });
    master.to(select(".film-progress i"), { scaleX: 1, duration: TOTAL }, 0);
    narratives.forEach((node, i) => {
      const start = Number(node.dataset.start), end = Number(node.dataset.end);
      if (i) master.fromTo(node, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.5, immediateRender: false, ease: "expo.out" }, start);
      if (end < TOTAL) master.to(node, { y: -22, autoAlpha: 0, duration: .75, ease: "power2.inOut" }, end - .9).set(node, { autoAlpha: 0 }, end - .1);
    });
    const enter = (target: gsap.TweenTarget, start: number, duration = 1.5) => master.fromTo(target, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration, immediateRender: false, ease: "expo.out" }, start);
    const leave = (target: gsap.TweenTarget, at: number, duration = .9) => master.to(target, { autoAlpha: 0, y: -16, duration, ease: "power2.in" }, at).set(target, { autoAlpha: 0 }, at + duration);
    gsap.set(select(".cmp-row, .cmp-out > span, .an-line, .an-qual, .an-qs blockquote, .an-note, .hypo-why > div, .hypo-next"), { autoAlpha: 0 });
    gsap.set(select(".cmp-track i"), { backgroundColor: "#7a7f88" });
    gsap.set(select(".bet"), { autoAlpha: 0 });
    gsap.set(select(".production-brief dl > div, .script-moved, .sb-caption, .made-row"), { autoAlpha: 0 });
    gsap.set(select(".mk-row, .mk-learn, .mk-qual, .nb-why, .mn-row, .mn-note, .rs-sub"), { autoAlpha: 0 });
    gsap.set(select(".finished-video"), { transformOrigin: "0 0" });
    gsap.set(select(".cmp-track b"), { color: "#7a7f88" });

    // ── Beat 1-2 · one creative, then the history it belongs to ─────────
    // The hero ad is not a separate object that fades out: it is tile 5 of the
    // library, held near the camera, which recedes into its exact final slot
    // while the rest of the wall comes forward. First statement of the motion
    // grammar: objects survive transitions.
    const wall = (i: number) => mobile
      ? { x: wallLeft + (i % 4) * (fw + GAP), y: wallTop + Math.floor(i / 4) * (fh + GAP) }
      : { x: w * .50 + (i % 6) * fw * 1.13, y: h * .18 + Math.floor(i / 6) * fh * 1.1 };
    const wave = (i: number) => Math.floor(i / 4) * .5;
    // Opening frame: the brand's creative history drifting at depth behind the
    // headline. Two ads sit forward and readable so the formats are legible;
    // the rest are atmosphere. Every one is a real tile that resolves into the
    // wall, not a decorative duplicate.
    const FORWARD = mobile ? [1, 14] : [0, 14];
    // phone: [x, depth within the band under the copy, rotation, scale]
    const placed: Record<number, [number, number, number, number]> = mobile
      ? { 1: [.27, .22, -7, .78], 14: [.73, .82, 6, .78] }
      : { 0: [.13, .13, -7, 1], 14: [.87, .84, 6, 1] };
    const drift = (i: number) => {
      const set = placed[i];
      const a = Math.sin(i * 12.9898) * 43758.5453;
      const b = Math.sin(i * 78.233) * 12345.6789;
      const ra = a - Math.floor(a), rb = b - Math.floor(b);
      // A phone has no room beside the headline, so the library drifts in the
      // band under the copy and the headline keeps clean black behind it.
      if (mobile) {
        const scale = set ? set[3] : .5 + rb * .3;
        const room = Math.max(0, h * .97 - heroFloor - fh * scale);
        return { x: w * (set ? set[0] : .5 + (ra - .5) * .7) - fw / 2,
          y: heroFloor + (set ? set[1] : rb) * room - fh * (1 - scale) / 2,
          rot: set ? set[2] : (ra - .5) * 17, scale };
      }
      if (set) return { x: w * set[0] - fw / 2, y: h * set[1] - fh / 2, rot: set[2], scale: set[3] };
      return {
        x: w * (.5 + (ra - .5) * .58) - fw / 2,
        y: h * (.5 + (rb - .5) * .66) - fh / 2,
        rot: (ra - .5) * 17,
        scale: .74 + rb * .5,
      };
    };
    history.forEach((node, i) => {
      const forward = FORWARD.includes(i);
      master.fromTo(node,
        { x: () => drift(i).x, y: () => drift(i).y, rotation: () => drift(i).rot,
          scale: () => drift(i).scale, autoAlpha: forward ? .92 : .13 },
        { x: () => wall(i).x, y: () => wall(i).y, rotation: 0, scale: 1,
          // a phone's wall forms behind the headline, so it stays at depth
          // until the headline has gone
          ...(mobile ? { autoAlpha: .13 } : {}),
          duration: 4.6, ease: "power2.inOut" },
        2.4 + wave(i));
      master.to(node, { autoAlpha: 1, duration: 1.6, ease: "power2.out" }, (mobile ? 7.5 : 5.4) + wave(i));
    });
    // format captions belong to the wall, not to the hero crop
    master.fromTo(select(".history-frame span"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1, immediateRender: false, ease: "power2.out" }, 7);

    // 8.0 - 16.0 · HOLD. The library sits. Nothing animates here by design.

    // 8.8 - 14 · HOLD. The library sits and can be read.

    // ── Act 2b · into one ad ────────────────────────────────────────────
    // Ad A leaves the library from its real position; two neighbours stay
    // recognisable for a moment so the subject has a provenance.
    const AD_A = 2;
    const adAEl = history[AD_A];
    master.to(select(".history-frame span"), { autoAlpha: 0, duration: .7, ease: "power2.in" }, 14.6);
    history.forEach((node, i) => {
      if (i === AD_A) return;
      const near = i === AD_A + 1 || i === AD_A - 1;
      master.to(node, { autoAlpha: 0, scale: .94, duration: 1.2, ease: "power2.in" }, near ? 16.2 : 15.2);
    });
    master.to(adAEl, { x: () => w * (mobile ? .5 : .28) - fw / 2, y: () => h * (mobile ? .5 : .42) - fh / 2,
      scale: mobile ? 1.1 : 1.35, duration: 2, ease: "power2.inOut" }, 15.2);
    master.to(adAEl, { autoAlpha: 0, duration: .6, ease: "power2.in" }, 17.4);

    // ── Act 3 · inside one ad ───────────────────────────────
    // One time coordinate. The same progress drives the shot on screen, the
    // playhead, the clock, which event has happened and how many viewers are
    // left. The scrubber IS the retention trace, so the creative moment and
    // the performance moment are one object rather than a chart beside a film.
    const SHOT_AT = [0, 3, 5, 8, 12];
    const EV_AT = [0, 1, 3, 5, 6, 8];
    const RET = [100, 100, 99, 98, 97, 96, 95, 84, 70, 60, 52, 47, 43, 40, 37, 35];
    const A_IN = 17.2, P_IN = 18.6, P_OUT = 26.6;
    enter(select(".adplay"), A_IN, 1.3);
    const clockEl = root.querySelector<HTMLElement>(".play-clock")!;
    const stillEl = root.querySelector<HTMLElement>(".play-still strong")!;
    const traceEl = root.querySelector<HTMLElement>(".play-trace")!;
    const bars = select(".play-trace i") as HTMLElement[];
    const evs = select(".play-event") as HTMLElement[];
    let litSec = -1, curEv = -2;
    const edit = { t: 0 };
    master.to(edit, {
      t: 15, duration: P_OUT - P_IN, ease: "none",
      onUpdate: () => {
        const t = edit.t;
        const sec = Math.min(15, Math.floor(t));
        // per-second writes only: the trace and clock change on the clock, not per frame
        if (sec !== litSec) {
          litSec = sec;
          clockEl.textContent = "0:" + String(sec).padStart(2, "0");
          bars.forEach((bar, i) => { bar.dataset.on = i <= sec ? "1" : "0"; });
        }
        const f = Math.min(1, t - sec);
        const held = RET[sec] + ((RET[sec + 1] ?? RET[sec]) - RET[sec]) * f;
        stillEl.textContent = Math.round(held) + "%";
        // only the current event and the one before it stay prominent
        let k = -1;
        for (let i = 0; i < EV_AT.length; i++) if (t >= EV_AT[i]) k = i;
        if (k !== curEv) {
          curEv = k;
          evs.forEach((ev, i) => { ev.dataset.state = i === k ? "now" : i === k - 1 ? "prev" : "off"; });
        }
      },
    }, P_IN);
    master.fromTo(select(".play-head"), { x: 0 },
      { x: () => traceEl.clientWidth, duration: P_OUT - P_IN, ease: "none", immediateRender: false }, P_IN);
    // the edit cuts on the same clock
    const per = (P_OUT - P_IN) / 15;
    SHOT_AT.forEach((sec, i) => {
      if (!i) return;
      const at = P_IN + sec * per;
      master.to(select(".play-shot[data-stage='" + (i - 1) + "']"), { autoAlpha: 0, duration: .45, ease: "power1.inOut" }, at);
      master.fromTo(select(".play-shot[data-stage='" + i + "']"), { autoAlpha: 0 },
        { autoAlpha: 1, duration: .45, immediateRender: false, ease: "power1.inOut" }, at);
    });

    // 26.6 - 28.0 · HOLD. The fallen trace sits with the unexplained product.

    // ── Act 3 → 4 · the analysed ad travels into the comparison ─────
    // The subject is not faded out and rebuilt as a row thumbnail: the same
    // frame moves into the slot Ad A leaves empty, so the comparison is
    // visibly about the ad we just read.
    master.to(select(".play-trace, .play-read, .play-events"), { autoAlpha: 0, duration: .7, ease: "power2.in" }, 28);
    master.to(select(".play-shot[data-stage='4']"), { autoAlpha: 0, duration: .6, ease: "power1.inOut" }, 28);
    master.to(select(".play-shot[data-stage='0']"), { autoAlpha: 1, duration: .6, ease: "power1.inOut" }, 28);
    const subject = root.querySelector<HTMLElement>(".play-frame")!;
    const slotA = root.querySelector<HTMLElement>(".cmp-A .cmp-thumb")!;
    const rows = select(".cmp-row") as HTMLElement[];
    // layout positions, read through offsetParent so a live transform on the
    // subject never feeds back into its own target
    const stagePos = (el: HTMLElement) => {
      let x = 0, y = 0, node: HTMLElement | null = el;
      while (node && node !== stage) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
      return { x, y };
    };
    const toSlot = () => {
      const from = stagePos(subject), to = stagePos(slotA);
      return { x: to.x - from.x, y: to.y - from.y, s: subject.offsetWidth ? slotA.offsetWidth / subject.offsetWidth : 1 };
    };
    const pitch = () => rows.length > 1 ? rows[1].offsetTop - rows[0].offsetTop : 0;
    // During Act 4 the comparison is the only thing on screen, so it is centred
    // on its own; Act 5 releases it upward to make room for the reading it
    // produces, rather than leaving a void reserved under it the whole time.
    const anRows = root.querySelector<HTMLElement>(".an-rows")!;
    const anBox = root.querySelector<HTMLElement>(".analysis")!;
    const centreShift = () => mobile ? 0 : Math.max(0, (anBox.clientHeight - anRows.offsetHeight) / 2 - anRows.offsetTop);
    gsap.set(subject, { transformOrigin: "0 0" });
    master.to(subject, { x: () => toSlot().x, y: () => toSlot().y + centreShift(), scale: () => toSlot().s,
      duration: 1.6, ease: "power2.inOut" }, 28.4);

    // ── Act 4 · three ads, compared as decisions ───────────────────
    // Every row marks the same dimension on the same scale, so the comparison
    // reads off the marker positions before a single figure is shown.
    enter(select(".analysis"), 29.4, 1.4);
    master.fromTo(rows, { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 1.1, stagger: .3, immediateRender: false, ease: "expo.out" }, 29.7);

    // 31.5 - 33.0 · HOLD. Three creative decisions on one axis, no numbers yet.

    master.fromTo(select(".cmp-att"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .7, stagger: .12, immediateRender: false }, 33);

    // 34.2 - 35.4 · HOLD. C draws the most attention.

    master.fromTo(select(".cmp-eff"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .7, stagger: .12, immediateRender: false }, 35.4);

    // 36.3 - 37.6 · HOLD. B converts most efficiently. C converts least.

    // ── Act 5 · the comparison is simplified until the relation shows ─
    // Nothing is cut away and nothing new is introduced. Identity, stated
    // decisions and attention recede, so the two dimensions that repeat are
    // the only ones left carrying weight.
    const SUPPORT = .5, BACK = .18;
    master.to([...select(".an-lead, .cmp-decision, .cmp-att, .an-axis, .cmp-thumb"), subject],
      { opacity: .13, duration: 1, ease: "power2.inOut" }, 38.2);
    // the attribute is what Resistive is reading, so every marker takes the
    // signal colour. No single ad is crowned.
    master.to(select(".cmp-track i"), { backgroundColor: "#4d82ff", duration: .9, ease: "power2.inOut" }, 38.4);
    master.to(select(".cmp-track b"), { color: "#8fb0ff", duration: .9, ease: "power2.inOut" }, 38.4);
    master.to(rows[0], { y: () => pitch(), duration: 1.3, ease: "power2.inOut" }, 38.7);
    master.to(rows[1], { y: () => -pitch(), duration: 1.3, ease: "power2.inOut" }, 38.7);
    master.to(subject, { y: () => toSlot().y + centreShift() + pitch(), duration: 1.3, ease: "power2.inOut" }, 38.7);

    // 40.0 - 41.2 · HOLD. Ordered by the attribute, the efficiency follows it.

    // the comparison hands dominance to the statement it produced
    master.fromTo(select(".an-lead, .an-rows, .an-axis, .an-source"), { y: () => centreShift() },
      { y: 0, duration: 1.1, ease: "power2.inOut" }, 41.2);
    master.to(subject, { y: () => toSlot().y + pitch(), duration: 1.1, ease: "power2.inOut" }, 41.2);
    master.to(select(".an-rows"), { opacity: SUPPORT, duration: .9, ease: "power2.inOut" }, 41.4);
    master.fromTo(select(".an-line"), { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: .9, immediateRender: false, ease: "expo.out" }, 41.2);
    // the limit is readable but never competes with the reading it qualifies
    master.fromTo(select(".an-qual"), { autoAlpha: 0 }, { autoAlpha: .75, duration: .7, immediateRender: false }, 41.8);

    // 42.5 - 43.3 · HOLD. The relationship, and the limit on reading it.

    // customer language arrives only once the performance reading has resolved,
    // and the reading steps back to make room for it
    master.to(select(".an-rows"), { opacity: BACK, duration: .8, ease: "power2.inOut" }, 43.3);
    master.to(select(".an-line"), { opacity: SUPPORT, duration: .8, ease: "power2.inOut" }, 43.3);
    master.to(select(".an-qual"), { opacity: .26, duration: .8, ease: "power2.inOut" }, 43.3);
    master.fromTo(select(".an-qs blockquote"), { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: .65, immediateRender: false, ease: "expo.out" }, 43.5);
    master.fromTo(select(".an-note"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, immediateRender: false }, 44.3);

    // 44.9 - 45.3 · HOLD. Possible friction, stated as possible.

    // ── Act 5 → 6 · the hypothesis is assembled from what survived ───
    // The two fragments that carry the reasoning travel to the rows they are
    // about to become, instead of fading out so a new screen can fade in.
    const whyRows = select(".hypo-why > div") as HTMLElement[];
    const anLine = root.querySelector<HTMLElement>(".an-line")!;
    const anQs = root.querySelector<HTMLElement>(".an-qs")!;
    const shiftTo = (el: HTMLElement, target: HTMLElement) => {
      const from = stagePos(el), to = stagePos(target);
      return { x: to.x - from.x, y: to.y - from.y };
    };
    gsap.set([anLine, anQs], { transformOrigin: "0 0" });
    master.to(select(".an-rows, .an-lead, .an-axis, .an-source, .an-note, .an-qual"),
      { autoAlpha: 0, duration: .7, ease: "power2.in" }, 45.4);
    leave(select(".adplay"), 45.4, .7);
    master.to(anLine, { x: () => shiftTo(anLine, whyRows[0]).x, y: () => shiftTo(anLine, whyRows[0]).y,
      scale: .7, opacity: 0, duration: 1.2, ease: "power2.inOut" }, 45.7);
    master.to(anQs, { x: () => shiftTo(anQs, whyRows[1]).x, y: () => shiftTo(anQs, whyRows[1]).y,
      scale: .82, opacity: 0, duration: 1.2, ease: "power2.inOut" }, 45.9);
    master.set(select(".analysis"), { autoAlpha: 0 }, 47.2);
    // each reasoning row resolves where its fragment lands
    enter(select(".hypothesis"), 46.2, 1.3);
    master.fromTo(whyRows[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: .7, immediateRender: false }, 46.7);
    master.fromTo(whyRows[1], { autoAlpha: 0 }, { autoAlpha: 1, duration: .7, immediateRender: false }, 47);
    master.fromTo(whyRows[2], { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: .8, immediateRender: false, ease: "expo.out" }, 47.9);
    master.fromTo(select(".hypo-next"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, immediateRender: false }, 49);

    // 49.6 - 50.1 · HOLD. A testable idea, with what it rests on beside it.

    // 49.6 - 51.2 · HOLD. The hypothesis settles before anything is built on it.

    // ── Phase 2 · the hypothesis becomes an experiment portfolio ─────
    // The hypothesis is not replaced. Its reasoning recedes and the statement
    // itself lifts into an anchor, and the three executions branch off it.
    const hypoLead = root.querySelector<HTMLElement>(".hypo-lead")!;
    const lift = () => -(hypoLead.offsetTop - (mobile ? 6 : h * .09));
    master.to(select(".hypo-why, .hypo-next"), { autoAlpha: 0, duration: .8, ease: "power2.in" }, 51.2);
    // at .6 scale a phone renders the eyebrow near 7px, so there it lets go
    master.to(select(".hypo-lead, .hypo-line"), { y: () => lift(), scale: .6, opacity: (i: number) => mobile && !i ? 0 : .55, duration: 1.4, ease: "power2.inOut" }, 51.4);
    gsap.set(select(".hypo-lead, .hypo-line"), { transformOrigin: "0 0" });
    enter(select(".portfolio"), 52, 1);
    master.fromTo(select(".pf-spine"), { scaleY: 0 }, { scaleY: 1, duration: 1.4, immediateRender: false, ease: "power2.inOut" }, 52.2);
    const betEls = select(".bet") as HTMLElement[];
    // each bet arrives from the spine; the further the strategy, the further
    // it travels, so exploit and explore read before the words are read
    const BET_AT = [52.6, 55.6, 58.6];
    betEls.forEach((bet, i) => {
      master.fromTo(bet, { autoAlpha: 0, x: () => -(22 + i * 22), y: -10 },
        { autoAlpha: 1, x: 0, y: 0, duration: 1.3, immediateRender: false, ease: "expo.out" }, BET_AT[i]);
    });
    // Bet 01 inherits Ad A's edit, so its mechanism mark visibly slides from
    // where Ad A put it to where the experiment puts it.
    // written through a proxy: tweening the custom property directly let GSAP
    // clear the authored value, so the mark started at 0 instead of Ad A's 0:09
    const betTrack = root.querySelector<HTMLElement>(".bet[data-bet='0'] .bet-track")!;
    const betMark = betTrack.querySelector("b")!;
    const mech = { at: 9 / 15 };
    let markSec = -1;
    master.to(mech, { at: 2 / 15, duration: 1.5, ease: "power2.inOut",
      onUpdate: () => {
        betTrack.style.setProperty("--at", String(mech.at));
        const sec = Math.round(mech.at * 15);
        if (sec === markSec) return;
        markSec = sec;
        betMark.textContent = "Mechanism 0:" + String(sec).padStart(2, "0");
        // the mark moved, so which side of it has room has changed too
        placeMarks();
      } }, 53.6);

    // 54.2 - 55.6 · HOLD. One execution: keep the hook, move the mechanism.
    // 57.2 - 58.6 · HOLD. A second, further from what is proven.
    // 60.2 - 64.8 · HOLD. The portfolio, read as one decision.

    // the portfolio recedes rather than cutting; the hypothesis goes with it
    master.to(select(".portfolio"), { autoAlpha: 0, y: -22, duration: 1.4, ease: "power2.in" }, 64.9);
    master.to(select(".hypothesis"), { autoAlpha: 0, y: -22, duration: 1.4, ease: "power2.in" }, 64.9);
    master.set(select(".hypothesis, .portfolio"), { autoAlpha: 0 }, 66.4);
    // only the chosen experiment comes back; the other two stay put
    master.set(select(".bet, .pf-spine"), { autoAlpha: 0 }, 66.4);

    // 68 - 70 · HOLD. Most tools stop at the recommendation.
    // 71.6 - 72.6 · HOLD. Resistive doesn't.
    // 74.4 - 76.6 · HOLD. It makes the ads.

    // ── Phase 2 → 3 · the chosen experiment returns from depth ───────
    // Not a new object: the same bet, coming back to be built.
    master.fromTo(select(".bet[data-bet='0']"),
      { autoAlpha: 0, scale: .72, y: 40 },
      { autoAlpha: .85, scale: 1, y: 96, duration: 2, immediateRender: false, ease: "power2.out" }, 76.4);
    master.fromTo(select(".portfolio"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, immediateRender: false }, 76.4);
    master.to(select(".portfolio"), { autoAlpha: 0, duration: 1, ease: "power2.in" }, 78.9);


    // ── Phase 3 · the selected experiment becomes a finished ad ─────
    // One continuous production. The frames created here are the same objects
    // through storyboard, quality control, edit and the finished cut.
    enter(select(".production-brief"), 79.7, 1.3);
    master.fromTo(select(".production-brief dl > div"), { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: .8, stagger: .26, immediateRender: false, ease: "expo.out" }, 80.3);

    // 81.6 - 83.2 · HOLD. The brief, every line of it already earned.

    leave(select(".production-brief"), 83.2, .9);
    // ── brief → script ────────────────────────────────────
    enter(select(".script-lines"), 83.8, 1.2);
    master.fromTo(select(".script-line"), { autoAlpha: 0, x: -14 },
      { autoAlpha: 1, x: 0, duration: .8, stagger: .22, immediateRender: false, ease: "expo.out" }, 84);
    // the one change the experiment asked for, stated on the beat it moved to
    master.fromTo(select(".script-moved"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .7, immediateRender: false }, 85.4);

    // 86.2 - 88 · HOLD. Five beats, and the moved mechanism among them.

    // ── script → storyboard ──────────────────────────────
    // Each line leaves along the path its own frame takes, so the frame is
    // visibly the line, expanded.
    const boardPos = (i: number) => {
      if (mobile) {
        // three over two, centred, the second row between the first row's
        // frames; frames scale about their centre, so each slot allows for it
        const scale = Math.min(w * .245 / sw, h * .185 / sh), pitch = w * .3, row = Math.floor(i / 3);
        const left = (w - 2 * pitch - sw * scale) / 2 + (row ? pitch / 2 : 0);
        return { x: left + i % 3 * pitch - sw * (1 - scale) / 2, y: boardTop + row * h * .225 - sh * (1 - scale) / 2, scale };
      }
      const scale = Math.min(w * .145 / sw, h * .43 / sh);
      return { x: w * .085 + i * w * .169, y: h * .34, scale };
    };
    shots.forEach((shot, i) => {
      master.fromTo(shot, { x: () => mobile ? w * .1 : w * .56, y: () => h * .30 + i * 40, scale: .4, autoAlpha: 0 },
        { x: () => boardPos(i).x, y: () => boardPos(i).y, scale: () => boardPos(i).scale, autoAlpha: 1,
          duration: 1.8, immediateRender: false, ease: "power2.inOut" }, 88.4 + i * .22);
      master.to(select(".script-line")[i], { x: () => boardPos(i).x - w * .08, y: 45, autoAlpha: 0, duration: 1.1, ease: "power2.inOut" }, 88.4 + i * .22);
    });
    leave(select(".script-lines"), 90.6, .6);

    // 91.6 - 94 · HOLD. The board: five frames, still plates, not footage yet.

    // ── storyboard → generated shots ───────────────────────
    // No progress meters. The plate clears and the footage is simply there.
    master.to(select(".sb-plate"), { autoAlpha: 0, duration: 1, stagger: .28, ease: "power2.inOut" }, 94.4);

    // 96.6 - 98.4 · HOLD. Five shots, made around the product.

    // ── quality control · one shot fails, once ─────────────────
    // Desktop compacts the whole board upward to make room for the check.
    // A phone cannot read five frames and a comparison at once, so it holds
    // only the shot under judgement and lets the rest recede.
    const others = shots.filter((_, i) => i !== 2);
    if (mobile) {
      master.to(shots[2], { x: () => w * .5 - sw / 2, y: () => h * .30,
        scale: () => Math.min(w * .44 / sw, h * .26 / sh), duration: 1.2, ease: "power2.inOut" }, 98.2);
      master.to(others, { autoAlpha: 0, duration: 1, ease: "power2.inOut" }, 98.2);
      master.to(others, { autoAlpha: 1, duration: .8, ease: "power2.out" }, 105.6);
    } else {
      shots.forEach((shot, i) => master.to(shot, { y: () => h * .24,
        scale: () => boardPos(i).scale * .72, duration: 1.2, ease: "power2.inOut" }, 98.2));
    }
    enter(select(".qa-bad"), 98.8, .6);
    enter(select(".qa-readout"), 99.4, 1.1);

    // 100.6 - 101.8 · HOLD. The generated shot against the product reference.

    master.to(select(".qa-bad"), { x: 40, autoAlpha: 0, duration: .8, ease: "power2.in" }, 101.8);
    leave(select(".qa-readout"), 101.9, .8);
    enter(select(".qa-approved"), 102.9, .6);

    // 103.9 - 105.4 · HOLD. Replaced, and matching the product again.

    leave(select(".qa-approved"), 105.4, .6);

    // ── approved shots → edit ───────────────────────────
    // The same frames, aligned. No second editor appears.
    // a phone lays the five frames edge to edge across the text column
    const strip = (i: number) => {
      if (!mobile) return { x: w * .17 + i * w * .142, y: h * .28, scale: Math.min(w * .125 / sw, h * .25 / sh) };
      const scale = (w * .88 - 4 * GAP) / 5 / sw;
      return { x: w * .06 + i * (sw * scale + GAP) - sw * (1 - scale) / 2, y: stripTop - sh * (1 - scale) / 2, scale };
    };
    shots.forEach((shot, i) => master.to(shot,
      { x: () => strip(i).x, y: () => strip(i).y, scale: () => strip(i).scale, duration: 1.6, ease: "power2.inOut" }, 106.2 + i * .1));
    enter(select(".edit-tracks"), 107.2, 1.1);
    // captions belong on the frames, not in a panel beside them
    master.to(select(".shot-frame figcaption"), { autoAlpha: 0, duration: .5, ease: "power2.in" }, 107.4);
    master.fromTo(select(".sb-caption"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, stagger: .12, immediateRender: false }, 107.9);
    master.fromTo(select(".edit-playhead"), { x: 0 }, { x: () => w * .45, duration: 2.2, immediateRender: false }, 108.2);

    // 110.4 - 111.6 · HOLD. Voice, captions and music against the cut.

    // ── edit → one finished ad ───────────────────────────
    const finalX = () => mobile ? w / 2 - sw / 2 : w * .72 - sw / 2;
    const finalY = () => mobile ? finalTop : h * .22;
    master.to(select(".sb-caption"), { autoAlpha: 0, duration: .5 }, 111.8);
    shots.forEach((shot, i) => master.to(shot, { x: finalX, y: finalY, scale: 1, duration: 1.7, ease: "power2.inOut" }, 111.9 + i * .08));
    leave(select(".edit-tracks"), 112);
    master.fromTo(select(".finished-video"), { x: finalX, y: finalY, autoAlpha: 0 },
      { x: finalX, y: finalY, autoAlpha: 1, duration: .6, immediateRender: false }, 113.8);
    master.set(shots, { autoAlpha: 0 }, 114.4);
    // the one comparison that proves production acted on the analysis
    enter(select(".made"), 114.8, 1.2);
    master.fromTo(select(".made-row"), { autoAlpha: 0, x: -12 },
      { autoAlpha: 1, x: 0, duration: .8, stagger: .3, immediateRender: false, ease: "expo.out" }, 115);

    // 116.6 - 119 · HOLD. The finished ad, and where its mechanism now lands.

    leave(select(".made"), 119.2);
    // ── Phase 4 · the market answers and the model changes ─────────
    // The finished ad is not replaced. It recedes into distribution, and the
    // same object returns at the end as one more entry in the library.
    master.to(select(".finished-video"), { x: () => w * (mobile ? .5 : .86), y: () => h * .26, scale: .26, autoAlpha: 0, duration: 1.6, ease: "power2.inOut" }, 118.6);
    enter(select(".market"), 119.6, 1.3);

    // 121.2 - 122.8 · HOLD. What Resistive expected, stated before the result.

    // the result arrives one reading at a time, so the contradiction lands
    master.fromTo(select(".mk-row"), { autoAlpha: 0, x: -12 },
      { autoAlpha: 1, x: 0, duration: .8, stagger: .62, immediateRender: false, ease: "expo.out" }, 122.8);

    // 125.2 - 126.6 · HOLD. Attention down, intent up, cost improved.

    // the expectation steps back and the difference between the two is named
    master.to(select(".mk-lead, .mk-expect"), { opacity: .28, duration: .9, ease: "power2.inOut" }, 126.8);
    master.fromTo(select(".mk-learn"), { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: .9, immediateRender: false, ease: "expo.out" }, 127);
    master.fromTo(select(".mk-qual"), { autoAlpha: 0 }, { autoAlpha: .85, duration: .7, immediateRender: false }, 127.7);

    // 128.6 - 131 · LONG HOLD. Which assumption held, and which did not.

    // ── learning becomes the next bet ────────────────────────
    const mkLearn = root.querySelector<HTMLElement>(".mk-learn")!;
    const nbLine = root.querySelector<HTMLElement>(".nb-line")!;
    gsap.set(mkLearn, { transformOrigin: "0 0" });
    master.to(select(".mk-rows, .mk-lead, .mk-expect, .mk-source, .mk-qual"), { autoAlpha: 0, duration: .7, ease: "power2.in" }, 131.2);
    master.to(mkLearn, { x: () => stagePos(nbLine).x - stagePos(mkLearn).x, y: () => stagePos(nbLine).y - stagePos(mkLearn).y,
      scale: .82, opacity: 0, duration: 1.2, ease: "power2.inOut" }, 131.6);
    master.set(select(".market"), { autoAlpha: 0 }, 133.2);
    enter(select(".nextbet"), 132.2, 1.2);
    master.fromTo(select(".nb-why"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .7, immediateRender: false }, 133.2);

    // 134 - 135.4 · HOLD. The next bet, changed by what came back.

    leave(select(".nextbet"), 135.6, .9);

    // ── the camera pulls back to the library the ad came from ───────
    // a shelf of its own: the act-2 wall does not fit beside this headline, and
    // every end value is stated so no earlier transform can survive here
    // A phone centres a six-wide shelf under the headline. Slots are visual
    // top-left corners: tiles scale about their centre, so they are offset by
    // the shrink, while the finished ad scales from its corner.
    const shelfTile = () => mobile ? shelfW : fw;
    const shelfScale = () => shelfTile() / fw;
    const shelf = (i: number) => mobile
      ? { x: (w - 6 * shelfW - 5 * GAP) / 2 + (i % 6) * (shelfW + GAP), y: shelfTop + Math.floor(i / 6) * (shelfW * 16 / 9 + GAP) }
      : { x: w * .50 + (i % 6) * fw * 1.13, y: h * .20 + Math.floor(i / 6) * fh * 1.08 };
    history.forEach((node, i) => master.fromTo(node, { autoAlpha: 0 },
      { x: () => shelf(i).x - fw * (1 - shelfScale()) / 2, y: () => shelf(i).y - fh * (1 - shelfScale()) / 2,
        scale: () => shelfScale(), rotation: 0, autoAlpha: .34,
        duration: 1.4, stagger: .04, immediateRender: false, ease: "power2.out" }, 136.2 + wave(i) * .3));
    // the same finished ad takes its place as the newest entry
    master.fromTo(select(".finished-video"),
      { x: () => w * (mobile ? .5 : .86), y: () => h * .26, scale: .26, autoAlpha: 0 },
      { x: () => shelf(16).x, y: () => shelf(16).y, scale: () => shelfTile() / sw, autoAlpha: 1, duration: 1.8, immediateRender: false, ease: "power2.inOut" }, 137);
    master.to(select(".finished-video > span"), { autoAlpha: 0, duration: .5, ease: "power2.in" }, 136.6);
    enter(select(".model-note"), 138.2, 1.2);
    master.fromTo(select(".mn-row"), { autoAlpha: 0, x: -12 },
      { autoAlpha: 1, x: 0, duration: .8, stagger: .34, immediateRender: false, ease: "expo.out" }, 138.6);
    master.fromTo(select(".mn-note"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6, immediateRender: false }, 139.9);

    // 140.6 - 141.6 · HOLD. The model is one tested idea different.

    leave(select(".model-note"), 141.8, .9);

    // ── the library recedes until only the mark is left ───────────
    master.to([...history, ...select(".finished-video")], { autoAlpha: 0, scale: .82, duration: 1.6, ease: "power2.inOut" }, 143.4);
    enter(select(".resolve"), 145.6, 1.4);
    master.fromTo(select(".rs-sub"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .8, immediateRender: false }, 146.8);

    // 147.6 - 150 · HOLD. The mark, and the promise the film just demonstrated.

    const trigger = ScrollTrigger.create({ id: "resistive-master", trigger: sequence, start: "top top", end: "bottom bottom", animation: master, scrub: .2, invalidateOnRefresh: true,
      onToggle: self => { shots.forEach(node => node.style.willChange = self.isActive ? "transform, opacity" : "auto"); } });
    const replay = root.querySelector<HTMLButtonElement>(".replay-ad")!;
    const play = () => { video.muted = false; video.controls = true; video.currentTime = 0; void video.play().catch(() => { video.controls = true; }); };
    replay.addEventListener("click", play);
    const navigate = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || !root.contains(link)) return;
      const times: Record<string,number> = { "#top": 0, "#understand": 18, "#create": 73 };
      if (link.hash in times) { event.preventDefault(); lenis.scrollTo(trigger.start + (trigger.end - trigger.start) * times[link.hash] / TOTAL, { immediate: event.detail === 0, duration: .65 }); }
      else if (link.hash === "#early-access") { event.preventDefault(); lenis.scrollTo(root.querySelector<HTMLElement>("#early-access")!, { immediate: event.detail === 0, duration: .65 }); }
    };
    root.addEventListener("click", navigate);
    if (process.env.NODE_ENV === "development") {
      if (hud) hud.hidden = !new URLSearchParams(location.search).has("hud");
      // Development-only scene state so the verifier can tell a settled frame from
      // a transition, and hold the film to a different bar in each case.
      const HOLDS: [number, number][] = [[0, 2.4], [8.8, 14], [26.6, 28], [31.5, 33], [34.2, 35.4], [36.3, 37.6], [40, 41.2], [42.5, 43.3], [44.9, 45.3], [49.6, 51.2], [54.2, 55.6], [57.2, 58.6], [60.2, 64.8], [68, 70], [71.6, 72.6], [74.4, 76.4], [81.6, 83.2], [86.2, 88], [91.6, 94], [96.6, 98.4], [100.6, 101.8], [103.9, 105.4], [110.4, 111.6], [116.6, 118.4], [121.2, 122.8], [125.2, 126.6], [128.6, 131], [134, 135.4], [140.6, 141.6], [147.6, 150]];
      // A retime that forgets TOTAL silently strands every band past it.
      const lastBand = Math.max(...narratives.map(node => Number(node.dataset.end)));
      if (lastBand > TOTAL) console.warn(`[resistive] a narrative band ends at ${lastBand}, past TOTAL ${TOTAL}; it will never exit.`);
      Object.assign(window, { __resistiveMotion: { master, trigger, lenis, total: TOTAL,
        triggers: () => ScrollTrigger.getAll().length,
        state: () => { const t = master.time(); return { time: t, beat: stages.filter(([at]) => t >= at).at(-1)![1],
          phase: HOLDS.some(([a, b]) => t >= a && t <= b) ? "hold" : "transition" }; },
        seek: (t: number) => { lenis.scrollTo(trigger.start + (trigger.end - trigger.start) * t / TOTAL, { immediate: true }); trigger.update(); master.time(t, false); } } });
    }
    ScrollTrigger.refresh(); master.progress(trigger.progress);
    return () => {
      root.removeEventListener("click", navigate); replay.removeEventListener("click", play);
      ScrollTrigger.removeEventListener("refreshInit", measure); gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update); lenis.destroy(); video.pause(); trigger.kill(); master.kill();
      narratives.forEach(node => { node.inert = false; node.removeAttribute("aria-hidden"); });
      if (hud) hud.hidden = true; delete root.dataset.motion;
      if (process.env.NODE_ENV === "development") delete (window as Window & { __resistiveMotion?: unknown }).__resistiveMotion;
    };
  }, root);
  return () => media.revert();
}
