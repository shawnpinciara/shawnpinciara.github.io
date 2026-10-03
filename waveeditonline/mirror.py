#!/usr/bin/env python3
"""Mirror waveeditonline.com from Wayback Machine into this folder (offline copy).
Uso: python3 mirror.py [--pages N] [--skip-wav] [--skip-json] [--only-json] [--only-pages]
- Scarica index.html + index-1..index-N (default 23) via Wayback (snapshot piu vicino a 2024-06-21)
- Scarica css/js/art.html, files/*.json, wav/*.WAV, wav-files.zip
- I percorsi assoluti /files/ negli script sono gia stati resi relativi (files/).
Eseguire con pause generose per non farsi bloccare da web.archive.org.
"""
import os, re, sys, time, argparse, urllib.request, ssl
ssl._create_default_https_context = ssl._create_unverified_context
BASE = os.path.dirname(os.path.abspath(__file__))
UA = {'User-Agent': 'Mozilla/5.0 (compatible; waveeditonline-mirror; CC0-preservation)'}
TS = "20240621"  # snapshot piu vicino a giugno 2024 (prima della scadenza del dominio)

BANNER = """
<div style="background:#fff8c5;border-bottom:2px solid #e3b341;padding:10px 16px;font-family:sans-serif;font-size:14px;color:#333;">
<strong>Archived copy of waveeditonline.com</strong> (original site offline, last snapshot 21 Jun 2024 via
<a href="https://web.archive.org/web/20240621052534/http://waveeditonline.com/index.html">Wayback Machine</a>).
All wavetables are <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 Public Domain</a>.
Original service by <a href="http://doudoroff.com">Martin Doudoroff LLC</a> for <a href="http://synthtech.com">Synthesis Technology</a>.
<a href="../">Back to shawnpinciara.github.io</a>
</div>
"""

VARIANTS = ["https://waveeditonline.com", "http://waveeditonline.com",
            "https://www.waveeditonline.com", "http://www.waveeditonline.com"]

def fetch(url, timeout=40):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read(), r.url

def fetch_best(path, timeout=40):
    """Prova le varianti http/https+www, restituisce (data, final_url) della prima che risponde 200."""
    last = None
    for i, host in enumerate(VARIANTS):
        if i:
            time.sleep(2)
        url = f"https://web.archive.org/web/{TS}id_/{host}/{path}"
        try:
            return fetch(url, timeout)
        except Exception as e:
            last = e
    raise last

def save(path, rel):
    try:
        data, final = fetch_best(path)
        p = os.path.join(BASE, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, 'wb').write(data)
        print(f"OK {rel} {len(data)} ({final[:100]})", flush=True)
        return data
    except Exception as e:
        print(f"ERR {rel}: {str(e)[:200]}", flush=True)
        return None

def patch_html(data: bytes) -> bytes:
    s = data.decode('utf-8', 'replace')
    s = re.sub(r'<!-- BEGIN WAYBACK TOOLBAR INSERT -->.*?<!-- END WAYBACK TOOLBAR INSERT -->', '', s, flags=re.S)
    s = re.sub(r'(<body[^>]*>)', r'\1' + BANNER, s, count=1, flags=re.I)
    return s.encode('utf-8')

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages", type=int, default=23)
    ap.add_argument("--skip-wav", action="store_true")
    ap.add_argument("--skip-json", action="store_true")
    ap.add_argument("--only-json", action="store_true")
    ap.add_argument("--only-pages", action="store_true")
    ap.add_argument("--delay", type=float, default=8.0)
    a = ap.parse_args()

    names = ["index.html"] + [f"index-{i}.html" for i in range(1, a.pages + 1)]

    if not a.only_json:
        # 1. asset statici
        for orig, rel in [
            ("css/style2.css", "css/style2.css"),
            ("css/art.css", "css/art.css"),
            ("js/page2-min.js", "js/page2-min.js"),
            ("js/art-min.js", "js/art-min.js"),
            ("art.html", "art.html"),
        ]:
            if not os.path.exists(os.path.join(BASE, rel)) or os.path.getsize(os.path.join(BASE, rel)) < 100:
                save(orig, rel); time.sleep(a.delay)

        jq = os.path.join(BASE, "js/jquery-3.2.1.min.js")
        if not os.path.exists(jq) or os.path.getsize(jq) < 1000:
            try:
                data, _ = fetch("https://code.jquery.com/jquery-3.2.1.min.js")
                open(jq, 'wb').write(data); print("OK js/jquery-3.2.1.min.js", len(data), flush=True)
            except Exception as e:
                print("ERR jquery", e, flush=True)
            time.sleep(a.delay)

    if not a.only_json:
        # 2. pagine indice
        for n in names:
            p = os.path.join(BASE, n)
            if os.path.exists(p) and os.path.getsize(p) > 5000:
                print(f"SKIP {n} (gia presente)", flush=True)
                continue
            data = save(n, "_tmp.html")
            time.sleep(a.delay)
            if data:
                open(p, 'wb').write(patch_html(data))
                print(f"SAVED {n}", flush=True)
            else:
                print(f"FAILED {n} (riprova piu tardi)", flush=True)

    if not a.only_pages:
        # 3. raccogli json + wav dagli HTML salvati
        fns, wavs = set(), set()
        for n in names:
            p = os.path.join(BASE, n)
            if not os.path.exists(p):
                continue
            s = open(p, encoding='utf-8', errors='replace').read()
            fns.update(re.findall(r"data-fn='([^']+\.json)'", s))
            wavs.update(re.findall(r"wav/([A-Za-z0-9_\.\-]+\.WAV)", s))
        print(f"Trovati {len(fns)} json, {len(wavs)} wav", flush=True)
        open(os.path.join(BASE, "filelist.txt"), "w").write(
            "json:\n" + "\n".join(sorted(fns)) + "\n\nwav:\n" + "\n".join(sorted(wavs)) + "\n")

        # 4. json
        if not a.skip_json:
            for fn in sorted(fns):
                p = os.path.join(BASE, "files", fn)
                if os.path.exists(p) and os.path.getsize(p) > 100:
                    continue
                save(f"files/{fn}", f"files/{fn}")
                time.sleep(3)

        # 5. zip + wav singoli (gli snapshot wayback dei singoli wav sono spesso stub da 44 byte)
        if not a.skip_wav:
            zp = os.path.join(BASE, "wav-files.zip")
            if not os.path.exists(zp) or os.path.getsize(zp) < 1000000:
                save("wav-files.zip", "wav-files.zip")
                time.sleep(a.delay)
            for w in sorted(wavs):
                p = os.path.join(BASE, "wav", w)
                if os.path.exists(p) and os.path.getsize(p) > 1000:
                    continue
                data = save(f"wav/{w}", f"wav/{w}")
                if data is not None and len(data) <= 100:
                    print(f"WARN {w} stub ({len(data)} bytes), rimosso", flush=True)
                    try: os.remove(p)
                    except OSError: pass
                time.sleep(3)
    print("FINITO", flush=True)
