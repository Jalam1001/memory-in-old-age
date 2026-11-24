/* Main games (v0.2): Crossword, Spaced Recall, progress view */
(function(){
const {$, $$, el, shuffle} = U;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ======================= CROSSWORD ======================= */
// Hand-written puzzles. Each entry: row, col, direction (a=across, d=down), answer, clue.
const PUZZLES={
 easy:[
  {name:"Easy 1 — Around the house",e:[[0,0,"a","CAT","Pet that purrs"],[0,0,"d","COW","Farm animal that gives milk"],[0,2,"d","TEA","Hot drink, often served with milk"],[2,2,"a","APE","Large primate, such as a gorilla"]]},
  {name:"Easy 2 — A sunny day",e:[[0,0,"a","SUN","It shines in the daytime sky"],[0,0,"d","SEA","Large body of salt water"],[0,2,"d","NAP","Short sleep in the afternoon"],[2,2,"a","PIE","Apple ___ (baked dessert)"],[2,4,"d","EGG","Breakfast food laid by a hen"]]}
 ],
 medium:[
  {name:"Medium 1 — In the garden",e:[[0,0,"a","GARDEN","Where you grow flowers and vegetables"],[0,0,"d","GRAPE","Small fruit that grows in bunches"],[0,5,"d","NURSE","Hospital worker who cares for patients"],[4,0,"a","ENGINE","The part of a car that makes it go"],[0,3,"d","DOG","Loyal pet that barks"]]},
  {name:"Medium 2 — Winter days",e:[[0,0,"a","WINTER","The coldest season"],[0,0,"d","WATCH","You wear it on your wrist to tell the time"],[0,5,"d","RIVER","It flows down to the sea"],[4,0,"a","HAMMER","Tool for knocking in nails"],[0,2,"d","NUT","Walnut or almond, for example"]]}
 ],
 hard:[
  {name:"Hard 1 — Reflections",e:[[0,0,"a","MEMORY","Faculty this website helps you exercise"],[0,0,"d","MARKET","Bazaar"],[0,5,"d","YELLOW","Hue of a canary"],[3,0,"a","KERNEL","Core of a grain or nut"],[0,2,"d","MIRROR","Looking glass"]]},
  {name:"Hard 2 — Seasons and rulers",e:[[0,0,"a","HOLIDAY","Day off work for a celebration"],[0,0,"d","HARVEST","Gathering of crops in autumn"],[0,6,"d","YOGURT","Cultured milk food, often eaten with fruit"],[4,0,"a","EMPEROR","Ruler of an empire"],[0,3,"d","IMAGE","A picture or likeness"]]}
 ]
};
function buildPuzzle(p){
  let R=0,C=0; const sol={};
  p.e.forEach(([r,c,d,ans])=>{for(let i=0;i<ans.length;i++){const rr=d==="d"?r+i:r,cc=d==="a"?c+i:c,k=rr+","+cc;
    if(sol[k]&&sol[k]!==ans[i]) console.error("Crossword conflict",p.name,k,ans); sol[k]=ans[i]; R=Math.max(R,rr+1); C=Math.max(C,cc+1);}});
  // numbering
  const starts=[...new Set(p.e.map(([r,c])=>r+","+c))].sort((a,b)=>{const[ar,ac]=a.split(",").map(Number),[br,bc]=b.split(",").map(Number);return ar-br||ac-bc;});
  const num={}; starts.forEach((k,i)=>num[k]=i+1);
  const entries=p.e.map(([r,c,d,ans,clue])=>({r,c,d,ans,clue,n:num[r+","+c],cells:[...ans].map((_,i)=>d==="d"?(r+i)+","+c:r+","+(c+i))}));
  return {R,C,sol,num,entries};
}
window.__cwCheck=()=>Object.values(PUZZLES).flat().map(buildPuzzle); // used by tests
let cw=null;
function cwKey(){return `cw.${$("#cw-level").value}.${$("#cw-puzzle").value}`;}
function fillPuzzleSelect(){const lv=$("#cw-level").value;const done=Store.get("cw.done",{});
  $("#cw-puzzle").innerHTML=PUZZLES[lv].map((p,i)=>`<option value="${i}">${done[lv+i]!=null?"✅ ":""}${esc(p.name)}</option>`).join("");}
function cwLoad(){
  const lv=$("#cw-level").value, idx=+$("#cw-puzzle").value||0, P=buildPuzzle(PUZZLES[lv][idx]);
  const saved=Store.get(cwKey(),{fill:{},revealed:[]});
  cw={P,lv,idx,fill:saved.fill||{},revealed:new Set(saved.revealed||[]),dir:"a",cur:null,done:false};
  const g=$("#cw-grid"); g.style.gridTemplateColumns=`repeat(${P.C},var(--cell))`; g.innerHTML="";
  for(let r=0;r<P.R;r++)for(let c=0;c<P.C;c++){const k=r+","+c;
    if(!P.sol[k]){g.appendChild(el("div",{class:"cw-block","aria-hidden":"true"}));continue;}
    const cell=el("div",{class:"cw-cell"});
    if(P.num[k]) cell.appendChild(el("span",{class:"cw-num"},P.num[k]));
    const inp=el("input",{type:"text",maxlength:"2",autocomplete:"off",autocorrect:"off",autocapitalize:"characters",spellcheck:"false",inputmode:"text","aria-label":`Row ${r+1}, column ${c+1}`,"data-k":k});
    inp.value=cw.fill[k]||""; if(cw.revealed.has(k)) cell.classList.add("revealed");
    inp.addEventListener("focus",()=>{setTimeout(()=>inp.select(),0);if(cw.cur!==k){cw.cur=k; if(!entryAt(k,cw.dir)) cw.dir=cw.dir==="a"?"d":"a";} highlight();});
    inp.addEventListener("mousedown",()=>{if(cw.cur===k&&entryAt(k,cw.dir==="a"?"d":"a")){cw.dir=cw.dir==="a"?"d":"a";setTimeout(highlight,0);}});
    inp.addEventListener("input",()=>{const v=(inp.value||"").toUpperCase().replace(/[^A-Z]/g,"");const ch=v.slice(-1);inp.value=ch;setLetter(k,ch);if(ch){Sound.click();move(1);}});
    inp.addEventListener("keydown",e=>{
      if(e.key==="Backspace"&&!inp.value){e.preventDefault();move(-1,true);}
      else if(e.key==="ArrowRight"){e.preventDefault();cw.dir="a";step(k,0,1);}else if(e.key==="ArrowLeft"){e.preventDefault();cw.dir="a";step(k,0,-1);}
      else if(e.key==="ArrowDown"){e.preventDefault();cw.dir="d";step(k,1,0);}else if(e.key==="ArrowUp"){e.preventDefault();cw.dir="d";step(k,-1,0);}
      else if(e.key===" "){e.preventDefault();cw.dir=cw.dir==="a"?"d":"a";highlight();}});
    cell.appendChild(inp); g.appendChild(cell);}
  const li=d=>P.entries.filter(x=>x.d===d).sort((a,b)=>a.n-b.n).map(x=>`<li data-n="${x.n}" data-d="${d}" tabindex="0"><strong>${x.n}.</strong> ${esc(x.clue)} <span class="muted">(${x.ans.length})</span></li>`).join("");
  $("#cw-across").innerHTML=li("a"); $("#cw-down").innerHTML=li("d");
  $$(".cw-clues li").forEach(l=>{const go=()=>{const x=P.entries.find(e=>e.n==l.dataset.n&&e.d===l.dataset.d);cw.dir=x.d;focusCell(x.cells.find(k=>!cw.fill[k])||x.cells[0]);};l.onclick=go;l.onkeydown=e=>{if(e.key==="Enter")go();};});
  $("#cw-result").innerHTML=""; cw.done=isComplete(); updateStatus(); if(cw.done) showDone(false);
}
function entryAt(k,d){return cw.P.entries.find(x=>x.d===d&&x.cells.includes(k));}
function inputFor(k){return $(`#cw-grid input[data-k="${k}"]`);}
function focusCell(k){const i=inputFor(k);if(i){cw.cur=k;i.focus();highlight();}}
function highlight(){
  $$("#cw-grid .cw-cell").forEach(c=>c.classList.remove("hl","cur"));$$(".cw-clues li").forEach(l=>l.classList.remove("hl"));
  if(!cw.cur) return; const x=entryAt(cw.cur,cw.dir)||entryAt(cw.cur,cw.dir==="a"?"d":"a"); if(!x) return; cw.dir=x.d;
  x.cells.forEach(k=>inputFor(k).parentNode.classList.add("hl")); inputFor(cw.cur).parentNode.classList.add("cur");
  const l=$(`.cw-clues li[data-n="${x.n}"][data-d="${x.d}"]`); if(l) l.classList.add("hl");
  $("#cw-current").innerHTML=`<strong>${x.n} ${x.d==="a"?"Across":"Down"}:</strong> ${esc(x.clue)}`;
}
function move(delta,erase){const x=entryAt(cw.cur,cw.dir);if(!x)return;const i=x.cells.indexOf(cw.cur)+delta;
  if(i>=0&&i<x.cells.length){const k=x.cells[i];if(erase&&!cw.revealed.has(k)){setLetter(k,"");inputFor(k).value="";}focusCell(k);}}
function step(k,dr,dc){let[r,c]=k.split(",").map(Number);for(let t=0;t<12;t++){r+=dr;c+=dc;if(r<0||c<0||r>=cw.P.R||c>=cw.P.C)return;const kk=r+","+c;if(cw.P.sol[kk]){focusCell(kk);return;}}}
function save(){Store.set(cwKey(),{fill:cw.fill,revealed:[...cw.revealed]});}
function setLetter(k,ch){$$("#cw-grid .cw-cell").forEach(c=>c.classList.remove("good","bad"));if(ch)cw.fill[k]=ch;else delete cw.fill[k];save();updateStatus();
  if(!cw.done&&isComplete()){cw.done=true;showDone(true);}}
function isComplete(){return Object.keys(cw.P.sol).every(k=>cw.fill[k]===cw.P.sol[k]);}
function scorePct(){const tot=Object.keys(cw.P.sol).length;return Math.round(100*(tot-cw.revealed.size)/tot);}
function updateStatus(){const tot=Object.keys(cw.P.sol).length,f=Object.keys(cw.P.sol).filter(k=>cw.fill[k]).length;$("#cw-status").textContent=`${f} / ${tot} letters filled`;}
function showDone(fresh){const pct=scorePct();
  if(fresh){Sound.win();const done=Store.get("cw.done",{});const key=cw.lv+cw.idx;done[key]=Math.max(done[key]||0,pct);Store.set("cw.done",done);
    Store.log("game.cross",{score:pct,label:`${PUZZLES[cw.lv][cw.idx].name.split(" — ")[0]} solved · ${pct}% on your own`});fillPuzzleSelect();$("#cw-puzzle").value=cw.idx;}
  $$("#cw-grid .cw-cell").forEach(c=>c.classList.add("good"));
  $("#cw-result").innerHTML=`<div class="result"><h3 style="margin-top:0">🎉 Puzzle complete!</h3><p>You filled in <strong>${pct}%</strong> of the letters yourself${cw.revealed.size?` (${cw.revealed.size} revealed)`:" — no help needed!"}.</p><div class="btn-row"><button class="btn" id="cw-next">▶ Next puzzle</button><button class="btn ghost" id="cw-again">↺ Play this one again</button></div></div>`;
  $("#cw-next").onclick=()=>{const lv=$("#cw-level").value;let i=cw.idx+1;if(i>=PUZZLES[lv].length){const order=["easy","medium","hard"];const nl=order[Math.min(order.indexOf(lv)+1,2)];$("#cw-level").value=nl;fillPuzzleSelect();i=nl===lv?0:0;}$("#cw-puzzle").value=i;cwLoad();};
  $("#cw-again").onclick=()=>{Store.set(cwKey(),null);cwLoad();};
}
$("#cw-check").onclick=()=>{let wrong=0,empty=0;Object.keys(cw.P.sol).forEach(k=>{const c=inputFor(k).parentNode;c.classList.remove("good","bad");
  if(!cw.fill[k])empty++;else if(cw.fill[k]===cw.P.sol[k])c.classList.add("good");else{c.classList.add("bad");wrong++;}});
  wrong?Sound.wrong():Sound.correct(); toast(wrong?`${wrong} letter${wrong>1?"s":""} to fix (shown in red)`:empty?`All correct so far — ${empty} to go`:"All correct!");};
function reveal(keys){keys.forEach(k=>{if(cw.fill[k]!==cw.P.sol[k]){cw.revealed.add(k);inputFor(k).parentNode.classList.add("revealed");}cw.fill[k]=cw.P.sol[k];inputFor(k).value=cw.P.sol[k];});
  Sound.flip(); save(); updateStatus(); if(!cw.done&&isComplete()){cw.done=true;showDone(true);}}
$("#cw-reveal1").onclick=()=>{if(!cw.cur){toast("Tap a square first");return;}reveal([cw.cur]);};
$("#cw-revealw").onclick=()=>{if(!cw.cur){toast("Tap a square first");return;}const x=entryAt(cw.cur,cw.dir);if(x)reveal(x.cells);};
$("#cw-clear").onclick=()=>{if(!confirm("Clear all letters in this puzzle?"))return;Store.set(cwKey(),null);cwLoad();};
$("#cw-level").onchange=()=>{fillPuzzleSelect();cwLoad();};
$("#cw-puzzle").onchange=cwLoad;
fillPuzzleSelect(); cwLoad();

/* ======================= SPACED RECALL ======================= */
const DAY=86400000, INTERVALS=[1,3,7,14,30,60]; // days; stage = box+1
const srItems=()=>Store.get("sr.items",[]), srSave=a=>Store.set("sr.items",a);
const normA=s=>String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g," ").trim();
function promptOf(it){return it.type==="name"?(it.cue?`Who is this? <em>${esc(it.cue)}</em>`:`Recall the name you saved (starts with “${esc(it.answer[0].toUpperCase())}”)`):esc(it.q);}
function labelOf(it){return it.type==="name"?`👤 ${esc(it.answer)}${it.cue?` <span class="muted small">— ${esc(it.cue)}</span>`:""}`:`💡 ${esc(it.q)} <span class="muted small">→ ${esc(it.answer)}</span>`;}
function fmtDue(t){const d=t-Date.now();if(d<=0)return "<strong>Due now</strong>";const days=Math.ceil(d/DAY);return days===1?"Tomorrow":new Date(t).toLocaleDateString([], {month:"short",day:"numeric"})+` (in ${days} days)`;}
function srRender(){const a=srItems(),now=Date.now();$("#sr-due").textContent=a.filter(i=>i.due<=now).length;$("#sr-total").textContent=a.length;
  $("#sr-list").innerHTML=a.length?a.map(it=>{const n=it.hist.length,ok=it.hist.filter(h=>h).length;return `<tr><td>${labelOf(it)}</td><td><span class="pill ${it.box>=3?"ok":""}">${it.box+1} / 7</span></td><td>${fmtDue(it.due)}</td><td>${n?Math.round(100*ok/n)+"% ("+ok+"/"+n+")":"–"}</td><td><button class="icon-btn" data-del="${it.id}" aria-label="Delete item" style="min-width:44px;height:44px;font-size:1rem">🗑</button></td></tr>`;}).join(""):'<tr><td colspan="5" class="muted">No items yet — add a name or fact above, or tap “Add 3 example items”.</td></tr>';
  $$("[data-del]").forEach(b=>b.onclick=()=>{if(confirm("Delete this item?")){srSave(srItems().filter(i=>i.id!==b.dataset.del));srRender();}});}
function srAdd(o){const a=srItems();a.push(Object.assign({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),box:0,due:Date.now(),hist:[],created:Date.now()},o));srSave(a);srRender();}
$$("input[name=sr-type]").forEach(r=>r.onchange=()=>{const f=$("input[name=sr-type]:checked").value==="fact";$("#sr-fact-fields").hidden=!f;$("#sr-name-fields").hidden=f;});
$("#sr-form").onsubmit=e=>{e.preventDefault();const t=$("input[name=sr-type]:checked").value;
  if(t==="name"){const n=$("#sr-name").value.trim();if(!n){toast("Please type a name");return;}srAdd({type:"name",answer:n,cue:$("#sr-cue").value.trim()});$("#sr-name").value="";$("#sr-cue").value="";}
  else{const q=$("#sr-q").value.trim(),a=$("#sr-a").value.trim();if(!q||!a){toast("Please fill in both the question and the answer");return;}srAdd({type:"fact",q,answer:a});$("#sr-q").value="";$("#sr-a").value="";}
  Sound.correct();toast("Saved — it's ready for your first review");};
