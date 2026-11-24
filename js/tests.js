/* Practice exercises: word list, digit span, Corsi, reaction, story recall */
(function(){
const {$, $$, sleep, sample, shuffle} = U;
const norm = s => s.toLowerCase().replace(/[^a-z\s,]/g," ").split(/[\s,]+/).filter(Boolean).map(w=>w.replace(/(es|s)$/,""));
const mmss = ms => {const s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");};

/* ================= WORD LIST ================= */
const POOL=["apple","river","candle","garden","hammer","pillow","ticket","button","forest","kettle","window","rabbit","guitar","lemon","blanket","bridge","pencil","carpet","helmet","saddle","tulip","anchor","basket","cherry","mirror","violin","wallet","ladder","onion","jacket"];
let wordsActive=false;
function wordScore(list,text){const said=new Set(norm(text));const hits=list.filter(w=>said.has(w.replace(/(es|s)$/,"")));return hits;}
function chips(list,hits){return list.map(w=>`<span class="word-chip ${hits.includes(w)?"hit":"miss"}">${hits.includes(w)?"✓":"·"} ${w}</span>`).join("");}
$("#w-start").onclick=async()=>{
  if(wordsActive) return; wordsActive=true;
  const list=sample(POOL,10); const speakOn=$("#w-speak").checked;
  $("#w-result").innerHTML=""; $("#w-input").hidden=true; $("#w-startrow").hidden=true; $("#w-delayed").hidden=true;
  $("#w-status").textContent="Get ready…"; $("#w-show").textContent="3"; Sound.beep(); await sleep(800);
  $("#w-show").textContent="2"; Sound.beep(); await sleep(800); $("#w-show").textContent="1"; Sound.beep(); await sleep(800);
  for(let i=0;i<list.length;i++){
    $("#w-status").textContent=`Word ${i+1} of ${list.length}`; $("#w-show").textContent=list[i];
    const t=Date.now(); if(speakOn) await speak(list[i]); const rest=2000-(Date.now()-t); if(rest>0) await sleep(rest);
    $("#w-show").textContent=""; await sleep(300);
  }
  $("#w-show").textContent="✍️"; $("#w-status").textContent="Now recall"; $("#w-input").hidden=false; $("#w-answer").value=""; $("#w-answer").focus();
  $("#w-check").onclick=()=>{
    const hits=wordScore(list,$("#w-answer").value);
    const n=hits.length; n>=5?Sound.correct():Sound.flip();
    Store.log("words",{score:n,label:`${n}/10`});
    Store.set("pending.words",{list,t:Date.now(),imm:n});
    $("#w-input").hidden=true; $("#w-startrow").hidden=false; $("#w-start").textContent="↻ New word list"; wordsActive=false;
    $("#w-result").innerHTML=`<div class="result"><h3 style="margin-top:0">Immediate recall: ${n} of 10</h3><div class="progress"><span style="width:${n*10}%"></span></div>${chips(list,hits)}
      <p class="small">Recalling a list of 10 unrelated words after one viewing is genuinely hard at any age — few people get them all. In research versions the list is learned over 3 trials, and scores improve with each trial. Check back in 5+ minutes for delayed recall.</p></div>`;
    showDelayed();
  };
};
let wTimer=null;
function showDelayed(){
  const p=Store.get("pending.words"); if(!p){$("#w-delayed").hidden=true;return;}
  $("#w-delayed").hidden=false; clearInterval(wTimer);
  const tick=()=>{$("#w-elapsed").textContent=mmss(Date.now()-p.t);}; tick(); wTimer=setInterval(tick,1000);
}
$("#w-delay-btn").onclick=()=>{
  const p=Store.get("pending.words"); if(!p) return; clearInterval(wTimer);
  const mins=Math.round((Date.now()-p.t)/60000);
  $("#w-delayed").hidden=true; $("#w-result").innerHTML=""; $("#w-show").textContent="🕰️"; $("#w-status").textContent="Delayed recall";
  $("#w-input").hidden=false; $("#w-answer").value=""; $("#w-answer").focus();
  $("#w-check").onclick=()=>{
    const hits=wordScore(p.list,$("#w-answer").value); const n=hits.length; Sound.correct();
    const ret=p.imm?Math.round(100*n/p.imm):0;
    Store.log("words_delayed",{score:n,label:`${n}/10 after ${mins} min`}); Store.set("pending.words",null);
    $("#w-input").hidden=true;
    $("#w-result").innerHTML=`<div class="result"><h3 style="margin-top:0">Delayed recall: ${n} of 10 <span class="pill">after ${mins} min</span></h3>${chips(p.list,hits)}
     <p>You kept <strong>${ret}%</strong> of the ${p.imm} word(s) you recalled earlier.</p>
     <p class="small">Some loss after a delay is normal. A large, consistent drop between immediate and delayed recall — together with everyday problems — is something to mention to a doctor. One score on one day means very little.</p></div>`;
  };
};
showDelayed();

/* ================= DIGIT SPAN ================= */
let dRunning=false;
$("#d-start").onclick=async()=>{
  if(dRunning) return; dRunning=true; $("#d-start").disabled=true; $("#d-result").innerHTML="";
  const mode=$("#d-mode").value, speakOn=$("#d-speak").checked; let len=3, fails=0, best=0;
  while(len<=12){
    $("#d-len").textContent="Length: "+len;
    const seq=Array.from({length:len},()=>Math.floor(Math.random()*10));
    $("#d-show").textContent="Watch…"; await sleep(900);
    for(const d of seq){ $("#d-show").textContent=d; if(speakOn&&!Sound.muted) speak(String(d),1); else Sound.beep(); await sleep(900); $("#d-show").textContent=""; await sleep(200); }
    $("#d-show").textContent="?"; $("#d-prompt").textContent=mode==="f"?"Type the digits in the same order:":"Type the digits in REVERSE order (last one first):";
    $("#d-form").hidden=false; $("#d-answer").value=""; $("#d-answer").focus();
    const ans=await new Promise(res=>{$("#d-form").onsubmit=e=>{e.preventDefault();res($("#d-answer").value.replace(/\D/g,""));};});
    $("#d-form").hidden=true;
    const target=(mode==="f"?seq:seq.slice().reverse()).join("");
    if(ans===target){Sound.correct();best=len;fails=0;$("#d-show").textContent="✓";$("#d-best").textContent="Best: "+best;len++;}
    else{Sound.wrong();fails++;$("#d-show").innerHTML=`<span style="font-size:.5em">✗ It was ${target}</span>`;if(fails>=2)break;}
    await sleep(1300);
  }
  const key=mode==="f"?"digits_f":"digits_b";
  Store.log(key,{score:best,label:`${best} digits`}); const b=Store.best(key,best);
  $("#d-show").textContent="🏁"; $("#d-result").innerHTML=`<div class="result"><h3 style="margin-top:0">Your ${mode==="f"?"forward":"backward"} span: ${best} digits</h3>
   <p>Personal best: <strong>${b.best}</strong>${b.isNew?" 🎉 new best!":""}</p>
   <p class="small">Backward span is usually a little shorter than forward span. The best comparison is with your own earlier scores. Tip: grouping digits into chunks (like a phone number: 415 · 627 · 9) helps.</p></div>`;
  Sound.win(); dRunning=false; $("#d-start").disabled=false; $("#d-start").textContent="↻ Try again";
};

/* ================= CORSI ================= */
const POS=[[8,12],[42,6],[74,18],[20,40],[56,34],[80,52],[10,72],[44,64],[70,80]];
const board=$("#c-board"); const blocks=POS.map(([x,y],i)=>{const b=U.el("button",{"aria-label":"Block "+(i+1),style:`left:${x}%;top:${y}%`});board.appendChild(b);return b;});
let cAccept=null;
blocks.forEach((b,i)=>b.addEventListener("click",()=>{if(!cAccept)return;Sound.note(i,0.25);b.classList.add("tap");setTimeout(()=>b.classList.remove("tap"),250);cAccept(i);}));
$("#c-start").onclick=async()=>{
  $("#c-start").disabled=true; $("#c-result").innerHTML=""; let len=2,fails=0,best=0;
  while(len<=9){
    $("#c-len").textContent="Length: "+len; $("#c-status").textContent="Watch…"; await sleep(900);
    const seq=sample([0,1,2,3,4,5,6,7,8],len);
    for(const i of seq){blocks[i].classList.add("lit");Sound.note(i,0.4);await sleep(650);blocks[i].classList.remove("lit");await sleep(250);}
    $("#c-status").textContent="Your turn — tap in order";
    const taps=[]; const ok=await new Promise(res=>{cAccept=i=>{taps.push(i);if(taps[taps.length-1]!==seq[taps.length-1]){cAccept=null;res(false);}else if(taps.length===seq.length){cAccept=null;res(true);}};});
    if(ok){Sound.correct();best=len;fails=0;len++;$("#c-status").textContent="✓ Correct!";}
    else{Sound.wrong();fails++;$("#c-status").textContent="✗ Not quite";seq.forEach((i,k)=>setTimeout(()=>{blocks[i].classList.add("lit");setTimeout(()=>blocks[i].classList.remove("lit"),300)},k*350));if(fails>=2)break;}
    await sleep(1400);
  }
  Store.log("corsi",{score:best,label:`${best} blocks`}); const b=Store.best("corsi",best);
  $("#c-status").textContent="Finished"; Sound.win();
  $("#c-result").innerHTML=`<div class="result"><h3 style="margin-top:0">Your block span: ${best}</h3><p>Personal best: <strong>${b.best}</strong>${b.isNew?" 🎉 new best!":""}</p><p class="small">Visual-spatial span is typically a little shorter than digit span. Practising the Pattern Grid game trains a similar skill.</p></div>`;
  $("#c-start").disabled=false; $("#c-start").textContent="↻ Try again";
};

/* ================= REACTION ================= */
const pad=$("#r-pad"); let rState="idle", rTimes=[], rStart=0, rTO=null;
function rNext(){ rState="wait"; pad.className="react-pad wait"; pad.textContent="Wait for green…"; rTO=setTimeout(()=>{rState="go";pad.className="react-pad go";pad.textContent="TAP NOW!";Sound.beep();rStart=performance.now();},1500+Math.random()*2500); }
function rTap(){
  if(rState==="idle"||rState==="done"){rTimes=[];$("#r-result").innerHTML="";$("#r-trial").textContent="Try 1 / 5";rNext();return;}
  if(rState==="wait"){clearTimeout(rTO);Sound.wrong();pad.className="react-pad";pad.textContent="Too soon! Tap to retry this one";rState="retry";return;}
  if(rState==="retry"){rNext();return;}
  if(rState==="go"){const ms=Math.round(performance.now()-rStart);rTimes.push(ms);Sound.correct();
    $("#r-trial").textContent=`Try ${rTimes.length} / 5`;
    if(rTimes.length>=5){rState="done";pad.className="react-pad";const avg=Math.round(rTimes.reduce((a,b)=>a+b)/rTimes.length),best=Math.min(...rTimes);
      pad.textContent=`Average ${avg} ms — tap to go again`;Store.log("reaction",{score:avg,label:`${avg} ms avg`});const b=Store.best("reaction",avg,false);
      $("#r-result").innerHTML=`<div class="result"><h3 style="margin-top:0">Average: ${avg} ms · fastest: ${best} ms</h3><p>Your times: ${rTimes.join(", ")} ms. Personal best average: <strong>${b.best} ms</strong>${b.isNew?" 🎉":""}</p><p class="small">Lower is faster. Phones and screens add their own delay, so compare only with your own results on the same device. Tiredness, some medicines and alcohol slow reaction time.</p></div>`;Sound.win();}
    else{pad.className="react-pad";pad.textContent=`${ms} ms — tap for next`;rState="between";}
    return;}
  if(rState==="between"){$("#r-trial").textContent=`Try ${rTimes.length+1} / 5`;rNext();}
}
pad.addEventListener("pointerdown",e=>{e.preventDefault();rTap();});
pad.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();rTap();}});
document.addEventListener("keydown",e=>{if(e.key===" "&&$("#t-react").classList.contains("active")&&document.activeElement!==pad&&!/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)){e.preventDefault();rTap();}});

