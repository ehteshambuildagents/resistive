"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import FilmWaitlist from "@/components/film-waitlist";

// The selected experiment written as an edit. The hook is Ad A's, kept
// deliberately; the mechanism has moved from 0:09 to 0:02, which is the whole
// point of the bet. Every frame reuses the established product reels.
type Board = { at: string; role: string; line: string; caption: string; reel: "demo" | "ugc" | "fmt"; shot: number };
const board: Board[] = [
  { at: "0:00", role: "Problem hook", line: "Still not sure how this works?", caption: "Still not sure how this works?", reel: "ugc", shot: 3 },
  { at: "0:02", role: "Mechanism", line: "Twist the collar open.", caption: "Twist it open.", reel: "demo", shot: 1 },
  { at: "0:05", role: "Product in use", line: "Drop the cartridge in and close it.", caption: "Drop the cartridge in.", reel: "demo", shot: 2 },
  { at: "0:08", role: "Proof", line: "Three weeks in, still this easy.", caption: "Three weeks in.", reel: "ugc", shot: 1 },
  { at: "0:12", role: "Call to action", line: "Ready in three steps.", caption: "Ready in three steps.", reel: "demo", shot: 4 },
];
// Ad A read as an edit on one clock. Shots are what is on screen; events are
// what Resistive notices. They are separate records so a caption can never
// describe a frame that is not showing.
type Shot = { at: number; reel: "demo" | "ugc" | "fmt"; shot: number };
const adShots: Shot[] = [
  { at: 0, reel: "ugc", shot: 3 },
  { at: 3, reel: "ugc", shot: 0 },
  { at: 5, reel: "demo", shot: 4 },
  { at: 8, reel: "demo", shot: 0 },
  { at: 12, reel: "ugc", shot: 1 },
];
// read: Resistive's own observation, not something on screen.
type Beat = { at: number; text: string; read?: boolean };
const adEvents: Beat[] = [
  { at: 0, text: "Creator enters" },
  { at: 1, text: "Problem hook" },
  { at: 3, text: "Benefit claim" },
  { at: 5, text: "Product raised" },
  { at: 6, text: "Retention begins falling", read: true },
  { at: 8, text: "Demonstration has not started", read: true },
];
// Viewers still watching at each second of the same cut. Illustrative.
const retention = [100, 100, 99, 98, 97, 96, 95, 84, 70, 60, 52, 47, 43, 40, 37, 35];
// Three ads for the same product, compared as creative decisions. The shared
// dimension is when each one explains the product. Figures are illustrative
// and sit under the phrase they support, never in a column of their own.
type Ad = { id: string; name: string; decision: string; reel: "demo" | "ugc" | "fmt"; shot: number; at: number; att: string; ctr: string; eff: string; cpa: string };
const compared: Ad[] = [
  { id: "A", name: "Problem-first", decision: "Opens on the problem, explains late", reel: "ugc", shot: 3, at: 9, att: "Strong attention", ctr: "1.9% clicked", eff: "Weak efficiency", cpa: "$46 each" },
  { id: "B", name: "Demonstration-led", decision: "Opens on the mechanism working", reel: "demo", shot: 1, at: 2, att: "Lower attention", ctr: "1.4% clicked", eff: "Best efficiency", cpa: "$28 each" },
  { id: "C", name: "Testimonial open", decision: "Opens on a reaction, explains last", reel: "ugc", shot: 2, at: 12, att: "Highest attention", ctr: "2.1% clicked", eff: "Weakest efficiency", cpa: "$52 each" },
];
const clock = (sec: number) => `0:${String(sec).padStart(2, "0")}`;
// Customer language, read after the performance reading and never instead of it.
const questions = ["How do I use it?", "Do I need to set it up?", "I wish they showed how it works."];
// Three executions of the one hypothesis Phase 1 earned. Each changes when
// the mechanism is explained; they differ in how much of the proven ad they
// keep. Bet 01 inherits Ad A's opening, so it starts from A's own 0:09 mark.
type Bet = { id: string; kind: string; name: string; open: string; reel: "demo" | "ugc" | "fmt"; shot: number; at: number; from?: number; hook?: string; why: string };
const bets: Bet[] = [
  { id: "01", kind: "Use what already works", name: "Keep the problem hook, explain sooner", open: "Same opening frame as Ad A",
    reel: "ugc", shot: 3, at: 2, from: 9, why: "Preserves the strongest proven opening and changes one variable." },
  { id: "02", kind: "Test something new", name: "Open on the product being used", open: "Opens on the mechanism itself",
    reel: "demo", shot: 1, at: 0, why: "Tests whether immediate clarity beats curiosity-led framing." },
  { id: "03", kind: "Test something new", name: "Open on the question customers ask", open: "Opens on the customer's words",
    reel: "ugc", shot: 0, at: 1, hook: "\u201cHow do I use it?\u201d", why: "Tests the friction the customer language pointed to." },
];
const demoAlt = ["Unbranded ivory sample device", "Hands twisting the device open", "Inserting the blue cartridge", "Closing the device", "Finished device held in a hand"];
const ugcAlt = ["Customer speaking to camera in a kitchen", "Customer speaking to camera at a bathroom shelf", "Customer speaking to camera on a sofa", "Customer speaking to camera in a hallway", "Customer speaking to camera beside a bed"];
const fmtAlt = ["Close-up of the device collar seam", "Unboxing the device", "The device on a kitchen counter", "Customer looking puzzled", "The device on a plain backdrop"];
const altFor = { demo: demoAlt, ugc: ugcAlt, fmt: fmtAlt };
// zoom/pan re-crop one source frame into a genuinely different-looking ad,
// which is how paid social actually varies a shot.
function Photo({ shot = 0, reel = "demo", zoom = 1, pan = 0 }: { shot?: number; reel?: "demo" | "ugc" | "fmt"; zoom?: number; pan?: number }) {
  return <div className={`sample-photo sample-photo-${reel}`} style={{ "--shot": shot, "--zoom": zoom, "--pan": `${pan}%` } as CSSProperties} role="img" aria-label={altFor[reel][shot]} />;
}
// One brand's real creative history. Format and frame are a single record so a
// tile can never be labelled as something it does not show. Run length per
// format is the evidence: 8 testimonials against 2 demonstrations and no
// comparison at all.
type Tile = { reel: "demo" | "ugc" | "fmt"; shot: number; group: number; zoom?: number; pan?: number };
const library: Tile[] = [
  { reel: "ugc", shot: 0, group: 0 }, { reel: "ugc", shot: 1, group: 0 },
  { reel: "ugc", shot: 2, group: 0 }, { reel: "ugc", shot: 3, group: 0 },
  { reel: "ugc", shot: 4, group: 0 }, { reel: "ugc", shot: 0, group: 0, zoom: 1.55, pan: -8 },
  { reel: "ugc", shot: 2, group: 0, zoom: 1.7, pan: -10 }, { reel: "ugc", shot: 4, group: 0, zoom: 1.45, pan: -6 },
  { reel: "ugc", shot: 1, group: 1, zoom: 1.9, pan: -14 }, { reel: "ugc", shot: 3, group: 1, zoom: 1.8, pan: -12 },
  { reel: "fmt", shot: 2, group: 1 },
  { reel: "fmt", shot: 0, group: 2 }, { reel: "demo", shot: 2, group: 2 },
  { reel: "demo", shot: 0, group: 2, zoom: 1.6, pan: 4 },
  { reel: "demo", shot: 1, group: 3 }, { reel: "demo", shot: 3, group: 3 },
];
// Counts are illustrative demo data, and are labelled as such on screen.
const formats = [
  { name: "Testimonial", tests: "43", note: "Heavily tested" },
  { name: "Problem / solution", tests: "16", note: "Well covered" },
  { name: "Product proof", tests: "12", note: "Well covered" },
  { name: "Demonstration", tests: "4", note: "Barely explored" },
  { name: "Comparison", tests: "0", note: "Never tested" },
];
function Logo() { return <span className="film-logo"><span className="film-logo-mark"><img src="/brand/resistive-original.png" alt="" width="1254" height="1254" /></span>Resistive</span>; }

