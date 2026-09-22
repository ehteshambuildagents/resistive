"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Pause, Play, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import FilmWaitlist from "@/components/film-waitlist";

const ads = [
  { id: "M-014", format: "Creator", image: "creator", headline: "My desk was missing one thing.", spend: "$2,400", result: "Attention. Few purchases.", status: "paused", cpa: "$62" },
  { id: "M-021", format: "Demo", image: "demo", headline: "Good light. One touch.", spend: "$7,200", result: "More room to scale.", status: "efficient", cpa: "$28" },
  { id: "M-008", format: "Product proof", image: "product", headline: "A little light. A different room.", spend: "$1,600", result: "Stopped early. Still useful.", status: "paused", cpa: "$71" },
  { id: "M-016", format: "UGC", image: "creator", headline: "This is my evening switch.", spend: "$1,200", result: "Weak conversion", status: "paused", cpa: "$68" },
  { id: "M-019", format: "Problem / solution", image: "product", headline: "That dark corner? Sorted.", spend: "$2,100", result: "Efficient", status: "efficient", cpa: "$32" },
  { id: "M-012", format: "Testimonial", image: "creator", headline: "“It goes wherever I do.”", spend: "$900", result: "Weak attention", status: "paused", cpa: "$75" },
  { id: "M-023", format: "Offer", image: "demo", headline: "Meet your new evening ritual.", spend: "$1,800", result: "Mixed results", status: "mixed", cpa: "$48" },
  { id: "M-010", format: "Static", image: "product", headline: "Make room for better light.", spend: "$800", result: "Weak conversion", status: "paused", cpa: "$64" },
] as const;
const chapters = [
  { time: 0, kind: "Problem hook", note: "The opening names the dark-desk problem.", overlay: "Your desk deserves better light." },
  { time: 2, kind: "Creator", note: "A person makes the situation familiar.", overlay: "Meet your evening upgrade." },
  { time: 6, kind: "Product", note: "The lamp first appears as the solution.", overlay: "MORROW. Light that moves with you." },
  { time: 9, kind: "Mechanism", note: "The touch control is finally demonstrated.", overlay: "One touch. Your kind of light." },
  { time: 12, kind: "Product proof", note: "The light is shown working on the desk.", overlay: "See your space differently." },
  { time: 15, kind: "Call to action", note: "The ad asks the viewer to shop.", overlay: "Bring better light home." },
];
function Logo() {
  return <span className="brand"><span className="brand-mark"><img src="/brand/resistive-original.png" alt="" width="1254" height="1254" /></span><span>Resistive</span></span>;
}
function useSystemMotion(root: React.RefObject<HTMLDivElement | null>, stage: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = root.current, surface = stage.current;
    if (!container || !surface) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, oldScene = -1;
    const panels = Array.from(surface.querySelectorAll<HTMLElement>("[data-story]"));
    const creatives = Array.from(surface.querySelectorAll<HTMLElement>(".ad-object"));
    const world = surface.querySelector<HTMLElement>(".creative-world")!;
    const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
    const mix = (a: number, b: number, t: number) => a + (b - a) * t;
    const ease = (t: number) => t * t * (3 - 2 * t);
    function update() {
      frame = 0;
      if (!container || !surface) return;
      if (reduce.matches) {
        surface.dataset.reduced = "true"; surface.dataset.scene = "0";
        panels.forEach(panel => { panel.inert = false; panel.removeAttribute("aria-hidden"); panel.style.removeProperty("transform"); });
        creatives.forEach(card => card.style.removeProperty("transform"));
        return;
      }
      delete surface.dataset.reduced;
      const header = window.innerWidth < 760 ? 58 : 76;
      const distance = container.offsetHeight - surface.offsetHeight;
      const progress = clamp((header - container.getBoundingClientRect().top) / Math.max(1, distance));
      const cursor = progress * 3.65, scene = Math.min(3, Math.floor(cursor)), local = cursor - scene;
      surface.style.setProperty("--progress", String(progress));
      if (oldScene !== scene) {
        surface.dataset.scene = String(scene);
        panels.forEach((panel, index) => { const active = index === scene; panel.inert = !active; panel.setAttribute("aria-hidden", String(!active)); panel.style.visibility = active ? "visible" : "hidden"; });
        surface.querySelectorAll<HTMLElement>("[data-at]").forEach(node => { const active = node.dataset.at!.split(",").includes(String(scene)); node.inert = !active; node.setAttribute("aria-hidden", String(!active)); });
        surface.querySelectorAll<HTMLElement>(".scene-tab").forEach((node, index) => node.setAttribute("aria-current", index === (scene === 0 ? 0 : scene < 3 ? 1 : 2) ? "step" : "false"));
        oldScene = scene;
      }
      panels.forEach((panel, index) => {
        const entry = index === 0 ? 0 : (1 - ease(clamp(local / .16))) * 65;
        const exit = scene < 3 ? ease(clamp((local - .83) / .17)) * -65 : 0;
        panel.style.transform = `translate3d(0,${index === scene ? entry + exit : 0}px,0)`;
      });
      const mobile = window.innerWidth < 760, width = world.clientWidth, height = world.clientHeight, base = mobile ? 128 : 146;
      const positions = (step: number, i: number) => {
        if (mobile) return i === 1 ? { x: width * (step === 3 ? .29 : .42) - base / 2, y: step === 3 ? 16 : 23, scale: step === 3 ? 1.03 : 1 } : { x: width + 180 + i * 15, y: 45, scale: .5 };
        if (step === 0) return { x: width * [.17, .5, .83][i % 3] - base / 2, y: i === 1 ? 87 : 119, scale: i < 3 ? 1 : .5 };
        if (step === 1) return { x: 15 + (i % 4) * ((width - 30) / 4), y: 57 + Math.floor(i / 4) * 254, scale: .70 };
        if (step === 2) return { x: 20 + (i % 4) * ((width - 30) / 4), y: 65 + Math.floor(i / 4) * 254, scale: .64 };
        return i === 1 ? { x: width * .25 - base * .62, y: 57, scale: Math.min(1.3, (height - 185) / 330) } : { x: width + 180 + i * 45, y: height * .4, scale: .42 };
      };
      const from = Math.max(0, scene - 1), t = scene === 0 ? 1 : ease(clamp(local / .3));
      creatives.forEach((card, i) => { const a = positions(from, i), b = positions(scene, i); card.style.transform = `translate3d(${mix(a.x, b.x, t)}px,${mix(a.y, b.y, t)}px,0) scale(${mix(a.scale, b.scale, t)})`; });
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true }); window.addEventListener("resize", schedule); reduce.addEventListener("change", schedule); update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); reduce.removeEventListener("change", schedule); };
  }, [root, stage]);
}
export default function CreativeSystem() {
  const root = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null), video = useRef<HTMLVideoElement>(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false), [recordOpen, setRecordOpen] = useState(false), [seconds, setSeconds] = useState(9), [playing, setPlaying] = useState(false);
  const chapter = [...chapters].reverse().find(item => seconds >= item.time) || chapters[0];
  useSystemMotion(root, stage);
  function goTo(moment: number) {
    if (!root.current || !stage.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { document.querySelector(`[data-story="${moment}"]`)?.scrollIntoView(); return; }
    const distance = root.current.offsetHeight - stage.current.offsetHeight;
    const header = window.innerWidth < 760 ? 58 : 76;
    const target = window.scrollY + root.current.getBoundingClientRect().top - header + distance * (moment / 3.65 + .075);
    window.scrollTo({ top: moment === 0 ? 0 : target, behavior: "smooth" });
  }
  function seek(time: number) { setSeconds(time); if (video.current) video.current.currentTime = time; }
  async function togglePlay() {
    if (!video.current) return;
    if (playing) { video.current.pause(); setPlaying(false); }
    else { if (seconds >= 17.8) seek(0); try { await video.current.play(); setPlaying(true); } catch { setPlaying(false); } }
  }
  useEffect(() => {
    const surface = stage.current; if (!surface) return;
    const observer = new MutationObserver(() => { if (surface.dataset.scene !== "3" && video.current) { video.current.pause(); setPlaying(false); } });
    observer.observe(surface, { attributes: true, attributeFilter: ["data-scene"] }); return () => observer.disconnect();
  }, []);
  return <>
    <a className="skip-link" href="#system">Skip to the system</a>
    <header className="site-header"><a className="home-link" href="#" aria-label="Resistive home" onClick={event => { event.preventDefault(); goTo(0); }}><Logo /></a><nav aria-label="Main navigation"><button onClick={() => goTo(1)}>The cost of testing</button><button onClick={() => goTo(3)}>Creative memory</button></nav><button className="header-cta" onClick={() => setWaitlistOpen(true)}>Join early access <ArrowUpRight size={15} /></button></header>
    <main id="system" ref={root} className="system-film">
      <div ref={stage} className="system-stage" data-scene="0" style={{ "--progress": 0 } as CSSProperties}>
        <div className="scene-background" aria-hidden="true" />
        <div className="system-body"><div className="copy-viewport">
          <section data-story="0" className="story-copy hero-copy"><p className="eyebrow"><span className="blue-tick" />CREATIVE R&D FOR PERFORMANCE BRANDS</p><h1>Your ad budget<br className="desktop-break" /> is already<br className="desktop-break" /> buying data.<br /><span>Learn from it.</span></h1><p className="body-copy">Resistive learns from every creative your brand has run, decides what deserves testing next, and turns those bets into finished ads.</p><div className="hero-actions"><button className="primary-button" onClick={() => setWaitlistOpen(true)}>Join early access <ArrowUpRight size={17} /></button><button className="text-button" onClick={() => goTo(1)}>See how the system works <ArrowDown size={15} /></button></div><p className="hero-footnote">The market decides what works.<br />Every result should change what you do next.</p></section>
          <section data-story="1" className="story-copy cost-copy" aria-hidden="true" style={{ visibility: "hidden" }}><p className="eyebrow">01 / THE COST OF RANDOM CREATIVE</p><h2>The spend <br />is real.<br /><span>The learning <br />gets lost.</span></h2><p className="body-copy">Eight creatives. Eight different outcomes. Every dollar bought information about what moved people—and what didn’t.</p><div className="spend-statement"><span className="mono">ROUND 01 / MEDIA SPEND</span><strong>$18,000<span>.00</span></strong><p>Results in one tool. Creative in another. <br />The reasons scattered across the team.</p></div></section>
          <section data-story="2" className="story-copy reset-copy" aria-hidden="true" style={{ visibility: "hidden" }}><p className="eyebrow">01 / THE NEXT PLANNING SESSION</p><h2>New round. <br />Same<br /><span>unknowns.</span></h2><p className="reset-line">Most teams start the next round before learning from the last one.</p><p className="body-copy">New moodboards. New hooks. More opinions.<br />The next budget goes to another guess.</p><div className="lost-learning"><span className="cut-line" />A new batch should never mean a blank slate.</div></section>
          <section data-story="3" className="story-copy memory-copy" aria-hidden="true" style={{ visibility: "hidden" }}><p className="eyebrow"><span className="blue-tick" />02 / A MEMORY THAT STAYS</p><h2>Keep the ad.<br />Keep the result.<br /><span>Keep the why.</span></h2><p className="body-copy"><span className="desktop-copy">Resistive connects what happened in the creative to what happened in the market. The hook. The proof. The moment the product made sense.</span><span className="mobile-copy">The hook. The proof. The result. Resistive keeps them connected to the exact ad.</span></p><p className="memory-emphasis">One experiment. A record you can build on.</p><button className="text-button record-button" onClick={() => setRecordOpen(true)}>Explore the experiment record <Plus size={17} /></button><p className="hero-footnote">The next creative starts with this history.</p></section>
        </div>
        <div className="creative-world" aria-label="Illustrative creative experiments for the fictional Morrow brand">
          <div className="world-caption"><span>MORROW<span className="caption-slash">/</span><span className="caption-detail">PORTABLE LIGHT</span></span><span className="sample-label">SAMPLE BRAND</span></div>
          <div className="spend-input" data-at="0"><span className="mono">AD SPEND</span><span className="spend-rail"><i /><i /><i /></span><span className="mono">TEST → OBSERVE</span></div>
          <div className="experiment-grid-label" data-at="1,2"><span>ROUND 01</span><span>8 TESTS / $18,000 SPENT</span></div>
          {ads.map((ad, index) => <article className={`ad-object ad-${index} ${index === 1 ? "featured-ad" : ""}`} key={ad.id} style={{ "--ad-index": index } as CSSProperties} aria-label={`${ad.format} ${ad.id}: ${ad.spend} spend, ${ad.result}`}>
            <div className="ad-topline"><span>{ad.id}</span><span>{ad.format}</span></div><div className="ad-portrait"><img src={`/creative-rd/${ad.image}.webp`} alt={`Fictional Morrow ${ad.format.toLowerCase()} ad featuring an ivory portable lamp`} width="432" height="768" loading={index < 3 ? "eager" : "lazy"} fetchPriority={index === 1 ? "high" : "auto"} />
              {index === 1 && <video ref={video} className="creative-video" src="/creative-rd/morrow-experiment.mp4" poster="/creative-rd/demo.webp" muted playsInline preload="none" onLoadedMetadata={() => { if (video.current) video.current.currentTime = seconds; }} onTimeUpdate={() => setSeconds(video.current?.currentTime || 0)} onEnded={() => setPlaying(false)} aria-label="Illustrative 18-second Morrow ad; use the timeline to inspect each creative decision" />}
              <div className="ad-shade" /><span className="ad-brand">morrow</span><span className="ad-headline">{index === 1 ? <><span className="normal-ad-headline">{ad.headline}</span><span className="memory-ad-headline">{chapter.overlay}</span></> : ad.headline}</span><span className="ad-shop">DISCOVER MORROW <ArrowUpRight size={10} /></span>{index === 1 && <span className="video-time">00:{String(Math.floor(seconds)).padStart(2, "0")} / 00:18</span>}
            </div><div className={`ad-outcome ${ad.status}`}><span className="spend-number">{ad.spend}<small> spent</small></span><span className="outcome-label"><i />{index === 1 ? "Scaling" : "Paused"}</span></div><p className="ad-result">{ad.result}</p><div className="cost-result"><span>CPA</span><strong>{ad.cpa}</strong><i />{ad.result}</div><div className="record-attached"><span><Check size={11} />RESULT ATTACHED</span><strong>$28 <small>CPA</small></strong></div>
          </article>)}
          <div className="hero-traces" data-at="0" aria-hidden="true"><svg viewBox="0 0 600 100" preserveAspectRatio="none"><path className="trace-gray" d="M102 0V40H300 M498 0V40H300" /><path className="trace-blue" d="M300 0V81H599" /><path className="trace-pulse" d="M102 0V40H300V81H599" /></svg><span className="trace-caption">Paused ≠ forgotten.</span><span className="retained-signal"><span className="blue-tick" />EVERY OUTCOME BECOMES EVIDENCE <ArrowRight size={15} /></span></div>
          <div className="mobile-data" data-at="0,1"><span className="mobile-data-label">SPEND</span><strong>$7,200</strong><span className="mobile-data-line" /><span className="mobile-data-label">RESULT</span><strong>$28 <small>CPA</small></strong><span className="mobile-data-line" /><span className="mobile-data-label blue">RETAINED</span><span className="mobile-learning">What was shown.<br />What happened.</span></div>
          <div className="planning-sheet" data-at="2"><div className="planning-top"><span>ROUND 02</span><span>CREATIVE PLANNING ↗</span></div><h3>What should <br />we make next?</h3><div className="planning-row"><span>01</span> A new hook <Plus size={15} /></div><div className="planning-row"><span>02</span> A fresh reference <Plus size={15} /></div><div className="planning-row"><span>03</span> Someone’s opinion <Plus size={15} /></div><div className="missing-memory"><X size={15} /><span>Previous learnings attached</span><strong>0</strong></div></div>
          <div className="memory-annotation" data-at="3"><p className="mono">CREATIVE DECISION</p><div className="annotation-rule"><i /></div><span className="annotation-time">0:{String(chapter.time).padStart(2, "0")}</span><h3>{chapter.kind}</h3><p>{chapter.note}</p><div className="annotation-context"><span>WHAT THE MARKET DID</span><strong>$28 <small>cost per acquisition</small></strong><p>$7,200 spend · 257 purchases</p></div><span className="evidence-attached"><Check size={12} /> Saved to this exact creative</span></div>
          <div className="memory-timeline" data-at="3"><div className="timeline-heading"><button className="play-button" onClick={togglePlay} aria-label={playing ? "Pause sample ad" : "Play sample ad"}>{playing ? <Pause size={13} /> : <Play size={13} />}</button><span>INSPECT THE CREATIVE</span><span className="timeline-duration">00:{String(Math.floor(seconds)).padStart(2, "0")} / 00:18</span></div><input type="range" min="0" max="17.9" step="0.1" value={seconds} onChange={event => seek(Number(event.target.value))} aria-label="Scrub the illustrative ad" aria-valuetext={`${seconds.toFixed(1)} seconds: ${chapter.kind}`} style={{ "--playhead": `${seconds / 18 * 100}%` } as CSSProperties} /><div className="chapter-marks">{chapters.map(item => <button key={item.time} className={chapter.time === item.time ? "active" : ""} onClick={() => seek(item.time)} aria-label={`${item.time} seconds: ${item.kind}`} aria-pressed={chapter.time === item.time}><span>0:{String(item.time).padStart(2, "0")}</span><em>{item.kind}</em></button>)}</div></div>
          <p className="data-note">Fictional brand · Illustrative creative and data</p>
        </div></div>
        <div className="system-bottom"><div className="scene-tabs" aria-label="Story chapters"><button className="scene-tab" aria-current="step" onClick={() => goTo(0)}><span>01</span> Spend</button><span className="tab-line" /><button className="scene-tab" onClick={() => goTo(1)}><span>02</span> The reset</button><span className="tab-line" /><button className="scene-tab" onClick={() => goTo(3)}><span>03</span> Memory</button></div><span className="scroll-prompt">SCROLL TO FOLLOW THE MONEY <ArrowDown size={13} /></span><span className="memory-bottom-label">ONE MORE RESULT. ONE LESS UNKNOWN.</span></div><div className="film-progress-bar" aria-hidden="true" />
      </div>
    </main>
    <footer className="site-footer"><Logo /><span>Creative decisions that learn.</span><button onClick={() => setWaitlistOpen(true)}>Join early access <ArrowUpRight size={15} /></button></footer>
    <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}><DialogContent className="waitlist-dialog"><p className="eyebrow"><span className="blue-tick" />RESISTIVE / EARLY ACCESS</p><DialogTitle className="waitlist-title">Build a creative system<br />that learns.</DialogTitle><DialogDescription className="waitlist-description">Join early access to Resistive.</DialogDescription><FilmWaitlist /></DialogContent></Dialog>
    <Dialog open={recordOpen} onOpenChange={setRecordOpen}><DialogContent className="record-dialog"><p className="eyebrow">MORROW / M-021 / ILLUSTRATIVE RECORD</p><DialogTitle className="waitlist-title">The creative and<br />the context. Together.</DialogTitle><DialogDescription>Each decision stays connected to the original ad and its outcome.</DialogDescription><dl className="record-fields">{[["Shown", "18-second paid-social video"], ["Test period", "Round 01 · Days 1–7"], ["Hook", "Dark-desk problem"], ["Angle", "Better light, less effort"], ["Persona", "Small-space home worker"], ["Objection", "Is it easy to use?"], ["Mechanism timing", "Touch control at 0:09"], ["Proof", "Lamp demonstrated on desk"], ["Offer", "Standard product · No discount"], ["CTA", "Discover Morrow"], ["Visual structure", "Problem → creator → demo"], ["Audience", "Broad prospecting · Sample"], ["Spend", "$7,200"], ["Performance", "257 purchases · $28 CPA"], ["Result", "Eligible for further testing"]].map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></DialogContent></Dialog>
  </>;
}
