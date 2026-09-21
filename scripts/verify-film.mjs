import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
const require = createRequire('C:/Users/ALI PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const { chromium } = require('playwright');
const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-background-timer-throttling']});
const results = [];
for (const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['m393',393,852],['m430',430,932]]) {
 const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.FILM_URL ?? 'http://localhost:3000/'); await page.waitForFunction(()=>window.__resistiveMotion); await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(500);
 for(const t of [0,13,24,27,42.8,45,54.8,62,69,75.5,80.4,87,92.6,95.5,99.8,101.2,104.6,109,113,117.5,120.5,123.5,126,127.5,130,132,134.5,137,139.5,141,143,146.5,149]) {
  await page.evaluate(t=>window.__resistiveMotion.seek(t),t);await page.waitForTimeout(300);
  const report=await page.evaluate(()=>{
   const visible=e=>{for(let p=e;p;p=p.parentElement){const s=getComputedStyle(p);if(s.visibility==='hidden'||s.display==='none'||+s.opacity<.08)return false;}return true;};
   const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
   const hit=(a,b)=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
   const parts=e=>{const kids=[...e.querySelectorAll('*')].filter(visible).map(box).filter(k=>k.w>0&&k.h>0);return kids.length?kids:[box(e)];};
   const n=[...document.querySelectorAll('.narrative')].filter(visible);
   const texts=[...document.querySelectorAll('.narrative h1,.narrative h2,.visual-layer p,.visual-layer strong,.visual-layer blockquote,.visual-layer span,.cmp-track b,.pat-track b')].filter(visible);
   const off=texts.filter(e=>{const b=box(e);return b.x<0||b.y<64||b.right>innerWidth+1||b.bottom>innerHeight-35;}).map(e=>e.textContent);
   const overlap=[];for(const a of n)for(const b of [...document.querySelectorAll('.visual-layer,.shot-frame')].filter(visible)){const bs=b.classList.contains('visual-layer')?parts(b):[box(b)];if(parts(a).some(pa=>bs.some(pb=>hit(pa,pb))))overlap.push([a.className,b.className]);}
   // a tile can sit at opacity 1 and still be halfway across the copy, so
   // composition is judged on geometry
   const tiles=[...document.querySelectorAll('.history-frame,.shot-frame')].filter(visible);
   const bottom=[...document.querySelectorAll('.film-bottom')].filter(visible);
   const strays=[];
   for(const t of tiles){const b=box(t);
     if(b.right<-2||b.x>innerWidth+2||b.bottom<-2||b.y>innerHeight+2)strays.push(['outOfFrame',t.className]);
     const faint=+getComputedStyle(t).opacity<0.25;if(!faint)for(const a of n)if(parts(a).some(pa=>hit(b,pa)))strays.push(['tileOverNarrative',t.className]);
     for(const f of bottom)if(hit(b,box(f)))strays.push(['tileOverFooter',t.className]);}
   for(const a of n)for(const f of bottom)if(parts(a).some(pa=>hit(pa,box(f))))strays.push(['narrativeOverFooter',a.className]);const LAYERS=[...document.querySelectorAll('.visual-layer')].filter(visible);const ALLOW=new Set(['adplay|analysis']);for(let i=0;i<LAYERS.length;i++)for(let j=i+1;j<LAYERS.length;j++){const la=LAYERS[i],lb=LAYERS[j];const key=[la.className.split(' ')[0],lb.className.split(' ')[0]].sort().join('|');if(ALLOW.has(key))continue;if(parts(la).some(pa=>parts(lb).some(pb=>hit(pa,pb))))strays.push(['layerOverLayer',key]);}const FRAMES=[...document.querySelectorAll('.shot-frame')].filter(visible);const ALLOW2=new Set(['finished-video','script-lines']);for(const L of LAYERS)for(const fr of FRAMES){const k=L.className.split(' ')[0];if(ALLOW2.has(k))continue;if(parts(L).some(pa=>hit(pa,box(fr))))strays.push(['layerOverFrame',k]);}for(const L of [...document.querySelectorAll('.visual-layer')].filter(visible))for(const f of bottom)if(parts(L).some(pl=>hit(pl,box(f))))strays.push(['layerOverFooter',L.className]);
   // effective opacity through ancestors: how dominant an idea really is
   const eff=e=>{let o=1;for(let q=e;q;q=q.parentElement){const c=getComputedStyle(q);if(c.visibility==='hidden'||c.display==='none')return 0;o*=+c.opacity;}return o;};
   const groups={compare:'.cmp-row',pattern:'.an-line',quotes:'.an-qs blockquote',hypothesis:'.hypo-line',portfolio:'.bet',brief:'.production-brief',script:'.script-line',board:'.shot-frame',qa:'.qa-readout',edit:'.edit-tracks',finished:'.finished-video',market:'.mk-expect',learning:'.mk-learn',nextbet:'.nb-line',model:'.mn-row',resolve:'.rs-line'};
   const dominant=Object.entries(groups).filter(([,sel])=>[...document.querySelectorAll(sel)].some(e=>eff(e)>0.8)).map(([k])=>k);
   const sig=e=>e.className.split(' ')[0];const snap=()=>new Map([...document.querySelectorAll('.history-frame,.visual-layer,.narrative,.cmp-row,.pat-row,.play-event,.hypo-way,.play-shot')].map(e=>[e,getComputedStyle(e).transform+'|'+getComputedStyle(e).opacity]));
   const a0=snap();window.__resistiveMotion.master.time(window.__resistiveMotion.master.time()+0.05,false);const a1=snap();
   const moving=new Set();for(const [e,v] of a0)if(a1.get(e)!==v)moving.add(sig(e));
   return {dominant,time:window.__resistiveMotion.master.time(),phase:window.__resistiveMotion.state().phase,movingGroups:[...moving],narrative:n.map(e=>e.querySelector('h1,h2')?.textContent??''),off,overlap,strays,triggers:window.__resistiveMotion.triggers(),videoReady:document.querySelector('video').readyState};
  });results.push({name,t,...report});
  if((name==='desktop'||name==='mobile')&&[0,24,45,62,75.5,92.6,99.8,109,117.5,120.5,126,127.5,130,134.5,137,141,143,149].includes(t))await page.screenshot({path:`docs/verification/${name}-${t}.png`});
 }
 // Boundary and reverse seeks, without replacing persistent nodes.
 results.push({name,sweep:await page.evaluate(()=>{const m=window.__resistiveMotion;const frames=[...document.querySelectorAll('.shot-frame')];const bad=[];const STEPS=Math.round(m.total*4);for(const reverse of [false,true])for(let i=0;i<=STEPS;i++){m.master.time((reverse?STEPS-i:i)/4);const n=[...document.querySelectorAll('.narrative')].filter(e=>getComputedStyle(e).visibility!=='hidden'&&+getComputedStyle(e).opacity>.08);if(n.length>1)bad.push(m.master.time());}return {overlapTimes:bad,persistent:frames.every((n,i)=>n===document.querySelectorAll('.shot-frame')[i]),triggers:m.triggers()};})});
 // Breakpoint remounts exercise GSAP context / Lenis teardown repeatedly.
 const counts=[];for(const width of [680,1000,680,1000]){await page.setViewportSize({width,height});await page.waitForTimeout(180);counts.push(await page.evaluate(()=>window.__resistiveMotion.triggers()));}
 results.push({name,remountTriggerCounts:counts,errors});await page.close();
}
const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.goto(process.env.FILM_URL ?? 'http://localhost:3000/');await reduced.waitForFunction(()=>document.querySelector('.film-site').dataset.motion==='reduced');await reduced.waitForFunction(()=>getComputedStyle(document.querySelector('.n-history')).visibility==='visible');results.push({reduced:await reduced.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,width:innerWidth,headings:[...document.querySelectorAll('.narrative')].filter(e=>getComputedStyle(e).visibility!=='hidden').length,stagePosition:getComputedStyle(document.querySelector('.film-stage')).position}))});
await fs.writeFile('docs/verification/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({checkpoints:results.filter(r=>r.t!==undefined).length,issues:results.filter(r=>r.off?.length||r.overlap?.length||r.strays?.length||r.movingGroups?.length>4||r.dominant?.length>2||r.errors?.length),sweeps:results.filter(r=>r.sweep),remounts:results.filter(r=>r.remountTriggerCounts),reduced:results.at(-1)},null,2));await browser.close();
