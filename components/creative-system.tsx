"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import FilmWaitlist from "@/components/film-waitlist";

const chapters = ["The spend", "The question", "The reset", "The memory"];
const experiments = [
  { id: "01", hook: "A better way.", type: "statement", outcome: "Stopped early", direction: "negative" },
  { id: "02", hook: "See the difference.", type: "comparison", outcome: "Attention ↑ / Sales ↓", direction: "mixed" },
  { id: "03", hook: "Here’s how it works.", type: "mechanism", outcome: "Kept scaling", direction: "positive" },
  { id: "04", hook: "Made for your day.", type: "statement", outcome: "Couldn’t scale", direction: "neutral" },
  { id: "05", hook: "Less. But better.", type: "comparison", outcome: "Stopped early", direction: "negative" },
];
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const ease = (n: number) => n * n * (3 - 2 * n);

export default function CreativeSystem() {
  const root = useRef<HTMLDivElement>(null);
  const scrollTrack = useRef<HTMLElement>(null);
  const animationTime = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [paused, setPaused] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  useEffect(() => {
    const el = root.current;
    const track = scrollTrack.current;
    if (!el || !track) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const number = el.querySelector<HTMLElement>("[data-spend]");
    const copies = [...el.querySelectorAll<HTMLElement>("[data-copy]")];
    const objects = [...el.querySelectorAll<HTMLElement>("[data-experiment]")];
    let frame = 0, activeTime = animationTime.current, lastTime = 0, lastCount = -1, currentChapter = -1, lastCounterWrite = 0;
    let dirty = true, progress = 0, previousProgress = -1;
    const updateScroll = () => { dirty = true; previousProgress = -1; schedule(); };
    const stopped = () => paused || waitlistOpen || media.matches || document.hidden;
    function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(render); }
    function render(now: number) {
      frame = 0;
      const delta = lastTime ? Math.min(now - lastTime, 60) : 0;
      lastTime = now;
      if (!stopped()) activeTime += delta;
      animationTime.current = activeTime;
      const reduced = media.matches;
      if (dirty) {
        progress = clamp(window.scrollY / Math.max(track!.offsetHeight - window.innerHeight, 1), 0, 3);
        // Each chapter owns one viewport; the final stop is exactly chapter three.
        progress *= 3;
        progress = clamp(progress, 0, 3);
        dirty = false;
      }
      const scene = Math.round(progress);
      if (currentChapter !== scene) {
        currentChapter = scene;
        el!.dataset.scene = String(scene);
        setChapter(scene);
        el!.querySelectorAll<HTMLElement>(".funding-label,.result-summary,.outcome").forEach(node => node.setAttribute("aria-hidden", String(scene > 1)));
        el!.querySelector(".next-batch")?.setAttribute("aria-hidden", String(scene !== 2));
        el!.querySelector(".memory-annotations")?.setAttribute("aria-hidden", String(scene !== 3));
        copies.forEach((copy, i) => { copy.inert = i !== scene; copy.setAttribute("aria-hidden", String(i !== scene)); });
      }
      if (previousProgress !== progress) {
        previousProgress = progress;
        const reset = ease(clamp((progress - 1.15) / .65));
        const remember = ease(clamp((progress - 2.1) / .75));
        el!.style.setProperty("--reset", String(reset));
        el!.style.setProperty("--memory", String(remember));
        el!.style.setProperty("--history", String(1 - ease(clamp((progress - .9) / .7))));
        el!.style.setProperty("--progress", String(progress / 3));
        copies.forEach((copy, i) => {
          const distance = progress - i;
          const visible = Math.abs(distance) < .49;
          copy.style.visibility = visible ? "visible" : "hidden";
          copy.style.opacity = visible ? String(clamp((.49 - Math.abs(distance)) / .16)) : "0";
          copy.style.transform = `translate3d(0, ${reduced ? 0 : -distance * 64}px, 0)`;
          copy.style.clipPath = distance < 0 ? `inset(0 0 ${clamp(-distance / .5) * 100}% 0)` : "none";
        });
        objects.forEach((object, i) => {
          // The same five DOM objects move from funded experiments into retained evidence.
          const mobile = window.innerWidth <= 700;
          const heroX = i * (mobile ? 34 : 20), memoryX = i === 2 ? (mobile ? 7 : 8) : (i < 2 ? i * 16 : 66 + (i - 3) * 16);
          const x = heroX + (memoryX - heroX) * remember;
          const y = i === 2 ? -45 * remember : 190 * remember;
          const scale = i === 2 ? 1 + remember * (mobile ? .4 : 1.0) : 1 - remember * .78;
          object.style.left = `${x}%`;
          object.style.transform = `translate3d(0, ${y + reset * (1 - remember) * 95}px, 0) scale(${scale})`;
          object.style.opacity = String((1 - reset * (1 - remember)) * (i === 2 ? 1 : 1 - remember));
        });
      }
      const seconds = activeTime / 1000;
      const intro = reduced ? 1 : clamp(seconds / 6.5);
      const introState = intro >= 1 || scene > 0 ? "ready" : "counting";
      if (el!.dataset.intro !== introState) el!.dataset.intro = introState;
      if (el!.dataset.paused !== String(stopped())) el!.dataset.paused = String(stopped());
      const amount = reduced || scene > 0 ? 1000000 : Math.floor(1000000 * ease(intro) + Math.max(0, seconds - 7.2) * 143);
      if (amount !== lastCount && number && (now - lastCounterWrite > 100 || stopped() || scene > 0)) { lastCounterWrite = now; number.textContent = `$${amount.toLocaleString("en-US")}${amount >= 1000000 ? "+" : ""}`; lastCount = amount; }
      if (!stopped() && scene === 0) schedule();
    }
    const visibility = () => { lastTime = 0; el.dataset.paused = String(stopped()); if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else { dirty = true; schedule(); } };
    const preference = () => { lastTime = 0; dirty = true; schedule(); };
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", preference);
    schedule();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", updateScroll); window.removeEventListener("resize", updateScroll); document.removeEventListener("visibilitychange", visibility); media.removeEventListener("change", preference); };
  }, [paused, waitlistOpen]);

  function goToScene(index: number) {
    if (!scrollTrack.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: (scrollTrack.current.offsetHeight - window.innerHeight) * index / 3, behavior: reduced ? "instant" : "smooth" });
  }

  return (
    <div className="creative-root" ref={root} data-scene="0" data-intro="counting" data-paused="false">
      <a className="skip-link" href="#narrative">Skip to story</a>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="Resistive home" onClick={(e) => { e.preventDefault(); goToScene(0); }}><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>resistive</a>
        <span className="header-category">Creative R&D for performance brands</span>
        <button className="access-link" onClick={() => setWaitlistOpen(true)}>Join early access <ArrowUpRight size={16} /></button>
      </header>

      <main id="narrative" className="narrative-track" ref={scrollTrack}>
        <div className="narrative-stage">
          <div className="stage-topline"><span>THE COST OF STARTING OVER</span><span className="illustration-label">Illustrative example</span></div>
          <div className="chapter-copy" data-copy="0">
            <p className="eyebrow">YOUR MEDIA BUDGET, AT WORK</p>
            <div className="spend-number" data-spend aria-hidden="true">$0</div>
            <span className="sr-only">One million dollars in illustrative ad spend.</span>
            <p className="spend-caption">spent testing creative.</p>
            <h1>Still guessing<br />what to make next?</h1>
            <p className="supporting">Spend buys results.<br />It doesn’t automatically buy understanding.</p>
          </div>
          <div className="chapter-copy question-copy" data-copy="1" aria-hidden="true" inert>
            <p className="eyebrow">THE CAMPAIGN IS OVER</p>
            <p className="quiet-number">$1M spent.</p>
            <h2>What did you<br />actually learn?</h2>
            <p className="supporting">You know which ad won.<br />Do you know what made it work?</p>
            <div className="unanswered"><span>The hook?</span><span>The proof?</span><span>The timing?</span></div>
          </div>
          <div className="chapter-copy reset-copy" data-copy="2" aria-hidden="true" inert>
            <p className="eyebrow">NEXT CAMPAIGN. SAME QUESTION.</p>
            <h2>Another round.<br /><span className="muted">Another guess.</span></h2>
            <p className="supporting">Most teams remember the winner.<br />They lose the experiment.</p>
            <p className="thesis-small">That’s a creative learning problem.</p>
          </div>
          <div className="chapter-copy memory-copy" data-copy="3" aria-hidden="true" inert>
            <p className="eyebrow decision-color">RESISTIVE RETAINS THE EXPERIMENT</p>
            <h2>Your ads<br />spend money.<br /><span className="memory-line">They should<br /> build memory.</span></h2>
            <p className="supporting">Keep the creative. The decisions inside it.<br />And the evidence that comes back.</p>
            <button className="memory-cta" onClick={() => setWaitlistOpen(true)}>Build on what you learn <ArrowUpRight size={17} /></button>
          </div>

          <div className="experiment-system" aria-label="Illustrative creative experiments transform into retained memory">
            <div className="funding-label"><span>{chapter === 0 ? "MEDIA SPEND" : "CAMPAIGN RESULTS"}</span><span className="system-live">{chapter === 0 ? "ALLOCATING" : "ROUND COMPLETE"}</span></div>
            <div className="funding-rail"><i className="spend-packet" /></div>
            <div className="experiments">
              {experiments.map((experiment, i) => (
                <div className={`experiment experiment-${i} ${experiment.type}`} data-experiment key={experiment.id} style={{ left: `${i * 20}%`, "--delay": `${i * -.8}s` } as React.CSSProperties}>
                  <div className="feed-line"><i /></div>
                  <div className="experiment-id">CREATIVE {experiment.id}</div>
                  <div className="creative-frame">
                    <span className="frame-index">{experiment.id} / R01</span>
                    <div className="abstract-ad"><span>{experiment.hook}</span><div className="ad-structure"><b /><b /><b /></div><small>Discover the difference ↗</small></div>
                    <div className="scan-line" />
                  </div>
                  <div className="outcome" data-direction={experiment.direction}><i />{experiment.outcome}</div>
                  <div className="record-label">EVIDENCE {experiment.id}</div>
                </div>
              ))}
            </div>
            <div className="result-summary"><span><span className="desktop-count">5</span><span className="mobile-count">3</span> experiments.</span><span>Results recorded.</span><strong>Reasons missing.</strong></div>
            <div className="next-batch">
              <div className="batch-heading"><span>CREATIVE BRIEF / NEXT ROUND</span><span>06</span></div>
              <div className="blank-question">What should<br />we make next?<span className="cursor" /></div>
              <div className="empty-field"><span>Hypothesis</span><span>—</span></div>
              <div className="empty-field"><span>Supporting evidence</span><span>—</span></div>
              <div className="empty-field"><span>Reason to invest</span><span>—</span></div>
              <p>No learning carried forward.</p>
            </div>
            <div className="memory-annotations">
              <div className="memory-status"><span className="memory-pulse" />CREATIVE 03 / RETAINED</div>
              <div className="annotation annotation-hook"><span>00:00 / HOOK</span><strong>Lead with the mechanism</strong><i /></div>
              <div className="annotation annotation-mechanism"><span>00:02 / MECHANISM</span><strong>Show how it works</strong><i /></div>
              <div className="annotation annotation-proof"><span>00:09 / PROOF</span><strong>Demonstrate the change</strong><i /></div>
              <div className="memory-evidence"><span>DECISION + CONTEXT + RESULT</span><p>The result stays attached<br />to the creative that produced it.</p></div>
              <div className="memory-ingest"><span className="ingest-line" /><span>Experiment preserved. Next question informed.</span></div>
            </div>
          </div>

          <footer className="stage-footer">
            <nav className="chapter-nav" aria-label="Story chapters">{chapters.map((name, i) => <button key={name} aria-label={`0${i + 1} ${name}`} className={chapter === i ? "active" : ""} aria-current={chapter === i ? "step" : undefined} onClick={() => goToScene(i)}><span>0{i + 1}</span><span className="chapter-name">{name}</span></button>)}</nav>
            <button className="continue-button" onClick={() => goToScene(chapter === 3 ? 0 : chapter + 1)}>{chapter === 3 ? "Back to the beginning" : "Follow the spend"}<ArrowDown size={14} /></button>
            <button className="motion-toggle" aria-label={paused ? "Resume animation" : "Pause animation"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>
          </footer>
          <div className="story-progress" />
        </div>
      </main>
      <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
        <DialogContent className="early-access-dialog" showCloseButton={false}>
          <DialogClose className="dialog-close" aria-label="Close early access form"><X size={20} /></DialogClose>
          <p className="eyebrow decision-color">RESISTIVE / EARLY ACCESS</p>
          <DialogTitle>Make every test<br />worth keeping.</DialogTitle>
          <DialogDescription>Creative R&D for performance brands. Join the list for early access.</DialogDescription>
          <FilmWaitlist />
        </DialogContent>
      </Dialog>
    </div>
  );
}
