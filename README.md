# 🧠 Memory for Life — Memory in Old Age

An easy-to-read, evidence-based website about memory in later life: **why memory changes, how it is tested, how to improve it**, plus **practice exercises**, a **private log**, a **doctors' tests guide**, **traditional remedies**, **games research** and **memory games with sound**.

**🌐 Live site:** https://jalam1001.github.io/memory-in-old-age/

Designed for older adults and their families: large type, high contrast, warm colours, big buttons, gentle animations, keyboard support, a visible sound on/off button, spoken word lists, and relaxed (untimed) pacing by default. Plain HTML/CSS/JavaScript — **no JavaScript dependencies, no frameworks, no build step for the site, no trackers, no external assets**. Scores and log entries are saved only in the visitor's own browser (`localStorage`).

## What's on the site

| Page | Contents |
|---|---|
| **Home** | Key facts, quick links, and your recent scores |
| **Write-up** | Normal ageing vs. MCI vs. dementia, causes of decline, the 14 Lancet Commission risk factors, treatable causes, how memory is tested, how to improve it, which abilities hold up with age, everyday medicine-forgetting examples, therapies and treatments, and 27 references |
| **Doctors' tests** (`clinical-tests.html`) | Comparison of MoCA, Mini-Cog, SLUMS, MMSE, AD8 and RAVLT (what each measures, who gives it, time, limitations), how clinicians use everyday function and repeat testing (including practice effects), and official links with permission notes — no test is reproduced on the site |
| **Practice exercises** (`tests.html`) | Home-made, unvalidated practice activities (not clinical tests): word list (immediate + delayed recall), digit span, Corsi-style block tapping, reaction speed, story recall, and a results history. Relaxed pace by default (press *Next* for each word; slower digits/blocks), optional timed pace; reaction speed is timed by design |
| **Traditional remedies** (`remedies.html`) | Rosemary (inhaled aroma vs dried leaf vs essential oil; short-term studies) and gotu kola (meta-analysis: no significant cognitive benefit; rare liver injury), essential-oil poisoning risks, "talk to your doctor/pharmacist" note — no doses or treatment claims |
| **Games research** (`games-research.html`) | Evidence for crosswords, spaced recall, picture matching, sequence recall, Sudoku and visual speed / divided-attention training (who was studied, what improved, transfer, durability), the crossword-vs-games MCI trial and ACTIVE 20-year follow-up with explicit limits, the spaced-retrieval pilot, and verified free browser games |
| **My log** (`log.html`) | Private, browser-only log: dated entries by category (memory, mood, sleep, medications, other), optional attached scores, print view, CSV/JSON export, delete-all |
| **Improve memory** | Strategies for *building* memories (attention, elaboration, chunking, dual coding, memory palace) and *recalling* them (retrieval practice, spacing, context cues), lifestyle evidence table and therapies & treatments table, each with evidence-type labels, a spaced-review planner, and a daily routine |
| **Games** | **Main (untimed):** ✏️ Crossword (easy/medium/hard, 2 hand-written puzzles each, check & reveal) · 🗂️ Spaced Recall (your own names/facts, reviewed at 1 · 3 · 7 · 14 · 30 · 60 days, plus an in-session practice round) · 🃏 Picture Pairs (4–15 pairs, optional timer) · 📈 per-game progress history. **More games:** 🎵 Simon Tones · 🔍 What Changed? · 🛒 Grocery List · 🔷 Pattern Grid · 🔁 N-Back — each starts in 🌿 **Relaxed** pace (study until *I'm ready*, slower Simon with replay, self-paced N-Back) with an optional ⏱️ **Timed** pace; best scores are kept per pace |

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

## Research sources (summary)

Every figure on the site comes from a source that was opened or confirmed (via PubMed, PMC or Crossref when a publisher blocks automated access). Main groups:

- **Causes, risk and normal ageing:** 2024 Lancet Commission on dementia; NIA pages on forgetfulness, the ageing brain, medicines and treatment; Alzheimer's Association Facts & Figures and 10 warning signs; Harada et al. 2013 (normal cognitive aging); Salthouse 1996 (processing speed); Gray et al. 2015 (anticholinergics).
- **Testing:** Alzheimer's Association clinical practice guideline (DETeCD-ADRD, 2024–25); original MoCA, Mini-Cog, SLUMS, MMSE, AD8 and RAVLT papers and official pages; Calamia et al. 2012 (practice effects).
- **What helps:** Erickson 2011 (exercise), FINGER 2015, U.S. POINTER (JAMA 2025), ACHIEVE 2023, ACTIVE 10-year (2014) and 20-year claims follow-up (2026), MIND diet trial 2023, Roediger & Karpicke 2006 (retrieval practice), Cochrane reviews of cognitive rehabilitation and cognitive stimulation (2023).
- **Remedies:** Moss & Oliver 2012 (rosemary aroma), Pengelly 2012 (dried rosemary), Poison Control on essential oils, Puttarak 2017 (gotu kola meta-analysis), LiverTox (Centella asiatica).
- **Games:** Devanand 2022 (crosswords vs games in MCI, NEJM Evidence), Smith 2024 (spaced-retrieval app pilot, JMIR), Melby-Lervåg 2016 (working-memory training), Brooker 2019 (number puzzles), Simons 2016 (brain-training review).

Full reference lists are on each page (`writeup.html#references`, and the *Sources* section of `clinical-tests.html`, `remedies.html` and `games-research.html`).

## Setup — run locally

No install is needed to view the site. Either open `index.html` directly in a browser, or (recommended, so every feature behaves as it does online) serve the folder:

```bash
git clone https://github.com/Jalam1001/memory-in-old-age.git
cd memory-in-old-age
python3 -m http.server 8000
# open http://localhost:8000
```

## Build — regenerate the write-up

`writeup.html` is generated from `WRITEUP.md`. The only build dependency is the Python `markdown` package, pinned in `requirements.txt` (the lockfile equivalent; there are no JavaScript dependencies):

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python3 scripts/build_writeup.py      # run from the repo root
```

## Check links

```bash
python3 scripts/check_links.py --report linkcheck/report.tsv --blocked-out linkcheck/blocked.txt --include-errors
```

Uses only the Python standard library. Each external link is classed as `ok`, `dead` (404/410/DNS — fix these), `blocked` (403/202/203/429 or a captcha page — the site is fine but refuses automated requests, so check it in a real browser) or `error` (timeouts/5xx). Exit code 1 means a dead link was found.

## Deploy

GitHub Pages serves the site from the **root of the `main` branch** (Settings → Pages → *Deploy from a branch* → `main` / `(root)`). A `.nojekyll` file disables Jekyll processing. Pushing to `main` publishes within about a minute:

```bash
git push origin main
```

## Structure

```
index.html  writeup.html  clinical-tests.html  tests.html  improve.html  remedies.html  games.html  games-research.html  log.html
css/style.css
js/common.js   # header/footer, Web Audio sounds, speech, storage, Pace (relaxed/timed), tabs, animations
js/tests.js    # practice exercises
js/log.js      # private clinician log
js/games.js    # Picture Pairs + Simon, What Changed?, Grocery List, Pattern Grid, N-Back
js/games2.js   # Crossword, Spaced Recall, progress view
WRITEUP.md     # full write-up + references (source for writeup.html)
scripts/build_writeup.py   # WRITEUP.md -> writeup.html
scripts/check_links.py     # external link checker
requirements.txt           # pinned Python build dependency (markdown)
.nojekyll
```

## Versions

- **Version 0.2** — the current site, deployed from `main`. It will be tagged `v0.2` after the bot-blocked links have been checked in a real browser.
  - Stage 5: relaxed/untimed pace by default for Simon, What Changed?, Grocery List, Pattern Grid, N-Back and the word list, with slower pacing for digit span and block tapping and an optional timed pace everywhere (reaction speed labelled "timed by design"); best scores kept per pace and history labelled with the pace; README setup/build/deploy docs; `requirements.txt`; `scripts/check_links.py` link checker; write-up link fixes (stray punctuation in a PubMed link; free PMC links added for the two Cochrane reviews); footer now reads "Version 0.2".
  - Stage 4: Games research page (linked from the Games page, each main game and the home page) covering six game types, NEJM Evidence crossword trial, ACTIVE 20-year claims-based follow-up, JMIR spaced-retrieval pilot, working-memory training meta-analysis, PROTECT number puzzles, and checked free browser game links.
  - Stage 3: Traditional remedies page (rosemary, gotu kola) in nav and home; Improve page adds evidence-type labels (better test scores / better everyday functioning / slower decline / not shown / observational risk link), a therapies and treatments table (reversible causes, cognitive rehabilitation, group cognitive stimulation therapy, Alzheimer's medicines) and splits U.S. POINTER into overall vs episodic-memory results (JAMA 2025); write-up adds abilities that hold up with age, everyday medicine-forgetting examples, the NIA "what's normal" guide, and refs 19–27.
  - Stage 2: "Memory tests doctors use" page (MoCA, Mini-Cog, SLUMS, MMSE, AD8, RAVLT comparison; how clinicians use function, repeat testing and practice effects; official links and why we link instead of embedding), private clinician log with print and CSV/JSON export, and "Self-tests" renamed "Practice exercises" site-wide (same `tests.html` URL).
  - Stage 1: three main games built in and placed first on the Games page — Crossword with difficulty levels, Spaced Recall for names and facts, Picture Pairs with adjustable board sizes. All untimed by default, with explanations of what each score measures and a per-game progress view. Data stays in the browser (`localStorage`), with clear-data buttons.
- **Version 0.1 — original site** — tag [`v0.1`](https://github.com/Jalam1001/memory-in-old-age/releases/tag/v0.1), branch [`v0.1`](https://github.com/Jalam1001/memory-in-old-age/tree/refs/heads/v0.1) (commit `c8baf04`). Write-up, self-tests, six games with sound.


## Disclaimer

Educational content only — not medical advice. Always consult a qualified health professional about memory concerns.
