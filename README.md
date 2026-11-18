# 🧠 Memory for Life — Memory in Old Age

An easy-to-read, evidence-based website about memory in later life: **why memory changes, how it is tested, how to improve it**, plus interactive **self-tests** and **memory games with sound**.

**🌐 Live site:** https://jalam1001.github.io/memory-in-old-age/

Designed for older adults and their families: large type, high contrast, warm colours, big buttons, gentle animations, keyboard support, a visible sound on/off button, and spoken word lists. Plain HTML/CSS/JavaScript — no build step, no trackers, no external assets. Scores are saved only in the visitor's own browser (`localStorage`).

## What's on the site

| Page | Contents |
|---|---|
| **Home** | Key facts, quick links, and your recent scores |
| **Write-up** | Normal ageing vs. MCI vs. dementia, causes of decline, the 14 Lancet Commission risk factors, treatable causes, how memory is tested, how to improve it, and 18 references |
| **Self-tests** | Word list (immediate + delayed recall), digit span (forward/backward), Corsi-style block tapping, reaction speed, story recall, and a results history |
| **Improve memory** | Strategies for *building* memories (attention, elaboration, chunking, dual coding, memory palace) and *recalling* them (retrieval practice, spacing, context cues), lifestyle evidence table, a spaced-review planner, and a daily routine |
| **Games** | 🃏 Memory Match · 🎵 Simon Tones · 🔍 What Changed? · 🛒 Grocery List · 🔷 Pattern Grid · 🔁 N-Back — each with difficulty levels and saved best scores |

**Sound:** all tones are generated live with the Web Audio API (flip, correct, wrong, win, Simon notes, block tones). Word lists, digits, stories and N-back letters can be read aloud with the browser's speech synthesis. One mute button controls everything.

> ⚠️ **Not a diagnostic tool.** The self-tests are informal, unvalidated versions of research tasks. If you are worried about memory, please see a doctor.

## Write-up summary

- **Some change is normal**: slower processing, more tip-of-the-tongue moments, needing more time to learn — without loss of independence.
- **MCI** affects roughly 10–20% of people over 65; roughly 10–15% of people with MCI progress to dementia each year, but some stay stable or improve.
- **Causes** include hippocampal shrinkage (≈1–2%/year in older adults), slower processing speed, Alzheimer's and vascular disease, and modifiable risks. The **2024 Lancet Commission** estimates ~**45%** of dementia could in theory be prevented or delayed by addressing 14 factors (e.g. hearing loss 7%, high LDL cholesterol 7%, less education 5%, social isolation 5%).
- **Rule out treatable causes**: medicines (especially strong anticholinergics), low B12, thyroid problems, depression, poor sleep, hearing/vision loss.
- **Testing**: Mini-Cog, MoCA, MMSE screening; word-list learning with delayed recall (CERAD, RAVLT), story recall, digit span, Corsi blocks, Trail Making, clock drawing.
- **What helps**: aerobic exercise (≈2% hippocampal growth in a 1-year walking trial), multidomain programmes (FINGER, U.S. POINTER), hearing care (ACHIEVE), varied cognitive training (ACTIVE), social engagement, heart-health management, sleep — and techniques like **retrieval practice** (61% vs 40% retained after a week) and **spaced repetition**.

📄 Full write-up with references: [WRITEUP.md](WRITEUP.md) (also rendered on the site as `writeup.html`).

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

To regenerate `writeup.html` after editing `WRITEUP.md`: `pip install markdown && python3 scripts/build_writeup.py` (run from the repo root).

## Structure

```
index.html  writeup.html  tests.html  improve.html  games.html
css/style.css
js/common.js   # header/footer, Web Audio sounds, speech, storage, tabs, animations
js/tests.js    # self-tests
js/games.js    # games
WRITEUP.md     # full write-up + references
```

## Disclaimer

Educational content only — not medical advice. Always consult a qualified health professional about memory concerns.