$("#sr-sample").onclick=()=>{srAdd({type:"name",answer:"Priya",cue:"New neighbour at number 12 with the golden retriever"});srAdd({type:"fact",q:"Where is the spare house key?",answer:"Under the blue flowerpot"});srAdd({type:"fact",q:"What day is the recycling collected?",answer:"Thursday"});Sound.correct();};
$("#sr-clear").onclick=()=>{if(confirm("Delete ALL your Spaced Recall items and history from this browser? This cannot be undone.")){Store.set("sr.items",[]);Store.set("log.game.spaced",[]);srRender();toast("Spaced Recall data cleared");}};

// Quiz engine. mode "review" updates the schedule; mode "practice" uses an in-session expanding queue (gaps 1, 2, 4).
let quiz=null;
function startQuiz(mode){const all=srItems(),now=Date.now();
  const items=mode==="review"?all.filter(i=>i.due<=now):all;
  if(!items.length){toast(mode==="review"?(all.length?"Nothing is due right now — come back later or do a practice round":"Add some items first"):"Add some items first");return;}
  quiz={mode,queue:shuffle(items).map(it=>({id:it.id,step:0,tries:0})),first:{},asked:0,answered:0};
  $("#sr-quiz").hidden=false; $("#sr-quiz").scrollIntoView({behavior:"smooth",block:"start"}); askNext();}
