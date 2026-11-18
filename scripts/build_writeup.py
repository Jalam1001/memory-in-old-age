import re, markdown
md=open('WRITEUP.md').read()
md=re.sub(r'^# .*\n','',md,count=1)
md=re.sub(r'^\*An evidence-based.*\n','',md,flags=re.M)
md=re.sub(r'(?<![\("])(https?://\S+)', lambda m:f'<a href="{m.group(1)}" target="_blank" rel="noopener">{m.group(1)}</a>', md)
html=markdown.markdown(md,extensions=['tables'])
# ids for h2
toc=[]
def h2(m):
    t=re.sub('<.*?>','',m.group(1)); slug=re.sub(r'[^a-z0-9]+','-',t.lower()).strip('-')
    if t.startswith('References'): slug='references'
    toc.append((slug,t)); return f'<h2 id="{slug}" class="reveal">{m.group(1)}</h2>'
html=re.sub(r'<h2>(.*?)</h2>',h2,html)
html=html.replace('<table>','<div class="table-wrap"><table>').replace('</table>','</table></div>')
html=re.sub(r'<a href="#(ref\d+)">\[(\d+)\]</a>',r'<sup><a href="#\1">[\2]</a></sup>',html)
html=html.replace('<h2 id="references"','<h2 id="references"').replace('<ol>\n<li><a id="ref1">','<ol class="refs">\n<li><a id="ref1">')
tocs=''.join(f'<a href="#{s}">{t}</a>' for s,t in toc)
page=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Write-up: Memory in Old Age — causes, tests, improvement | Memory for Life</title>
<meta name="description" content="Evidence-based write-up on memory decline in older age: normal ageing vs MCI vs dementia, causes, testing methods, and ways to improve memory, with references.">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧠</text></svg>">
<link rel="stylesheet" href="css/style.css"></head>
<body><header id="site-header"></header>
<main id="main">
<section class="page-hero"><h1>📖 Memory in old age: the write-up</h1>
<p>What changes with age, what doesn't, why memory declines, how it is tested, and what the research says helps. Every number links to its source.</p>
<div class="btn-row"><button class="btn teal" id="readAloud">🔈 Read the summary aloud</button><button class="btn ghost" id="stopRead">⏹ Stop</button></div></section>
<div class="article"><nav class="toc" aria-label="Contents"><strong>Contents</strong>{tocs}</nav>
<article class="content">
<p class="callout warn"><strong>Educational only.</strong> This is not medical advice. If you are worried about your memory or someone else's, please see a doctor.</p>
{html}
</article></div></main>
<footer id="site-footer"></footer>
<script src="js/common.js"></script>
<script>
document.getElementById("readAloud").onclick=()=>{{if(Sound.muted){{toast("Turn sound on (🔊) to hear it");return;}}speechSynthesis.cancel();const ul=document.querySelector("article ul");speak("The short version. "+ul.innerText.replace(/\\[\\d+\\]/g,""),0.9);}};
document.getElementById("stopRead").onclick=()=>window.speechSynthesis&&speechSynthesis.cancel();
</script>
</body></html>'''
open('writeup.html','w').write(page)
print(len(page), [t for _,t in toc])
