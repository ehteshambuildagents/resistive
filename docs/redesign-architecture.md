# Resistive: creative history into better next bets

Architecture proposal · 19 September 2026 · Planning only

This proposal follows the latest attached brief, which explicitly requests an audit and a new architecture before implementation. No application code, production assets, dependencies, or deployment configuration were changed for this deliverable.

## Direction

**Know what deserves to be tested next.**

Supporting line: **Resistive learns from your ads, forms the next bets, and makes the creative to test them.**

The audience is a performance marketer deciding where to spend production time and testing budget. The experience must demonstrate a chain of reasoning the visitor can inspect: creative decisions → observed performance → a possible pattern → several experiments → finished creative → what the market taught us.

Design read: a restrained product film for performance marketers, built around recognizable advertising material. Preserve Resistive's mark, Geist, near-black backgrounds and a limited blue accent. The creative itself occupies the stage. Typography explains changes in the creative. No simulated application shell.

Design dials: composition variety 6/10, motion intensity 6/10, information density 3/10. Motion intensity refers to continuous object transformations, not the number of moving objects.

## A. Product-story audit

### What the current build actually contains

The current source is more developed than the older supplied screenshots. It already has 16 history tiles, photographic product shots, a retention visualization, one master ScrollTrigger, one Lenis ticker integration, five storyboard frames, a playable sample edit, and a working waitlist integration. Recreating those foundations would waste work.

Fresh local-browser checks at timeline positions 0, 25.5, 40.6, 44.8, 70 and 93 found one ScrollTrigger and no page errors. This is evidence about those checkpoints, not a complete performance or overlap certification.

The central weakness is what the sequence implies about Resistive's decisions.

| Current evidence | Why it misrepresents or obscures the product | Required change |
| --- | --- | --- |
| The library sorts into formats, followed by 43 testimonial tests versus 4 demonstrations. | Counts explain coverage, not whether an idea deserves production and paid testing. A format is not one repeated idea. | Make creative attributes and their performance relationships primary. Coverage becomes one supporting annotation. |
| A static creator photograph appears above a retention bar chart. The only video element is the finished sample ad. | “Second by second” is asserted, but the visitor never sees the creative change at those seconds. | Scrub an actual illustrative edit with synchronized content annotations and a retention cursor. |
| Mobile hides every history frame at the inside-the-ad moment. | The phone visitor sees statistics without the creative they supposedly explain. | Keep one sufficiently large ad visible; simplify annotation count instead. |
| Nine review snippets cycle before a single next hypothesis. | Despite the disclaimer that comments are secondary, their screen time makes them feel like the reasoning engine. | Two short supporting quotations after the performance pattern. No standalone review-analysis act. |
| The hypothesis specifies an audience and a format without comparing ads. | The audience conclusion and strategic choice feel invented. | Attach the hypothesis to visible source ads, an explicit audience context, and a testable expectation. |
| The hypothesis runs from 43.5 to 46; its 1.5-unit entrance finishes at 45 and its exit starts at 45.1. | Approximately 0.1 timeline units are fully settled before the exit begins. At the current 900px desktop height, that is roughly 5px of scroll. This is a pacing defect, not a need for more easing. | Reserve distinct arrival, observation and departure intervals for each major decision. |
| Most narratives reuse a left headline/right object layout and the same entrance/exit helper. | Physical objects do not consistently carry the reasoning. The result feels like changing slides. | Vary composition according to the operation: inspect one ad, compare three, assemble evidence, select bets, produce. |
| The result is “24% lower CPA,” followed by “Evidence strengthened.” | The sequence never shows what was expected, what was wrong, or how the next choice changes. | Compare expectation with observed CTR, CVR and CPA; retain the audience boundary and unresolved question. |
| Reduced motion hides the visual evidence layers and history frames. | It preserves headlines but removes much of the explanation. | Provide the same evidence and decision chain in an unpinned, readable sequence. |

Source anchors: `components/film.tsx:81–105`, `lib/film-motion.ts:62–68`, `lib/film-motion.ts:150`, `app/motion.css`. `DESIGN.md` currently defines evidence as quotations and test counts; that guidance must change with implementation or it will reproduce the same mistake.

### Motion critique