/* ================= STORY ================= */
const STORY="On Tuesday morning, Maria Lopez walked to the market on Elm Street. She bought three red apples, a loaf of bread, and fresh flowers for her sister. On the way home it began to rain, so she waited under the awning of a bakery. A kind young man offered her his umbrella and walked with her to the bus stop. Maria thanked him and gave him one of her apples.";
const UNITS=[["Tuesday",/tuesday/],["morning",/morning/],["Maria",/maria/],["Lopez",/lopez/],["walked",/walk/],["market",/market|shop/],["Elm Street",/elm/],["three",/three|\b3\b/],["red",/red/],["apples",/apple/],["bread",/bread|loaf/],["flowers",/flower/],["for her sister",/sister/],["it rained",/rain/],["waited / sheltered",/wait|shelter/],["bakery",/baker/],["young man",/\bman\b|young|guy|gentleman/],["umbrella",/umbrella/],["bus stop",/\bbus/],["thanked / gave an apple",/thank|gave|give/]];
function storyScore(text){const t=text.toLowerCase();return UNITS.map(([n,re])=>[n,re.test(t)]);}
function storyResult(res,label){const n=res.filter(r=>r[1]).length;return {n,html:`<div class="result"><h3 style="margin-top:0">${label}: ${n} of 20 ideas</h3><div class="progress"><span style="width:${n*5}%"></span></div>${res.map(([u,ok])=>`<span class="word-chip ${ok?"hit":"miss"}">${ok?"✓":"·"} ${u}</span>`).join("")}<p class="small">Scoring here is automatic and approximate (it looks for key words). Clinicians score story recall by hand.</p></div>`};}
let sTimer=null;
$("#s-start").onclick=async()=>{
  $("#s-result").innerHTML=""; $("#s-delayed").hidden=true; $("#s-input").hidden=true;
  $("#s-story").hidden=false; $("#s-story").textContent=STORY; $("#s-start").hidden=true; $("#s-done").hidden=false; Sound.flip();
  if($("#s-speak").checked) speak(STORY,0.85);
};
$("#s-done").onclick=()=>{ if(window.speechSynthesis) speechSynthesis.cancel();
  $("#s-story").hidden=true; $("#s-done").hidden=true; $("#s-input").hidden=false; $("#s-answer").value=""; $("#s-answer").focus();
  $("#s-check").onclick=()=>{const r=storyResult(storyScore($("#s-answer").value),"Immediate recall");Sound.correct();
    Store.log("story",{score:r.n,label:`${r.n}/20`});Store.set("pending.story",{t:Date.now(),imm:r.n});
    $("#s-input").hidden=true;$("#s-result").innerHTML=r.html;$("#s-start").hidden=false;$("#s-start").textContent="↻ Read the story again";showStoryDelayed();};
};
function showStoryDelayed(){const p=Store.get("pending.story");if(!p){$("#s-delayed").hidden=true;return;}$("#s-delayed").hidden=false;clearInterval(sTimer);
  const tick=()=>$("#s-elapsed").textContent=mmss(Date.now()-p.t);tick();sTimer=setInterval(tick,1000);}
