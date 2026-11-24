/* Private clinician log — localStorage only */
(function(){
const {$, $$, el} = U;
const KEY="clinlog";
const CATS={memory:"🧠 Memory",mood:"💛 Mood",sleep:"😴 Sleep",medications:"💊 Medications",other:"📝 Other"};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
const load=()=>Store.get(KEY,[]), save=a=>Store.set(KEY,a);
const fmtD=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d).toLocaleDateString([], {weekday:"short",year:"numeric",month:"long",day:"numeric"});};

function latestScores(){
  const out=[];
  const last=(k,name)=>{const l=Store.get("log."+k,[]);if(l.length){const e=l[l.length-1];out.push(`${name}: ${e.label||e.score} (${new Date(e.t).toLocaleDateString()})`);}};
  last("game.cross","Crossword");last("game.spaced","Spaced Recall");last("game.match","Picture Pairs");
  [["simon","Simon Tones best (timed)",""],["simon_relaxed","Simon Tones best (relaxed)",""],["changed","What Changed? best streak (timed)",""],["changed_relaxed","What Changed? best streak (relaxed)",""],["grocery","Grocery List best (timed)","%"],["grocery_relaxed","Grocery List best (relaxed)","%"],["pattern","Pattern Grid best level (timed)",""],["pattern_relaxed","Pattern Grid best level (relaxed)",""],["nback","N-Back best (timed)","%"],["nback_relaxed","N-Back best (relaxed)","%"]].forEach(([k,n,u])=>{const b=Store.get("best."+k);if(b!==null)out.push(`${n}: ${b}${u}`);});
  last("words","Word list (immediate)");last("words_delayed","Word list (delayed)");last("digits_f","Digit span forward");last("digits_b","Digit span backward");last("corsi","Block tapping");last("reaction","Reaction time");last("story","Story recall");
  return out;
}
$("#lg-date").value=today(); $("#lg-date").max=today();
$("#lg-scores").onchange=()=>{const p=$("#lg-scores-preview");if($("#lg-scores").checked){const s=latestScores();p.textContent=s.length?"Will attach: "+s.join(" · "):"No scores saved yet in this browser.";p.hidden=false;}else p.hidden=true;};
$("#lg-form").onsubmit=e=>{e.preventDefault();const note=$("#lg-note").value.trim();if(!note){toast("Please write a short note");$("#lg-note").focus();return;}
  const entry={id:Date.now().toString(36),date:$("#lg-date").value||today(),cat:$("#lg-cat").value,note,created:Date.now()};
  if($("#lg-scores").checked){const s=latestScores();if(s.length)entry.scores=s;}
  const a=load();a.push(entry);save(a);$("#lg-note").value="";$("#lg-scores").checked=false;$("#lg-scores-preview").hidden=true;Sound.correct();toast("Entry saved in this browser");render();};
function sorted(){return load().slice().sort((a,b)=>b.date.localeCompare(a.date)||b.created-a.created);}
function render(){const f=$("#lg-filter").value;const a=sorted().filter(e=>!f||e.cat===f);$("#lg-count").textContent=load().length;
  $("#lg-list").innerHTML=a.length?a.map(e=>`<article class="log-entry cat-${e.cat}"><div class="log-head"><strong>${esc(fmtD(e.date))}</strong> <span class="pill">${CATS[e.cat]||esc(e.cat)}</span><button class="icon-btn no-print" data-del="${e.id}" aria-label="Delete this entry" style="margin-left:auto;min-width:44px;height:44px;font-size:1rem">🗑</button></div><p class="log-note">${esc(e.note).replace(/\n/g,"<br>")}</p>${e.scores?`<p class="small muted">📊 Scores at the time: ${e.scores.map(esc).join(" · ")}</p>`:""}</article>`).join(""):`<p class="muted">${load().length?"No entries in this category.":"No entries yet. Your notes will appear here."}</p>`;
  $$("[data-del]").forEach(b=>b.onclick=()=>{if(confirm("Delete this entry?")){save(load().filter(x=>x.id!==b.dataset.del));render();}});}
$("#lg-filter").onchange=render;
function download(name,text,type){const blob=new Blob([text],{type});const a=el("a",{href:URL.createObjectURL(blob),download:name});document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}
$("#lg-csv").onclick=()=>{const a=sorted();if(!a.length){toast("No entries to export");return;}
  const q=s=>'"'+String(s==null?"":s).replace(/"/g,'""')+'"';
  const csv=["Date,Category,Note,Scores"].concat(a.map(e=>[e.date,e.cat,e.note,(e.scores||[]).join(" | ")].map(q).join(","))).join("\r\n");
  download(`memory-log-${today()}.csv`,"\ufeff"+csv,"text/csv;charset=utf-8");toast("CSV downloaded");};
$("#lg-json").onclick=()=>{const a=sorted();if(!a.length){toast("No entries to export");return;}
  download(`memory-log-${today()}.json`,JSON.stringify({app:"Memory for Life",exported:new Date().toISOString(),entries:a},null,2),"application/json");toast("JSON downloaded");};
$("#lg-print").onclick=()=>{$("#lg-print-meta").textContent=`Printed ${new Date().toLocaleDateString([], {year:"numeric",month:"long",day:"numeric"})} · ${load().length} entries · Personal notes, not a medical record.`;$("#lg-filter").value="";render();window.print();};
$("#lg-clear").onclick=()=>{if(!load().length){toast("Nothing to delete");return;}if(confirm("Delete ALL log entries from this browser? This cannot be undone. (Tip: export first.)")){save([]);render();toast("All entries deleted");}};
render();
})();