| Before | After | Why |
| --- | --- | --- |
| Generic fade-and-lift on every narrative. | An outgoing object lands in the next operation before its context changes. | Viewers can follow the information's origin. |
| Retention bars animate without the ad playing through the same moments. | One time coordinate drives the ad frame, event marker and retention readout. | The motion demonstrates analysis rather than chart decoration. |
| One short range contains the complete hypothesis entrance, facts and exit. | Fewer words and a real settled interval. | Reading time comes from pacing, not scroll resistance. |
| Wheel multiplier 1.25 plus Lenis smoothing plus scrub. | Begin with wheel multiplier 1, native touch and modest smoothing; measure response. | Artificially accelerating input can make small reading intervals harder to land on. |
| Five frames converge, then a separate video fades in. | Match the edit's first frame exactly to the finished video's poster and initial composition. | The finished ad should visibly inherit the assembled shots. |
| Reduced motion removes evidence. | Static evidence, comparisons and outcomes remain available. | Accessibility must preserve the product explanation. |

**Verdict: block the current storytelling from being treated as finished.** The single-clock foundation is worth retaining. The major problems are motion that fails to explain the claimed operation, uneven pacing, and missing comparative reasoning. A new frame-rate guarantee cannot be made from source inspection or a few screenshots.

## B. What to preserve

- **Identity:** Resistive logo, Geist/Geist Mono, dark palette and restrained selection blue.
- **Objects:** 9:16 history frames; the five product-use compositions as the starting shot plan; recognizable reference product.
- **Motion ideas:** a historical ad recedes into its library; selected creative enlarges for inspection; approved shots enter an edit; an edit becomes one finished ad.
- **Engineering:** `Film` structure, dynamic motion loading and cancellation guard; scoped `gsap.matchMedia`; one master timeline and ScrollTrigger; one Lenis integration; reversible transforms; development-only seeking and trigger count.
- **Functionality:** existing waitlist API and form states, real video controls, captions, playback failure handling.
- **Verification:** screenshot and geometry checks, forward/reverse seeks, persistent node identity checks. Expand these where they currently mistake breakpoint changes for React remount testing.
- **Copy:** “It makes the ad” and “The market answers. Resistive learns.” retain their role, with plural ads at the production reveal.

## C. What to remove or replace

- Format-count reasoning as the central intelligence demonstration.
- The nine-quote carousel, repeated setup sentences, and unsupported audience specificity.
- “You have tested one idea 43 times.” A format does not equal an idea.
- The static retention-chart scene and unsynchronized “Second 6” explanation.
- Circular territory decoration, orbiting evidence, atmospheric duplicates and any returning abstract network metaphor.
- Repetitive left-copy/right-panel compositions and copy that merely names the animation.
- Arbitrary confidence percentages, unsupported flattening-return claims and invented historical date ranges.
- Automatic “result improved → confidence strengthened” logic.
- CSS, selectors and scene markup proven unused after the rebuild, including remnants of discarded territory/research treatments. Confirm references before deletion.
- Any generated image that changes the sample product's proportions or mechanism, even if it is attractive.

Do not replace GSAP/Lenis or add an animation framework. Do not rebuild backend functionality for a storytelling change.

## D. New cinematic storyboard

These are ten acts inside one film, not ten independently pinned sections. Percentages below are initial editorial weights, not snap points. Every transition is continuously reversible. A hold means no change while the user advances through a short reading interval; the page never blocks or traps scrolling.

### 1. The expensive decision · 0–6%

**Message / capability:** decide what deserves production and paid testing using what the brand has already learned.

**Visible:** one real-looking vertical ad, an understated suggestion of the library behind it, and one headline. No metric wall. The ad is an identifiable member of the coming library, not a duplicate hero asset.

**Incoming → outgoing object:** first appearance of historical Ad A → that exact frame moves into its library position.

**Camera / transition:** hold the first composition, then a restrained pullback reveals the surrounding history. Background objects become readable through size and position, not giant faded typography.

**Scroll / typography:** headline holds through the initial gentle wheel movement; one clean exit when the library becomes the focus. Display 56–88px desktop, approximately 38–44px phone, balanced into at most two lines where space allows.

**Copy:** “Know what deserves to be tested next.” Support: “Resistive learns from your ads, forms the next bets, and makes the creative to test them.”

**Why:** establish the costly decision and both capabilities before asking for more attention.

### 2. What the brand has already tried · 6–13%

**Message / capability:** Resistive understands a history of creative experiments, not a folder of filenames.

**Visible:** approximately 12 distinct-looking ads for one unbranded sample product. UGC, problem-led, demonstration, proof and offer edits have visibly different openings. No invented customer identity. “Illustrative sample creative” accompanies the material.

**Incoming → outgoing object:** Ad A joins the library → Ads A, B and C retain recognizable identities and Ad A becomes the inspection subject.

**Camera / transition:** the library arranges into a readable field; Ad A moves forward from its actual location. Two neighbors remain briefly recognizable before leaving the viewport.