function askNext(){const box=$("#sr-quiz");
  if(!quiz.queue.length) return finishQuiz();
  const q=quiz.queue[0], it=srItems().find(i=>i.id===q.id); if(!it){quiz.queue.shift();return askNext();}
  const left=quiz.queue.length;
  box.innerHTML=`<p class="pill">${quiz.mode==="review"?"Review":"Practice round"} · ${left} question${left>1?"s":""} left in queue</p>
    <h3 style="font-size:1.5rem">${promptOf(it)}</h3>
    <form id="sr-ans-form" autocomplete="off"><label for="sr-ans">Your answer (take your time):</label><input type="text" id="sr-ans" autocomplete="off">
    <div class="btn-row"><button class="btn teal" type="submit">✔ Check</button><button class="btn ghost" type="button" id="sr-show">🙈 I don't know — show me</button><button class="btn ghost" type="button" id="sr-stop">⏹ Stop</button></div></form>`;
  $("#sr-ans").focus();
  $("#sr-ans-form").onsubmit=e=>{e.preventDefault();const v=$("#sr-ans").value;if(!v.trim()){toast("Type an answer, or tap “show me”");return;}judge(it,q,normA(v)===normA(it.answer),v);};
  $("#sr-show").onclick=()=>judge(it,q,false,"");
  $("#sr-stop").onclick=finishQuiz;
}
function judge(it,q,auto,typed){const box=$("#sr-quiz");
  box.innerHTML=`<h3 style="margin-top:0">${promptOf(it)}</h3><p style="font-size:1.4rem">Answer: <strong>${esc(it.answer)}</strong></p>${typed?`<p>You wrote: “${esc(typed)}”</p>`:""}
   <p>${auto?"✅ That matches!":typed?"Not an exact match. Was it close enough?":"No problem — have a good look at it."}</p>
   <div class="btn-row">${auto?`<button class="btn teal" id="sr-ok">▶ Next</button>`:`${typed?`<button class="btn teal" id="sr-ok">✔ I got it right</button>`:""}<button class="btn" id="sr-miss">${typed?"✗ I got it wrong":"▶ Next"}</button>`}</div>`;
  auto?Sound.correct():typed?Sound.flip():Sound.wrong();
  const done=ok=>{record(it,q,ok);askNext();};
  if($("#sr-ok")) $("#sr-ok").onclick=()=>done(true);
  if($("#sr-miss")) $("#sr-miss").onclick=()=>done(false);
  ($("#sr-ok")||$("#sr-miss")).focus();
}
function record(it,q,ok){
  if(!(it.id in quiz.first)) quiz.first[it.id]=ok;
  quiz.queue.shift(); quiz.answered++;
  if(quiz.mode==="review"){const a=srItems(),x=a.find(i=>i.id===it.id);
    if(x&&q.tries===0){x.hist.push(ok?1:0);if(ok){x.box=Math.min(x.box+1,INTERVALS.length);}else x.box=0;x.due=Date.now()+INTERVALS[Math.min(x.box,INTERVALS.length-1)]*DAY;srSave(a);}
    if(!ok){q.tries++;quiz.queue.splice(Math.min(2,quiz.queue.length),0,q);} // re-ask a missed item later this session
  } else {const GAPS=[1,2,4];
    if(ok){if(q.step<GAPS.length){quiz.queue.splice(Math.min(GAPS[q.step],quiz.queue.length),0,{id:q.id,step:q.step+1,tries:q.tries});}}
    else {q.step=0;q.tries++;quiz.queue.splice(Math.min(1,quiz.queue.length),0,q);}
  }
  srRender();
}
function finishQuiz(){const ids=Object.keys(quiz.first);const ok=ids.filter(i=>quiz.first[i]).length;const pct=ids.length?Math.round(100*ok/ids.length):0;
  if(ids.length){Store.log("game.spaced",{score:pct,label:`${quiz.mode==="review"?"Review":"Practice"} · ${ok}/${ids.length} right first time (${pct}%)`});Sound.win();}
  $("#sr-quiz").innerHTML=`<h3 style="margin-top:0">🏁 ${quiz.mode==="review"?"Review":"Practice round"} finished</h3><p>You recalled <strong>${ok} of ${ids.length}</strong> correctly the first time you were asked (${pct}%).</p><p class="small">${quiz.mode==="review"?"Items you got right will come back after a longer gap; missed items come back tomorrow.":"Practice rounds don't change your review dates."}</p><button class="btn ghost" id="sr-close">Close</button>`;
  $("#sr-close").onclick=()=>{$("#sr-quiz").hidden=true;};quiz.queue=[];srRender();}
