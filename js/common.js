/* Shared: header/footer, sound (Web Audio), speech, storage, reveal animations */
(function(){
  const pages=[["index.html","Home"],["writeup.html","Write-up"],["clinical-tests.html","Doctors' tests"],["tests.html","Practice"],["improve.html","Improve"],["remedies.html","Remedies"],["games.html","Games"],["log.html","My log"]];
  const here=(location.pathname.split("/").pop()||"index.html");
  const header=document.getElementById("site-header");
  if(header){
    header.className="site-header";
    header.innerHTML=`<a class="skip" href="#main">Skip to content</a><nav class="nav" aria-label="Main">
      <a class="brand" href="index.html"><span class="logo" aria-hidden="true">🧠</span><span>Memory for Life</span></a>
      <button id="menuBtn" class="icon-btn" aria-label="Open menu" aria-expanded="false">☰</button>
      <ul id="navList">${pages.map(([h,t])=>`<li><a class="link${h===here?' active':''}" href="${h}"${h===here?' aria-current="page"':''}>${t}</a></li>`).join("")}</ul>
      <button id="muteBtn" class="icon-btn" aria-label="Sound on. Click to mute" title="Sound on/off">🔊</button></nav>`;
    const mb=document.getElementById("menuBtn"),nl=document.getElementById("navList");
    mb.addEventListener("click",()=>{const o=nl.classList.toggle("open");mb.setAttribute("aria-expanded",o);});
  }
  const footer=document.getElementById("site-footer");
  if(footer){footer.innerHTML=`<div class="inner"><p><strong>Memory for Life</strong> — an educational site about memory in later life, with practice exercises and brain games.</p>
    <p class="small">⚠️ Nothing here is medical advice or a diagnosis. The practice exercises are informal, home-made activities — not validated clinical tests. If you or someone you love is worried about memory, please talk to a doctor.</p>
    <p class="small">Sources are listed on the <a href="writeup.html#references">Write-up</a> page. Scores are stored only in your own browser.</p>
    <p class="small site-version">Version 0.2 · <a href="https://github.com/Jalam1001/memory-in-old-age">Source on GitHub</a> · <a href="https://github.com/Jalam1001/memory-in-old-age/tree/v0.1">Version 0.1 (original site)</a></p></div>`;}

  /* ---------- Sound ---------- */
  let ctx=null; let muted=localStorage.getItem("mem.muted")==="1";
  function ac(){ if(!ctx){const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; ctx=new C();} if(ctx.state==="suspended") ctx.resume(); return ctx; }
  function tone(freq,dur=0.18,type="sine",vol=0.18,delay=0){
    if(muted) return; const c=ac(); if(!c) return;
    const t=c.currentTime+delay, o=c.createOscillator(), g=c.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t+dur+0.05);
  }
  const Sound={
    tone,
    click(){tone(660,0.07,"triangle",0.12)},
    flip(){tone(520,0.08,"triangle",0.12);tone(780,0.08,"triangle",0.08,0.05)},
    correct(){tone(660,0.12,"sine",0.18);tone(880,0.18,"sine",0.18,0.1)},
    wrong(){tone(220,0.25,"sawtooth",0.09);tone(180,0.3,"sawtooth",0.08,0.12)},
    win(){[523,659,784,1047].forEach((f,i)=>tone(f,0.22,"sine",0.18,i*0.13))},
    beep(){tone(880,0.1,"square",0.07)},
    note(i,dur=0.4){const f=[329.63,261.63,392.0,523.25,293.66,440,349.23,493.88,587.33][i%9];tone(f,dur,"sine",0.22)},
    get muted(){return muted}
  };
  function setMute(m){muted=m;localStorage.setItem("mem.muted",m?"1":"0");const b=document.getElementById("muteBtn");
    if(b){b.textContent=m?"🔇":"🔊";b.setAttribute("aria-label",m?"Sound off. Click to turn on":"Sound on. Click to mute");}
    if(m&&window.speechSynthesis) speechSynthesis.cancel();}
  document.addEventListener("click",e=>{if(e.target&&e.target.id==="muteBtn"){setMute(!muted);if(!muted)Sound.correct();toast(muted?"Sound off":"Sound on");}});
  setMute(muted);

  /* ---------- Speech ---------- */
  function speak(text,rate=0.85){ return new Promise(res=>{
    if(muted||!window.speechSynthesis){res();return;}
    const u=new SpeechSynthesisUtterance(text); u.rate=rate; u.lang="en-US"; u.onend=res; u.onerror=res;
    speechSynthesis.speak(u); setTimeout(res, 2500+text.length*120); });}

  /* ---------- Storage ---------- */
  const Store={
    get(k,d=null){try{const v=localStorage.getItem("mem."+k);if(v===null)return d;const x=JSON.parse(v);return x===null?d:x}catch(e){return d}},
    set(k,v){try{localStorage.setItem("mem."+k,JSON.stringify(v))}catch(e){}},
    best(k,score,higher=true){const b=this.get("best."+k);const better=b===null||(higher?score>b:score<b);if(better)this.set("best."+k,score);return {best:better?score:b,isNew:better&&b!==null,first:b===null};},
    log(k,entry){const a=this.get("log."+k,[]);a.push(Object.assign({t:Date.now()},entry));this.set("log."+k,a.slice(-30));return a;}
  };

  /* ---------- Utils ---------- */
  const U={
    shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},
    sample(a,n){return U.shuffle(a).slice(0,n)},
    sleep(ms){return new Promise(r=>setTimeout(r,ms))},
    $(s,r=document){return r.querySelector(s)}, $$(s,r=document){return [...r.querySelectorAll(s)]},
    el(tag,attrs={},html=""){const e=document.createElement(tag);for(const k in attrs){if(k==="class")e.className=attrs[k];else e.setAttribute(k,attrs[k]);}e.innerHTML=html;return e},
    fmtDate(t){return new Date(t).toLocaleString([], {month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}
  };

  function toast(msg){let t=document.getElementById("toast");if(!t){t=U.el("div",{id:"toast",class:"toast",role:"status","aria-live":"polite"});document.body.appendChild(t);}
    t.textContent=msg;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("show"),1800);}

  /* Tabs */
  function initTabs(root=document){U.$$("[role=tablist]",root).forEach(list=>{const tabs=U.$$("[role=tab]",list);
    function show(tab){tabs.forEach(t=>{const on=t===tab;t.setAttribute("aria-selected",on);t.tabIndex=on?0:-1;document.getElementById(t.getAttribute("aria-controls")).classList.toggle("active",on);});
      Sound.click(); if(history.replaceState) history.replaceState(null,"","#"+tab.getAttribute("aria-controls"));
      document.dispatchEvent(new CustomEvent("tabchange",{detail:tab.getAttribute("aria-controls")}));}
    tabs.forEach(t=>t.addEventListener("click",()=>show(t)));
    list.addEventListener("keydown",e=>{const i=tabs.indexOf(document.activeElement);if(i<0)return;let n=null;if(e.key==="ArrowRight")n=tabs[(i+1)%tabs.length];if(e.key==="ArrowLeft")n=tabs[(i-1+tabs.length)%tabs.length];if(n){n.focus();show(n);}});
    const h=location.hash.slice(1);const start=tabs.find(t=>t.getAttribute("aria-controls")===h);
    if(start){tabs.forEach(t=>{const on=t===start;t.setAttribute("aria-selected",on);document.getElementById(t.getAttribute("aria-controls")).classList.toggle("active",on);});}
  });}

  /* Reveal */
  function initReveal(){const els=U.$$(".reveal");if(!("IntersectionObserver" in window)){els.forEach(e=>e.classList.add("in"));return;}
    const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target);}}),{threshold:0.01,rootMargin:"0px 0px -40px 0px"});
    els.forEach(e=>io.observe(e));}

  /* Pace: relaxed (default, untimed) vs timed mode, saved per game */
  const Pace={
    bind(id,key,onChange){const s=document.getElementById(id);if(!s)return ()=>"relaxed";s.value=Store.get("pace."+key,"relaxed")==="timed"?"timed":"relaxed";
      s.addEventListener("change",()=>{Store.set("pace."+key,s.value);if(onChange)onChange(s.value);});return ()=>s.value;},
    ready(anchor,label="✅ I'm ready"){return new Promise(res=>{const b=U.el("button",{class:"btn teal ready-btn",type:"button"},label);anchor.appendChild(b);
      try{b.focus({preventScroll:true});}catch(e){} b.onclick=()=>{b.remove();Sound.click();res();};});},
    clear(anchor){if(anchor)anchor.innerHTML="";}
  };
  window.Sound=Sound; window.speak=speak; window.Store=Store; window.U=U; window.toast=toast; window.Pace=Pace;
  const boot=()=>{initTabs();initReveal();};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