$("#s-delay-btn").onclick=()=>{const p=Store.get("pending.story");if(!p)return;clearInterval(sTimer);const mins=Math.round((Date.now()-p.t)/60000);
  $("#s-delayed").hidden=true;$("#s-result").innerHTML="";$("#s-input").hidden=false;$("#s-answer").value="";$("#s-answer").focus();
  $("#s-check").onclick=()=>{const r=storyResult(storyScore($("#s-answer").value),`Delayed recall (${mins} min)`);Sound.correct();
    Store.log("story_delayed",{score:r.n,label:`${r.n}/20 after ${mins} min`});Store.set("pending.story",null);$("#s-input").hidden=true;
    $("#s-result").innerHTML=r.html+`<p>Earlier you recalled ${p.imm} ideas; now ${r.n}.</p>`;};};
showStoryDelayed();

/* ================= HISTORY ================= */
const NAMES={words:"Word list — immediate",words_delayed:"Word list — delayed",digits_f:"Digit span forward",digits_b:"Digit span backward",corsi:"Block tapping",reaction:"Reaction time",story:"Story — immediate",story_delayed:"Story — delayed"};
function renderHistory(){const rows=[];for(const k in NAMES){Store.get("log."+k,[]).forEach(e=>rows.push([e.t,NAMES[k],e.label||e.score]));}
  rows.sort((a,b)=>b[0]-a[0]);$("#h-body").innerHTML=rows.length?rows.slice(0,60).map(r=>`<tr><td>${r[1]}</td><td>${U.fmtDate(r[0])}</td><td><strong>${r[2]}</strong></td></tr>`).join(""):'<tr><td colspan="3" class="muted">No results yet — try a test!</td></tr>';}
document.addEventListener("tabchange",e=>{if(e.detail==="t-history")renderHistory();});
renderHistory();
$("#h-clear").onclick=()=>{if(confirm("Clear all saved practice-exercise results on this device?")){for(const k in NAMES){Store.set("log."+k,[]);Store.set("best."+k,null);}Store.set("pending.words",null);Store.set("pending.story",null);renderHistory();toast("History cleared");}};
})();