$("#sr-review").onclick=()=>startQuiz("review");
$("#sr-practice").onclick=()=>startQuiz("practice");
srRender();
document.addEventListener("tabchange",e=>{if(e.detail==="g-spaced")srRender();if(e.detail==="g-progress")pgRender();});

/* ======================= PROGRESS ======================= */
const PG=[["game.cross","✏️ Crossword","% of letters solved without reveals"],["game.spaced","🗂️ Spaced Recall","% recalled right first time"],["game.match","🃏 Picture Pairs","moves (fewer is better)"]];
function pgRender(){const rows=[];
  $("#pg-summary").innerHTML=PG.map(([k,n,u])=>{const l=Store.get("log."+k,[]);l.forEach(e=>rows.push([e.t,n,e.label]));
    const last=l.slice(-10);const spark=last.length?`<div class="spark">${last.map(e=>{const v=k==="game.match"?Math.max(8,100-e.score*3):e.score;return `<span style="height:${Math.max(6,Math.min(100,v))}%" title="${esc(e.label)}"></span>`;}).join("")}</div>`:"";
    return `<div class="card teal"><h3 style="margin-top:0">${n}</h3><div class="stat">${l.length}</div><p class="small">game${l.length===1?"":"s"} completed${l.length?` · last: ${esc(l[l.length-1].label)}`:""}</p>${spark}<p class="small muted">Score = ${u}</p></div>`;}).join("");
  rows.sort((a,b)=>b[0]-a[0]);
  $("#pg-body").innerHTML=rows.length?rows.slice(0,40).map(r=>`<tr><td>${r[1]}</td><td>${U.fmtDate(r[0])}</td><td>${esc(r[2])}</td></tr>`).join(""):'<tr><td colspan="3" class="muted">No games finished yet.</td></tr>';}
$("#pg-clear").onclick=()=>{if(confirm("Clear the game history for Crossword, Spaced Recall and Picture Pairs? (Your Spaced Recall items are kept.)")){PG.forEach(([k])=>Store.set("log."+k,[]));pgRender();toast("Game history cleared");}};
pgRender();
})();