export default function ResistiveFilm() {
  const root = useRef<HTMLDivElement>(null);
  const sequence = useRef<HTMLElement>(null);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    import("@/lib/film-motion").then(({ createFilmMotion }) => {
      if (!disposed && root.current && sequence.current) cleanup = createFilmMotion(root.current, sequence.current);
    }).catch(error => { console.error("Film initialization failed", error); if (root.current) root.current.dataset.motion = "reduced"; });
    return () => { disposed = true; cleanup?.(); };
  }, []);
  return <div className="film-site" ref={root}>
    <a className="film-skip" href="#early-access">Skip to early access</a>
    <header className="film-nav"><a href="#top" aria-label="Resistive home"><Logo /></a><nav aria-label="Main navigation"><a href="#understand">How it works</a><a href="#create">Ad creation</a><a className="nav-join" href="#early-access">Join waitlist</a></nav></header>
    <main>
      <section ref={sequence} className="film-sequence" id="top" aria-label="How Resistive works">
        <div className="film-stage">
          <div className="narrative-stack">
            <section className="narrative n-premise" data-start="0" data-end="8"><span className="premise-eyebrow">Introducing Resistive</span><h1>Know what deserves<br />to be tested next.</h1><p>Resistive learns from your ads, forms the next bets, and makes the creative to test them.</p><a href="#understand" className="text-link">See how it works</a><span className="premise-foot">Illustrative sample creative</span></section>
            <section className="narrative n-history" data-start="8" data-end="17"><h2>Every ad has already<br />taught you something.</h2><p>One product, many creative decisions. Resistive reads the library as experiments, not as files.</p></section>
            <section id="understand" className="narrative n-inside" data-start="17" data-end="29"><h2>It reads the ad<br />second by second.</h2><p>What is on screen at each moment, and how many people are still watching when it gets there.</p></section>
            <section className="narrative n-compare" data-start="29" data-end="38"><h2>Attention is only<br />part of the result.</h2><p>One ad can be chance. Resistive compares the creative decisions behind several.</p></section>
            <section className="narrative n-pattern" data-start="38" data-end="46"><h2>A pattern<br />is emerging.</h2><p>Sorted by when each ad explains the product, the efficiency falls into the same order.</p></section>
            <section className="narrative n-hypothesis" data-start="46" data-end="52"><h2>Now it is<br />testable.</h2><p>The reading becomes a creative idea, with what it rests on and what it expects stated alongside it.</p></section>
            <section className="narrative n-portfolio" data-start="52" data-end="66"><h2>One hypothesis.<br />Three ways to test it.</h2><p>Not one idea. Resistive allocates several ways to test the same hypothesis<span className="wide-only">, keeping what is already proven and deliberately exploring what is not</span>.</p></section>
            <section className="narrative n-stop" data-start="66.6" data-end="70.5"><h2>Most tools stop at<br />the recommendation.</h2></section>
            <section className="narrative n-doesnt" data-start="70.5" data-end="73"><h2>Resistive doesn’t.</h2></section>
            <section id="create" className="narrative n-reveal" data-start="73" data-end="77"><h2>It makes the ads.</h2></section>
            <section className="narrative n-production" data-start="79" data-end="84"><h2>The experiment<br />becomes a brief.</h2><p>Every line of it comes from what the analysis already found.</p></section>
            <section className="narrative n-shots" data-start="84" data-end="94"><h2>Every line<br />becomes a shot.</h2><p>Five beats, timed to the hypothesis, storyboarded against your own product.</p></section>
            <section className="narrative n-generate" data-start="94" data-end="99"><h2>Then it makes<br />the shots.</h2><p>Each frame resolves into footage built around the product you already sell.</p></section>\n            <section className="narrative n-qa" data-start="99" data-end="106"><h2>And checks<br />its own work.</h2><p>One shot does not match the product. Resistive rejects it and replaces it.</p></section>
            <section className="narrative n-edit" data-start="106" data-end="112"><h2>Bring it<br />all together.</h2><p>Approved shots, voice, captions and music on one timeline.</p></section>
            <section className="narrative n-finished" data-start="112" data-end="119"><h2>Your next test,<br />ready to run.</h2><p>One finished vertical ad, built from the hypothesis it came out of.</p><button className="text-link replay-ad" type="button">Play sample ad</button></section>
            <section className="narrative n-market" data-start="119" data-end="126"><h2>The market<br />is the final judge.</h2><p>Resistive states what it expects before launch, then lets the result answer.</p></section>
            <section className="narrative n-learning" data-start="126" data-end="135"><h2>The difference<br />is the learning.</h2><p>Not which ad won. Which assumption held, and which one did not.</p></section>
            <section className="narrative n-model" data-start="135" data-end="141.5"><h2>Every experiment<br />joins the model.</h2><p>The library it came from is now one tested idea smarter.</p></section>
            <section className="narrative n-loop" data-start="141.5" data-end="145.5"><h2>So what should<br />you test next?</h2></section>
          </div>
          <div className="history-frames" aria-hidden="true">{library.map((t, i) => <div className="history-frame" data-group={t.group} data-tile={i} key={i}><Photo reel={t.reel} shot={t.shot} zoom={t.zoom} pan={t.pan} /><span>{formats[t.group].name}</span></div>)}</div>
          <div className="persistent-shots">{board.map((beat, i) => <figure className="shot-frame" data-shot={i} key={beat.at}>
            <Photo reel={beat.reel} shot={beat.shot} />
            <span className="sb-plate" />
            <span className="sb-caption">{beat.caption}</span>
            <figcaption><span className="shot-index">{beat.at}</span><strong>{beat.role}</strong></figcaption>
            {i === 2 && <><div className="qa-bad"><Photo reel="demo" shot={2} /><span>Product shape mismatch</span></div><span className="qa-approved">Approved, product match</span></>}
          </figure>)}</div>
          <div className="adplay visual-layer" aria-hidden="true">
            <div className="play-reel">
              <div className="play-frame">{adShots.map((sh, i) => <div className="play-shot" data-stage={i} key={i}><Photo reel={sh.reel} shot={sh.shot} /></div>)}</div>
              <div className="play-trace">{retention.map((r, i) => <i key={i} data-sec={i} style={{ "--h": r } as CSSProperties} />)}<b className="play-head" /></div>
              <div className="play-read"><span className="play-clock">0:00</span><span className="play-still"><strong>100%</strong> still watching</span></div>
            </div>
            <div className="play-events">
              <p className="play-lead">Ad A, illustrative 15-second edit</p>
              {adEvents.map((e, i) => <span className="play-event" data-ev={i} data-read={e.read ? "1" : "0"} key={i}><em>{clock(e.at)}</em><strong>{e.text}</strong></span>)}
            </div>
          </div>
          <div className="analysis visual-layer" aria-hidden="true">
            <p className="an-lead">Three ads for one product, three creative decisions</p>
            <div className="an-rows">
              {compared.map((ad, i) => <div className={`cmp-row cmp-${ad.id}`} data-ad={i} key={ad.id}>
                <div className="cmp-thumb">{ad.id === "A" ? null : <Photo reel={ad.reel} shot={ad.shot} />}</div>
                <div className="cmp-body">
                  <strong className="cmp-name">{ad.name}</strong>
                  <span className="cmp-decision">{ad.decision}</span>
                  <span className="cmp-track" style={{ "--at": ad.at / 15 } as CSSProperties}><i /><b>{`Explained ${clock(ad.at)}`}</b></span>
                  <span className="cmp-out">
                    <span className="cmp-att">{ad.att}<em>{ad.ctr}</em></span>
                    <span className="cmp-eff">{ad.eff}<em>{ad.cpa}</em></span>
                  </span>
                </div>
              </div>)}
            </div>
            <p className="an-axis">Marked where each ad explains the product, across the same fifteen seconds</p>
            <p className="an-source">Same product, same audience, same reporting window. Illustrative demo data.</p>
            <p className="an-line">The stronger-converting creatives explain the product earlier.</p>
            <p className="an-qual">A pattern across three ads in one sample. Not proof of cause.</p>
            <div className="an-qs">{questions.map(q => <blockquote key={q}>{q}</blockquote>)}</div>
            <p className="an-note">Customers understand the promise. They still ask how it works.</p>
          </div>
          <div className="hypothesis visual-layer" aria-hidden="true">
            <p className="hypo-lead">Hypothesis</p>
            <p className="hypo-line">Explain the product mechanism earlier.</p>
            <dl className="hypo-why">
              <div><dt>Observed</dt><dd>Earlier explanation appears in the more efficient creatives.</dd></div>
              <div><dt>Supporting customer signal</dt><dd>Repeated questions about how the product works.</dd></div>
              <div><dt>Expected outcome</dt><dd>Better downstream efficiency, without giving up too much of the opening attention.</dd></div>
            </dl>
            <p className="hypo-next">Several executions could test this. Resistive allocates and builds them next.</p>
          </div>
          <div className="portfolio visual-layer" aria-hidden="true">
            <i className="pf-spine" />
            {bets.map((bet, i) => <div className="bet" data-bet={i} style={{ "--dist": i } as CSSProperties} key={bet.id}>
              <div className="bet-frame"><Photo reel={bet.reel} shot={bet.shot} />{bet.hook && <span className="bet-hook">{bet.hook}</span>}</div>
              <div className="bet-body">
                <span className="bet-kind">{bet.kind}</span>
                <strong className="bet-name">{bet.name}</strong>
                <span className="bet-open">{bet.open}</span>
                <span className="bet-track" style={{ "--at": (bet.from ?? bet.at) / 15 } as CSSProperties}><i /><b>{`Mechanism ${clock(bet.at)}`}</b></span>
                <span className="bet-why">{bet.why}</span>
              </div>
            </div>)}
          </div>
          <div className="production-brief visual-layer" aria-hidden="true">
            <span className="brief-label">Creative brief</span>
            <p>Keep the winning hook. Explain the mechanism earlier.</p>
            <dl>
              <div><dt>Goal</dt><dd>Preserve the problem-first opening that already earns attention.</dd></div>
              <div><dt>Change</dt><dd>Product mechanism moves from 0:09 to 0:02.</dd></div>
              <div><dt>Tension</dt><dd>They understand the benefit. They still ask how it works.</dd></div>
              <div><dt>Proof</dt><dd>Show the mechanism before leaning on testimonial proof.</dd></div>
            </dl>
          </div>
          <div className="script-lines visual-layer" aria-hidden="true">
            {board.map((beat, i) => <div className="script-line" data-line={i} key={beat.at}>
              <span>{beat.at}</span><strong>{beat.role}</strong><em>{beat.line}</em>
              {i === 1 && <b className="script-moved">moved from 0:09</b>}
            </div>)}
          </div>
          <div className="qa-readout visual-layer" aria-hidden="true">
            <span className="qa-shot">Shot 03</span>
            <div className="qa-pair">
              <figure><div className="qa-thumb"><Photo reel="demo" shot={2} /></div><figcaption>Product reference</figcaption></figure>
              <figure className="qa-gen"><div className="qa-thumb"><Photo reel="demo" shot={2} /></div><figcaption>Generated shot</figcaption></figure>
            </div>
            <span className="qa-verdict">Product shape mismatch. Rejected.</span>
          </div>
          <div className="made visual-layer" aria-hidden="true">
            <div className="made-row"><span>Ad A</span><i className="made-track" style={{ "--at": 9 / 15 } as CSSProperties} /><b>0:09</b></div>
            <div className="made-row made-new"><span>This ad</span><i className="made-track" style={{ "--at": 2 / 15 } as CSSProperties} /><b>0:02</b></div>
            <p>The mechanism now arrives where the evidence said it should.</p>
          </div>
          <div className="edit-tracks visual-layer" aria-hidden="true">
            <div><span>Voice</span><i /><em>&ldquo;Still not sure how this works?&rdquo;</em></div>
            <div><span>Captions</span><i /></div>
            <div><span>Music</span><i /></div>
            <b className="edit-playhead" />
          </div>
          <div className="finished-video visual-layer"><video muted playsInline loop preload="metadata" poster="/demo/poster.jpg" aria-label="Illustrative finished product demonstration advertisement"><source src="/demo/sample-ad.mp4" type="video/mp4" /><track kind="captions" src="/demo/captions.vtt" srcLang="en" label="English" /></video><span>Sample ad · 15 seconds</span></div>
          <div className="market visual-layer" aria-hidden="true">
            <p className="mk-lead">Expected before launch</p>
            <p className="mk-expect">Explaining the mechanism earlier should improve downstream efficiency without giving up much of the opening attention.</p>
            <div className="mk-rows">
              <div className="mk-row" data-row="0"><span>Attention</span><i data-dir="down" /><b>Slightly lower</b></div>
              <div className="mk-row" data-row="1"><span>Purchase intent</span><i data-dir="up" /><b>Materially higher</b></div>
              <div className="mk-row" data-row="2"><span>Cost per conversion</span><i data-dir="up" /><b>Improved</b></div>
            </div>
            <p className="mk-source">Observed after the test. Illustrative demo data.</p>
            <p className="mk-learn">Earlier demonstration traded some curiosity for stronger purchase intent in this audience.</p>
            <p className="mk-qual">Half the expectation held. One experiment, one audience, held as evidence rather than as a rule.</p>
          </div>
          <div className="nextbet visual-layer" aria-hidden="true">
            <p className="nb-lead">What Resistive tests next</p>
            <p className="nb-line">Keep the early mechanism. Rebuild curiosity in the first two seconds.</p>
            <p className="nb-why">Because the result changed the question, not just the score.</p>
          </div>
          <div className="model-note visual-layer" aria-hidden="true">
            <span className="mn-lead">Brand Creative Model</span>
            <div className="mn-row"><em>Demonstration</em><b>Underexplored &rarr; emerging signal</b></div>
            <div className="mn-row"><em>Testimonial</em><b>Saturated, unchanged</b></div>
            <p className="mn-note">One finished experiment, now part of the library it came from.</p>
          </div>
          <div className="resolve visual-layer" aria-hidden="true">
            <Logo />
            <p className="rs-line">The Creative R&amp;D Engine for performance brands.</p>
            <p className="rs-sub">Learn from every ad. Build better ones next.</p>
          </div>
          <div className="film-bottom"><span className="sample-disclaimer">Illustrative demo. Sample product, reviews and results.</span><span className="beat-label" /></div>
          <div className="film-progress" aria-hidden="true"><i /></div>
          {process.env.NODE_ENV === "development" && <output className="motion-hud" hidden />}
        </div>
      </section>
      <section className="join-section" id="early-access"><Logo /><h2>Better decisions. Finished ads. Smarter next time.</h2><p>The Creative R&amp;D engine for performance brands.</p><FilmWaitlist /></section>
    </main>
    <footer className="film-footer"><span>© 2026 Resistive</span><a href="#top">Back to the beginning ↑</a></footer>
  </div>;
}