**Scroll / typography:** a short library hold, then the approach into A. “Every ad has already taught you something.” One small context line only.

**Why:** establish source material and continuity without pretending 12 thumbnails represent 12 independently verified campaigns.

### 3. Inside one ad · 13–25%

**Message / capability:** Resistive reads what happens in the creative, moment by moment.

**Visible:** Ad A becomes the principal object. A scrubbed edit visibly progresses: creator and problem hook, benefit, product enters, product is held, explanation is delayed. Three or four key events are annotated one at a time. A small time cursor belongs to the frame.

**Incoming → outgoing object:** Ad A → the same Ad A with its timed creative events attached.

**Camera / transition:** push in, then stop camera movement so the viewer can watch the creative itself. Labels emerge from the relevant moment at the frame edge. They do not fan into a network.

**Scroll / typography:** scroll maps smoothly to edit time. At a stop the image and annotations settle at the same time. “It understands what happens inside the ad.” Event language stays literal: “Problem hook,” “Product appears,” “Mechanism not yet shown.”

**Why:** this is the signature proof of creative understanding. A still photograph and a moving chart do not pass this act.

### 4. Connect the creative to the result · 25–35%

**Message / capability:** creative decisions can be examined alongside performance, then compared across ads.

**Visible:** Ad A's event cursor aligns with retention loss. Pull back to reveal B and C. Ad B shows the mechanism earlier; C opens with a testimonial. Their frame-edge event markers share an aligned time reference. Initially show retention; then show CTR versus conversion/CPA. Never display every metric at once.

**Incoming → outgoing object:** annotated A → three recognizable annotated ads.

**Camera / transition:** widen from A to three frames. Preserve A's marker position as the other two join. Relevant metrics appear beside their own creative, not in detached dashboard tiles.

**Scroll / typography:** two settled comparison moments. “Attention is only part of the result.” The visitor sees A attract clicks but convert less efficiently than B. C provides another example of viewers leaving before explanation.

**Why:** establish the distinction between an appealing hook and an effective ad. Audience, offer, spend and reporting context remain explicit in the illustrative fixture.

### 5. Find a pattern worth testing · 35–43%

**Message / capability:** Resistive identifies relationships across creative history and distinguishes observation from explanation.

**Visible:** recognizable event phrases detach from their frames: “Mechanism shown earlier,” “More viewers reach the explanation,” “Better conversion efficiency.” These align into one evidence statement, retaining small A/B/C source references. Only now do two supporting customer questions join beneath it.

**Incoming → outgoing object:** creative events and performance observations → a sourced pattern statement.

**Camera / transition:** the three ads recede just enough to make room for the selected evidence. The evidence slides into reading order; no dots, threads, particle convergence or arbitrary paths.

**Scroll / typography:** performance conclusion first, brief pause, supporting quotation second. “Earlier demonstrations appear in the more efficient ads.” Qualification: “A pattern in this sample, not proof of cause.” Quotes: “How do I use it?” and “Do I need to set it up?”

**Why:** make the origin of the hypothesis visible and keep reviews in their proper supporting role.

### 6. Turn the pattern into a hypothesis · 43–50%

**Message / capability:** form a testable expectation, not a guaranteed prediction.

**Visible:** the phrase “earlier demonstration” becomes the proposed change. The observed loss-before-explanation remains immediately beneath it as the reason. The expected effect is visibly separate from the observed evidence.

**Incoming → outgoing object:** sourced pattern → hypothesis with evidence and expected outcome.

**Camera / transition:** move toward the evidence line while unrelated context leaves completely. Reuse meaningful phrases; do not animate individual letters for decoration.

**Scroll / typography:** a full settled reading interval. Label “Hypothesis.” Main copy: “Show the mechanism earlier. Test whether conversion improves.” Supporting line: “Keep the strong opening. Change when the product becomes clear.”

**Why:** the visitor must understand what will change, why it might help, and what would count as learning.

### 7. Allocate three next bets · 50–59%

**Message / capability:** Resistive proposes a portfolio across existing signals and less-explored territory.

**Visible:** three vertical creative treatments, not a generic three-card feature grid. Each has a distinct opening frame, one proposed change and a source reason. The three bets are 01 Iterate: keep the problem hook, show the mechanism before second 3; 02 Explore: lead immediately with open/insert/use; 03 Explore: open on the unanswered usage question, then demonstrate it.

**Incoming → outgoing object:** hypothesis → three explicit experiments → selected Bet 01 carried into production.

**Camera / transition:** widen from the hypothesis into the three treatments. Its words land within the relevant proposed creative. Bet 01 advances; the other two return to a compact experiment queue before leaving view. They remain part of the portfolio, not rejected losers.

