/* Memory games: Match, Simon, What Changed, Grocery, Pattern, N-Back */
(function(){
const {$, $$, sleep, sample, shuffle, el} = U;
const showBest=(id,key,suffix="")=>{const b=Store.get("best."+key);$(id).textContent="Best: "+(b===null?"–":b+suffix);};

/* ============ PICTURE PAIRS (memory match) ============ */
const FACES=["🍎","🌻","🐶","🚗","🎈","🐟","🌙","⭐","🍰","🎩","🦋","☕","🔑","🎵","🍋","🐢","🌈","🏠"];
let mState=null;
function mBestKey(){return "match_"+$("#m-level").value;}
function mCols(n){const c=2*n,narrow=innerWidth<640;if(c<=8)return 4;if(c<=16)return 4;if(c===20)return narrow?4:5;if(c===24)return narrow?4:6;return narrow?5:6;}
const mTimerOn=()=>$("#m-timer").checked;
$("#m-timer").checked=Store.get("match.timer",false);
$("#m-timer").onchange=()=>{Store.set("match.timer",mTimerOn());$("#m-time").hidden=!mTimerOn();};
$("#m-time").hidden=!mTimerOn();
function mStart(){
  const n=+$("#m-level").value; const faces=sample(FACES,n); const deck=shuffle([...faces,...faces]);
  const cols=mCols(n); const board=$("#m-board"); board.style.gridTemplateColumns=`repeat(${cols},1fr)`; board.style.maxWidth=cols>=5?"760px":"520px";
  board.innerHTML=""; $("#m-result").innerHTML=""; clearInterval(mState&&mState.timer);
  mState={open:[],moves:0,found:0,n,lock:false,start:Date.now(),timer:setInterval(()=>$("#m-time").textContent="Time: "+Math.round((Date.now()-mState.start)/1000)+"s",1000)};
  $("#m-moves").textContent="Moves: 0"; $("#m-time").textContent="Time: 0s"; showBest("#m-best",mBestKey()," moves");
  deck.forEach((f,i)=>{const c=el("button",{class:"mcard","aria-label":"Hidden card"},`<span class="face back"></span><span class="face front">${f}</span>`);c.dataset.f=f;
    c.onclick=()=>mFlip(c); board.appendChild(c);});
}
async function mFlip(c){
  const s=mState; if(!s||s.lock||c.classList.contains("flipped")) return;
  c.classList.add("flipped"); c.setAttribute("aria-label","Card "+c.dataset.f); Sound.flip(); s.open.push(c);
  if(s.open.length<2) return;
  s.moves++; $("#m-moves").textContent="Moves: "+s.moves; const [a,b]=s.open; s.open=[];
  if(a.dataset.f===b.dataset.f){a.classList.add("matched");b.classList.add("matched");s.found++;setTimeout(()=>Sound.correct(),150);
    if(s.found===s.n){clearInterval(s.timer);const secs=Math.round((Date.now()-s.start)/1000);const r=Store.best(mBestKey(),s.moves,false);
      Store.log("game.match",{score:s.moves,label:`${s.n} pairs · ${s.moves} moves`+(mTimerOn()?` · ${secs}s`:""),size:s.n});
      Store.set("best.match",Store.get("best.match_8"));
      setTimeout(()=>{Sound.win();showBest("#m-best",mBestKey()," moves");
        $("#m-result").innerHTML=`<div class="result"><h3 style="margin-top:0">🎉 All ${s.n} pairs found in ${s.moves} moves${mTimerOn()?` (${secs} s)`:""}</h3><p>${r.isNew?"New best for this board size!":r.first?"First game on this board size — your best is saved.":`Your best on this board: ${r.best} moves.`}</p><button class="btn" onclick="document.getElementById('m-start').click()">▶ Play again</button></div>`;},500);}}
  else{s.lock=true;await sleep(1100);Sound.click();a.classList.remove("flipped");b.classList.remove("flipped");a.setAttribute("aria-label","Hidden card");b.setAttribute("aria-label","Hidden card");s.lock=false;}
}
$("#m-start").onclick=mStart; $("#m-level").onchange=mStart; mStart();

/* ============ SIMON ============ */
const pads=$$("#si-pads button"); let si={seq:[],idx:0,accept:false};
const SIMON_NOTES=[329.63,261.63,392.0,523.25];
function lightPad(i,ms){pads[i].classList.add("on");Sound.tone(SIMON_NOTES[i],ms/1000,"sine",0.25);setTimeout(()=>pads[i].classList.remove("on"),ms*0.85);}
async function siPlay(){si.accept=false;const sp=+$("#s-level").value;$("#si-msg").textContent="👀 Watch and listen…";await sleep(700);
  for(const i of si.seq){lightPad(i,sp*0.8);await sleep(sp);} si.idx=0; si.accept=true; $("#si-msg").textContent="👉 Your turn";}
function siNext(){si.seq.push(Math.floor(Math.random()*4));$("#si-round").textContent="Round: "+si.seq.length;siPlay();}
pads.forEach((p,i)=>p.addEventListener("click",async()=>{
  if(!si.accept) return; lightPad(i,300);
  if(i!==si.seq[si.idx]){si.accept=false;await sleep(250);Sound.wrong();const score=si.seq.length-1;const r=Store.best("simon",score);
    $("#si-msg").textContent=`Game over — you remembered ${score} note${score===1?"":"s"}${r.isNew?" 🎉 new best!":""}`;showBest("#si-best","simon");$("#si-start").textContent="↻ Play again";return;}
  si.idx++; if(si.idx===si.seq.length){si.accept=false;$("#si-msg").textContent="✓ Well done!";await sleep(600);siNext();}
}));
$("#si-start").onclick=()=>{si={seq:[],idx:0,accept:false};siNext();};
showBest("#si-best","simon");

/* ============ WHAT CHANGED ============ */
const PICS=["🍎","🍌","🍇","🥕","🌽","🍄","🌵","🌲","🌸","🌻","🐱","🐶","🐰","🐸","🐝","🦉","🐠","🚲","🚂","⛵","✈️","🎸","🎺","📚","✏️","⏰","☂️","🎁","🧸","⚽","🏀","🎨","🔔","🕯️","🧦","👒","🧤","🪁","🥨","🍩"];
let wc={streak:0,busy:false,target:-1,accept:false};
async function wcRound(){
  if(wc.busy) return; wc.busy=true; wc.accept=false;
  const n=+$("#w-level").value, grid=$("#wc-grid"); grid.style.gridTemplateColumns=`repeat(${n<=4?2:n<=9?3:4},1fr)`; grid.style.maxWidth=n<=4?"360px":n<=9?"480px":"600px";
  const picks=sample(PICS,n+1); const shown=picks.slice(0,n), extra=picks[n];
  grid.innerHTML=""; const cells=shown.map((p,i)=>{const b=el("button",{class:"item","aria-label":"Picture "+(i+1)},p);grid.appendChild(b);return b;});
  const study=2500+n*500; $("#wc-msg").textContent=`👀 Study the pictures (${Math.round(study/1000)} s)`; Sound.flip();
  await sleep(study); cells.forEach(c=>c.classList.add("hidden")); $("#wc-msg").textContent="🙈 Covering…"; Sound.click(); await sleep(1200);
  wc.target=Math.floor(Math.random()*n); cells[wc.target].textContent=extra; cells.forEach(c=>c.classList.remove("hidden")); Sound.flip();
  $("#wc-msg").textContent="❓ Which picture changed? Tap it."; wc.accept=true; wc.busy=false;
  cells.forEach((c,i)=>c.onclick=async()=>{if(!wc.accept)return;wc.accept=false;
    if(i===wc.target){c.classList.add("good");Sound.correct();wc.streak++;$("#wc-msg").textContent=`✓ Yes! It was ${shown[wc.target]} → ${extra}`;}
    else{c.classList.add("bad");cells[wc.target].classList.add("missed");Sound.wrong();const r=Store.best("changed",wc.streak);$("#wc-msg").textContent=`✗ It was this one: ${shown[wc.target]} became ${extra}.${r.isNew?" 🎉 New best streak!":""}`;wc.streak=0;showBest("#wc-best","changed");}
    $("#wc-streak").textContent="Streak: "+wc.streak; if(wc.streak) Store.best("changed",wc.streak), showBest("#wc-best","changed");
    await sleep(1800); wcRound();});
}
$("#wc-start").onclick=()=>{wc.streak=0;$("#wc-streak").textContent="Streak: 0";wcRound();}; showBest("#wc-best","changed");

/* ============ GROCERY LIST ============ */
const GROC=[["🍎","apples"],["🍌","bananas"],["🥛","milk"],["🍞","bread"],["🧀","cheese"],["🥚","eggs"],["🍅","tomatoes"],["🥕","carrots"],["🧅","onions"],["🥔","potatoes"],["🍗","chicken"],["🐟","fish"],["🍚","rice"],["🧈","butter"],["🍯","honey"],["☕","coffee"],["🫖","tea"],["🍊","oranges"],["🥒","cucumber"],["🍋","lemons"],["🥜","peanuts"],["🍪","cookies"],["🥣","cereal"],["🧃","juice"]];
let gr=null;
$("#gr-start").onclick=async()=>{
  const n=+$("#gr-level").value; const pick=sample(GROC,Math.min(n*2,GROC.length)); const list=pick.slice(0,n);
  gr={list,pool:shuffle(pick),sel:new Set(),active:false}; $("#gr-result").innerHTML=""; $("#gr-done").hidden=true;
  const grid=$("#gr-grid"); grid.style.gridTemplateColumns="repeat(auto-fill,minmax(110px,1fr))";
  grid.innerHTML=`<div style="grid-column:1/-1" class="callout"><strong>Shopping list:</strong><div style="font-size:1.4rem;margin-top:.4rem">${list.map(([e,w])=>`<span class="word-chip hit">${e} ${w}</span>`).join(" ")}</div></div>`;
  const t=2000+n*1500; $("#gr-msg").textContent=`📝 Memorise the list…`; Sound.flip(); $("#gr-start").disabled=true;
  const tStart=Date.now();
  if($("#gr-speak").checked) await speak("Your shopping list: "+list.map(x=>x[1]).join(", "),0.85);
  const rest=t-(Date.now()-tStart); if(rest>0) await sleep(rest);
  $("#gr-msg").textContent="🛒 Now tap every item that was on your list"; Sound.click(); grid.innerHTML="";
  gr.pool.forEach(([e,w])=>{const b=el("button",{class:"item","aria-pressed":"false","aria-label":w},`${e}<small>${w}</small>`);b.onclick=()=>{if(!gr.active)return;const on=!gr.sel.has(w);on?gr.sel.add(w):gr.sel.delete(w);b.classList.toggle("sel",on);b.setAttribute("aria-pressed",on);Sound.click();};grid.appendChild(b);});
  gr.active=true; $("#gr-done").hidden=false; $("#gr-start").disabled=false;
};
$("#gr-done").onclick=()=>{
  if(!gr||!gr.active) return; gr.active=false; $("#gr-done").hidden=true; const want=new Set(gr.list.map(x=>x[1]));
  let hits=0,fa=0; $$("#gr-grid .item").forEach(b=>{const w=b.getAttribute("aria-label");const s=gr.sel.has(w);
    if(s&&want.has(w)){b.classList.add("good");hits++;}else if(s){b.classList.add("bad");fa++;}else if(want.has(w))b.classList.add("missed");});
  const pct=Math.max(0,Math.round(100*(hits-fa)/want.size)); const r=Store.best("grocery",pct);
  pct>=70?Sound.win():Sound.wrong(); showBest("#gr-best","grocery","%");
  $("#gr-msg").textContent=`You found ${hits} of ${want.size}${fa?`, with ${fa} extra item${fa>1?"s":""}`:""}.`;
  $("#gr-result").innerHTML=`<div class="result"><h3 style="margin-top:0">Score: ${pct}%${r.isNew?" 🎉 new best!":""}</h3><p class="small">Green = correct, orange dashed = forgotten, red = not on the list. Try the <strong>story method</strong>: link items in a silly scene (a fish drinking milk on a loaf of bread…).</p></div>`;
};
showBest("#gr-best","grocery","%");

/* ============ PATTERN GRID ============ */
let pg=null;
function pgSize(l){return l<4?3:l<8?4:5;}
async function pgRound(){
  const size=pgSize(pg.level), cnt=Math.min(pg.level+2,size*size-2), grid=$("#p-grid");
  grid.style.gridTemplateColumns=`repeat(${size},1fr)`; grid.innerHTML="";
  const cells=Array.from({length:size*size},(_,i)=>{const b=el("button",{"aria-label":"Square "+(i+1)});grid.appendChild(b);return b;});
  const target=new Set(sample([...Array(size*size).keys()],cnt)); pg.found=new Set(); pg.accept=false;
  $("#p-level").textContent="Level: "+pg.level; $("#p-lives").textContent="Lives: "+"❤️".repeat(pg.lives);
  $("#p-msg").textContent=`👀 Remember ${cnt} squares`; await sleep(600);
  target.forEach(i=>cells[i].classList.add("lit")); Sound.flip(); await sleep(1000+cnt*200); target.forEach(i=>cells[i].classList.remove("lit"));
  $("#p-msg").textContent="👉 Tap the squares"; pg.accept=true;
  cells.forEach((c,i)=>c.onclick=async()=>{if(!pg.accept||pg.found.has(i))return;
    if(target.has(i)){pg.found.add(i);c.classList.add("good");Sound.note(pg.found.size%9,0.18);
      if(pg.found.size===target.size){pg.accept=false;Sound.correct();$("#p-msg").textContent="✓ Perfect!";pg.level++;Store.best("pattern",pg.level-1);showBest("#p-best","pattern");await sleep(1000);pgRound();}}
    else{pg.accept=false;c.classList.add("bad");Sound.wrong();target.forEach(t=>{if(!pg.found.has(t))cells[t].classList.add("missed");});pg.lives--;
      if(pg.lives<=0){$("#p-lives").textContent="Lives: 0";const r=Store.best("pattern",pg.level-1);$("#p-msg").textContent=`Game over — you reached level ${pg.level}${r.isNew?" 🎉 new best!":""}`;showBest("#p-best","pattern");$("#p-start").textContent="↻ Play again";return;}
      $("#p-msg").textContent="✗ Missed one — try again";await sleep(1500);pgRound();}});
}
$("#p-start").onclick=()=>{pg={level:1,lives:3};pgRound();}; showBest("#p-best","pattern");
// draw an initial empty grid
(()=>{const g=$("#p-grid");g.style.gridTemplateColumns="repeat(3,1fr)";for(let i=0;i<9;i++)g.appendChild(el("button",{"aria-hidden":"true",tabindex:"-1"}));})();

/* ============ N-BACK ============ */
const LET="BCDHKLMRST".split(""); let nb=null;
function nbBestKey(){return "nback";}
$("#n-start").onclick=async()=>{
  if(nb&&nb.running) return; const n=+$("#n-level").value, total=20;
  const seq=[]; for(let i=0;i<total;i++){ if(i>=n&&Math.random()<0.3) seq.push(seq[i-n]); else {let c;do{c=LET[Math.floor(Math.random()*LET.length)];}while(i>=n&&c===seq[i-n]);seq.push(c);} }
  nb={running:true,seq,n,pressed:new Array(total).fill(false),cur:-1}; $("#n-result").innerHTML=""; $("#n-match").disabled=false; $("#n-start").disabled=true;
  const L=$("#n-letter"); L.textContent="Ready"; await sleep(1200);
  for(let i=0;i<total;i++){
    nb.cur=i; L.textContent=seq[i]; L.classList.add("flash"); setTimeout(()=>L.classList.remove("flash"),200);
    if($("#n-speak").checked&&!Sound.muted) speak(seq[i],1); else Sound.beep();
    $("#n-count").textContent=`${i+1} / ${total}`; await sleep(1800); L.textContent="·"; await sleep(600);
  }
  nb.running=false; nb.cur=-1; $("#n-match").disabled=true; $("#n-start").disabled=false;
  let hits=0,miss=0,fa=0,cr=0; for(let i=n;i<total;i++){const t=seq[i]===seq[i-n],p=nb.pressed[i];if(t&&p)hits++;else if(t)miss++;else if(p)fa++;else cr++;}
  const acc=Math.round(100*(hits+cr)/(total-n)); const r=Store.best(nbBestKey(),acc); showBest("#n-best","nback","%");
  acc>=80?Sound.win():Sound.correct();
  $("#n-result").innerHTML=`<div class="result"><h3 style="margin-top:0">${n}-back accuracy: ${acc}%${r.isNew?" 🎉 new best!":""}</h3><p>Matches caught: <strong>${hits}</strong> · matches missed: <strong>${miss}</strong> · false alarms: <strong>${fa}</strong></p><p class="small">${acc>=85&&n<3?"Great! Try the next level up.":"Keep practising — say the last letters quietly to yourself to keep them in mind."}</p></div>`;
};
function nbPress(){ if(!nb||!nb.running||nb.cur<0||nb.pressed[nb.cur]) return; const i=nb.cur; nb.pressed[i]=true;
  const ok=i>=nb.n&&nb.seq[i]===nb.seq[i-nb.n]; ok?Sound.correct():Sound.wrong(); const L=$("#n-letter"); L.classList.remove("flash-good","flash-bad"); void L.offsetWidth; L.classList.add(ok?"flash-good":"flash-bad"); }
$("#n-match").onclick=nbPress;
document.addEventListener("keydown",e=>{if((e.key==="m"||e.key==="M")&&$("#g-nback").classList.contains("active"))nbPress();});
showBest("#n-best","nback","%");
})();
