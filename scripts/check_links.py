#!/usr/bin/env python3
"""Check every external link on the site (standard library only).

Usage:
  python3 scripts/check_links.py [--blocked-out FILE] [--report FILE]

Scans all *.html files in the repo root for http(s) links, fetches each one
with a browser-like User-Agent, and sorts them into:
  ok       - 2xx after redirects
  blocked  - bot protection (403, 202, 203, 405, 429, 999 or a captcha /
             "checking your browser" page): needs a check in a real browser
  dead     - 404 / 410 / DNS failure: genuinely broken, fix these
  error    - timeouts, 5xx, TLS errors: retry later / check manually
Exit code is 1 if any link is dead.
"""
import argparse, concurrent.futures as cf, glob, html, os, re, ssl, sys, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/124.0 Safari/537.36")
BLOCK_CODES = {202, 203, 401, 403, 405, 406, 429, 999}
CAPTCHA = re.compile(r"just a moment|checking your browser|captcha|are you a robot|"
                     r"verify you are human|access denied|request rejected|enable javascript and cookies", re.I)

def collect():
    links = {}
    for f in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
        text = open(f, encoding="utf-8").read()
        for m in re.finditer(r'href="(https?://[^"#]+[^"]*)"', text):
            url = html.unescape(m.group(1))
            links.setdefault(url, set()).add(os.path.basename(f))
    return links

def check(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
                                               "Accept-Language": "en-US,en;q=0.9"})
    try:
        with urllib.request.urlopen(req, timeout=25, context=ssl.create_default_context()) as r:
            code = r.status
            body = r.read(200000).decode("utf-8", "ignore")
            if code in BLOCK_CODES:
                return "blocked", code
            title = re.search(r"<title[^>]*>(.*?)</title>", body, re.I | re.S)
            if title and CAPTCHA.search(title.group(1)):
                return "blocked", f"{code} captcha"
            return "ok", code
    except urllib.error.HTTPError as e:
        if e.code in (404, 410):
            return "dead", e.code
        if e.code in BLOCK_CODES:
            return "blocked", e.code
        return "error", e.code
    except urllib.error.URLError as e:
        reason = str(e.reason)
        if "Name or service not known" in reason or "nodename nor servname" in reason:
            return "dead", "DNS"
        return "error", reason[:60]
    except Exception as e:  # timeouts, connection resets
        return "error", type(e).__name__

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--blocked-out", help="write bot-blocked URLs here, one per line")
    ap.add_argument("--report", help="write a full tab-separated report here")
    ap.add_argument("--include-errors", action="store_true",
                    help="also list timeouts/5xx in --blocked-out (they also need a real-browser check)")
    a = ap.parse_args()
    links = collect()
    with cf.ThreadPoolExecutor(8) as ex:
        results = dict(zip(links, ex.map(check, links)))
    rows = sorted(results.items(), key=lambda kv: (kv[1][0], kv[0]))
    counts = {}
    for url, (status, code) in rows:
        counts[status] = counts.get(status, 0) + 1
        print(f"{status:8} {str(code):14} {url}   [{', '.join(sorted(links[url]))}]")
    print("\nSummary:", ", ".join(f"{k}={v}" for k, v in sorted(counts.items())), f"(total {len(rows)})")
    if a.report:
        os.makedirs(os.path.dirname(os.path.abspath(a.report)), exist_ok=True)
        with open(a.report, "w") as f:
            f.write("status\tcode\turl\tpages\n")
            for url, (status, code) in rows:
                f.write(f"{status}\t{code}\t{url}\t{', '.join(sorted(links[url]))}\n")
    if a.blocked_out:
        os.makedirs(os.path.dirname(os.path.abspath(a.blocked_out)), exist_ok=True)
        with open(a.blocked_out, "w") as f:
            for url, (status, code) in rows:
                if status == "blocked" or (a.include_errors and status == "error"):
                    f.write(url + "\n")
    return 1 if counts.get("dead") else 0

if __name__ == "__main__":
    sys.exit(main())