**Scroll / typography:** “Three informed bets. Different things to learn.” Use plain-language Iterate/Explore labels; no invented allocation percentages or confidence scores.

**Why:** show disciplined exploration instead of one magical recommendation. Bet 03 carries the weakest evidence and says “Exploratory; supported by customer questions,” rather than borrowing the certainty of the performance-backed bet.

### 8. Create the ads · 59–85%

**Message / capability:** Resistive produces finished advertisements from its chosen experiments and the brand's actual assets.

**Visible:** the chosen frame remains through the production reveal and every production operation. Other material exits. The main statement takes over: “A recommendation is only the start.” Pause. “Resistive makes the ads.” This avoids an unverified claim about what most competing tools do.

**Incoming → outgoing object:** Bet 01 and its product reference → one finished ad plus its experiment identity.

**Camera / transition:** one continuous move through the operations below, with quiet stops where meaning needs time. No reintroduced section headers, loading dashboards or model-name displays.

| Production interval | Material transformation | What it proves |
| --- | --- | --- |
| 59–64 | Everything clears except the selected 9:16 object; the production statement resolves, then clears. | Ad creation is a core capability. |
| 64–68 | Bet fields rearrange into a brief: retain opening, mechanism before 3s, target audience/context, product reference. The same lines extend into five script beats. | Strategy constrains production. |
| 68–72 | Script beats become captions beneath five actual 9:16 shot compositions: retained hook, open product, insert cartridge, close, ready/CTA. | The storyboard is an advertisement in progress. |
| 72–75 | Reference product moves alongside each generated shot. Planned composition resolves to corresponding moving footage. | Brand assets persist through generation. |
| 75–78 | Shot 03 is compared with its reference: deliberately wrong square cartridge versus the established round cartridge. “Product mismatch. Rejected.” Correct replacement takes its place; “Approved.” | QA protects product identity. |
| 78–81 | Approved frames move, in order, into the edit. Voice, captions and music join as three minimal tracks. | The output includes editing and sound, not just disconnected clips. |
| 81–85 | The frames compress into one 9:16 ad. The final video's first image exactly matches the composed frame. Camera stops. Play/replay and sound controls remain available. | The visitor receives an actual finished creative. |

**Scroll / typography:** production labels name operations in small type. The reveal is the only huge headline. The finished-ad moment is quiet, with “Built from this bet. Ready to test.” Do not force the user to spend 15 seconds scrolling; stopping lets the ad play, continuing always works.

**Why:** make the second capability undeniable while preserving the first capability as the reason this ad exists.

### 9. Compare expectations with reality · 85–95%

**Message / capability:** the market tests the hypothesis; Resistive learns from both agreement and surprise.

**Visible:** the finished ad enters a single restrained distribution context labeled “Market test.” Its experiment identity and audience context remain. The original expectation returns beside the observed result: expected stronger conversion while retaining click response; observed slightly fewer clicks, better conversion and lower CPA. Show this as one short comparison, not an analytics screen.

**Incoming → outgoing object:** finished ad and original bet → result linked to the same experiment, plus a qualified learning.

**Camera / transition:** the ad recedes into its tested position. Its three result lines arrive back along that same path. The expectation is never substituted with a victory claim.

**Scroll / typography:** “The market answers.” Then “What changed our mind?” Learning: “Fewer clicks. More of those clicks became customers.” Boundary: “In this tested audience. Other audiences remain untested.” All values clearly labeled illustrative.

**Why:** demonstrate a system that can be corrected by reality. Historical correlations and one illustrative result do not prove a universal mechanism.

### 10. The next round starts with more knowledge · 95–100%, then normal flow

**Message / capability:** the brand's creative knowledge accumulates and changes the next experiment.

**Visible:** the new ad returns to the original library as a genuinely new experiment, carrying its result. Its learning changes the next-bet queue: mechanism timing gains support within the tested audience; whether that response transfers to another audience is still unknown. The next experiment emerges from that explicit gap.

**Incoming → outgoing object:** tested ad with learning → updated library/Brand Creative Model → next bet → Resistive mark and waitlist.

**Camera / transition:** pull back to the exact library arrangement introduced in Act 2, now changed by one visible addition. The changed recommendation comes from that addition. Stage ownership ends cleanly before the normal-flow waitlist.

**Scroll / typography:** “Your next round starts smarter.” Resolve to “So what deserves to be tested next?” Waitlist: “Bring your creative history. Build what comes next.”

**Why:** make compounding knowledge observable, then give the visitor a clear action. No decorative infinity loop is needed.

