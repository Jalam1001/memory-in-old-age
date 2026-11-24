# 🧠 Memory for Life — Memory in Old Age

An easy-to-read, evidence-based website about memory in later life: **why memory changes, how it is tested, how to improve it**, plus **practice exercises**, a **private log**, a **doctors' tests guide** and **memory games with sound**.

**🌐 Live site:** https://jalam1001.github.io/memory-in-old-age/

Designed for older adults and their families: large type, high contrast, warm colours, big buttons, gentle animations, keyboard support, a visible sound on/off button, and spoken word lists. Plain HTML/CSS/JavaScript — no build step, no trackers, no external assets. Scores are saved only in the visitor's own browser (`localStorage`).

## What's on the site

| Page | Contents |
|---|---|
| **Home** | Key facts, quick links, and your recent scores |
| **Write-up** | Normal ageing vs. MCI vs. dementia, causes of decline, the 14 Lancet Commission risk factors, treatable causes, how memory is tested, how to improve it, and 18 references |
| **Doctors' tests** (`clinical-tests.html`) | Comparison of MoCA, Mini-Cog, SLUMS, MMSE, AD8 and RAVLT (what each measures, who gives it, time, limitations), how clinicians use everyday function and repeat testing (including practice effects), and official links with permission notes — no test is reproduced on the site |
| **Practice exercises** (`tests.html`) | Home-made, unvalidated practice activities (not clinical tests): word list (immediate + delayed recall), digit span, Corsi-style block tapping, reaction speed, story recall, and a results history |
| **My log** (`log.html`) | Private, browser-only log: dated entries by category (memory, mood, sleep, medications, other), optional attached scores, print view, CSV/JSON export, delete-all |
| **Improve memory** | Strategies for *building* memories (attention, elaboration, chunking, dual coding, memory palace) and *recalling* them (retrieval practice, spacing, context cues), lifestyle evidence table, a spaced-review planner, and a daily routine |
| **Games** | **Main (untimed):** ✏️ Crossword (easy/medium/hard, 2 hand-written puzzles each, check & reveal) · 🗂️ Spaced Recall (your own names/facts, reviewed at 1 · 3 · 7 · 14 · 30 · 60 days, plus an in-session practice round) · 🃏 Picture Pairs (4–15 pairs, optional timer) · 📈 per-game progress history. **More games:** 🎵 Simon Tones · 🔍 What Changed? · 🛒 Grocery List · 🔷 Pattern Grid · 🔁 N-Back |

**Sound:** all tones are generated live with the Web Audio API (flip, correct, wrong, win, Simon notes, block tones). Word lists, digits, stories and N-back letters can be read aloud with the browser's speech synthesis. One mute button controls everything.

> ⚠️ **Not a diagnostic tool.** The practice exercises are home-made and unvalidated — not clinical tests. If you are worried about memory, please see a doctor.

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
index.html  writeup.html  clinical-tests.html  tests.html  improve.html  games.html  log.html
css/style.css
js/common.js   # header/footer, Web Audio sounds, speech, storage, tabs, animations
js/tests.js    # practice exercises
js/log.js      # private clinician log
js/games.js    # Picture Pairs + extra games
js/games2.js   # Crossword, Spaced Recall, progress view
WRITEUP.md     # full write-up + references
```

## Changelog

- **Version 0.2 — in progress** (deployed from `main`)
  - Stage 2: "Memory tests doctors use" page (MoCA, Mini-Cog, SLUMS, MMSE, AD8, RAVLT comparison; how clinicians use function, repeat testing and practice effects; official links and why we link instead of embedding), private clinician log with print and CSV/JSON export, and "Self-tests" renamed "Practice exercises" site-wide (same `tests.html` URL).
  - Stage 1: three main games built in and placed first on the Games page — Crossword with difficulty levels, Spaced Recall for names and facts, Picture Pairs with adjustable board sizes. All untimed by default, with explanations of what each score measures and a per-game progress view. Data stays in the browser (`localStorage`), with clear-data buttons.
- **Version 0.1 — original site** — tag [`v0.1`](https://github.com/Jalam1001/memory-in-old-age/releases/tag/v0.1), branch [`v0.1`](https://github.com/Jalam1001/memory-in-old-age/tree/refs/heads/v0.1) (commit `c8baf04`). Write-up, self-tests, six games with sound.

## Disclaimer

Educational content only — not medical advice. Always consult a qualified health professional about memory concerns.
