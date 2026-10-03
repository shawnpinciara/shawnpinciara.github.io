#!/usr/bin/env python3
"""Genera segnaposto per le pagine mai archiviate + catalogo completo dei banchi."""
import os
BASE = os.path.dirname(os.path.abspath(__file__))

BANNER = """
<div style="background:#fff8c5;border-bottom:2px solid #e3b341;padding:10px 16px;font-family:sans-serif;font-size:14px;color:#333;">
<strong>Archived copy of waveeditonline.com</strong> (original site offline, last snapshot 21 Jun 2024 via
<a href="https://web.archive.org/web/20240621052534/http://waveeditonline.com/index.html">Wayback Machine</a>).
All wavetables are <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 Public Domain</a>.
Original service by <a href="http://doudoroff.com">Martin Doudoroff LLC</a> for <a href="http://synthtech.com">Synthesis Technology</a>.
<a href="../">Back to shawnpinciara.github.io</a>
</div>
"""

INTRO = """<p>WaveEdit is the free, open-source wavetable editor developed by Synthesis Technology for the <a href="http://synthtech.com/eurorack/E370/">E370 Quad Morphing VCO</a> and <a href="http://synthtech.com/eurorack/E352/">E352 Cloud Terrarium VCO</a> Eurorack format wavetable oscillators. WaveEdit wavetables are also compatible with the <a href="http://www.industrialmusicelectronics.com/products/21">Piston Honda Mark III</a> from Industrial Music Electronics and the <a href="http://www.qubitelectronix.com/modules/chord-v2">Qu-Bit Chord v2</a>. You can download WaveEdit at <a href="http://synthtech.com/waveedit">http://synthtech.com/waveedit</a> for Mac, Windows and Linux.</p>

<p>This site presents a growing library of free wavetable banks shared by WaveEdit users via the WaveEdit Online tab within the software. All wavetables here are under <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 Universal (CC0 1.0) Public Domain Dedication</a>.</p>"""

FOOTER = """<footer>
<p>WaveEdit Online is a free wavetable sharing service provided by <a href="http://doudoroff.com">Martin Doudoroff LLC</a> on behalf of <a href="http://synthtech.com">Synthesis Technology</a> for the community of WaveEdit users.</p>
</footer>"""

def nav(page, total_banks=695):
    a = (page - 1) * 30 + 1
    b = min(page * 30, total_banks)
    prev = "index.html" if page == 2 else (f"index-{page-2}.html" if page > 2 else None)
    nxt = f"index-{page}.html" if page < 24 else None
    def btn(fname, label):
        return f'<a href="{fname}"><span class="fauxbutton">{label}</span></a>' if fname else '<span class="fauxbuttondisabled">Prev</span>' if label == "Prev" else '<span class="fauxbuttondisabled">Next</span>'
    return (f'<nav>{btn(prev, "Prev")}<span class="navinfo">Page {page} of 24 (banks {a}\u2014{b} of {total_banks})</span>'
            f'{btn(nxt, "Next")}<a href="wav-files.zip"><span class="fauxbutton" style="float:right;">Download all WAV at once (ZIP file)</span></a></nav>')

MISSING_NOTE = """<section><div class="description">
<p class="datestamp">page not archived</p><h3>Content unavailable on the Wayback Machine</h3>
<p class="notes">This page was never saved by the Wayback Machine (checked on web.archive.org,
Arquivo.pt and Common Crawl), so the original bank list with descriptions and graphs was lost
when the site went offline. All audio files are still available: see the
<a href="catalogo.html">complete bank catalog</a> (rebuilt from the original ZIP with all WAVs)
or download <a href="wav-files.zip">all WAVs in a single ZIP</a>.</p>
</div></section>"""

# 1. segnaposto pagine mancanti (nella catena index.html=page1, index-N.html=page N+1)
import glob
have = {f for f in glob.glob(BASE + "/index*.html")}
for n in range(1, 24):
    fname = f"index-{n}.html"
    if os.path.join(BASE, fname) in have or fname in [os.path.basename(h) for h in have]:
        continue
    page = n + 1
    html = ("""<!doctype html>
<html class="no-js" lang="">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>WaveEdit Online</title>
        <meta name="description" content="wavetable sharing service for Synthesis Technology's WaveEdit wavetable editing tool">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="css/style2.css">
    </head>
\t<body>
""" + BANNER + "\n<h1><strong>W</strong>AVE<strong>E</strong>DIT <strong>O</strong>NLINE</h1>\n\n"
            + INTRO + nav(page) + MISSING_NOTE + nav(page) + FOOTER + "\n</body>\n</html>\n")
    open(os.path.join(BASE, fname), "w", encoding="utf-8").write(html)
    print("placeholder", fname, f"(page {page})")

# 2. catalogo completo dai wav locali
wavs = sorted(f for f in os.listdir(os.path.join(BASE, "wav")) if f.upper().endswith(".WAV"))
rows = "\n".join(
    f'<section><div class="description"><h3>{w[:-4]}</h3></div>'
    f'<div class="buttons"><a href="wav/{w}"><span class="fauxbutton">Download {w}</span></a></div></section>'
    for w in wavs)
cat = ("""<!doctype html>
<html class="no-js" lang="">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title>WaveEdit Online - Complete bank catalog</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="css/style2.css">
    </head>
\t<body>
""" + BANNER + "\n<h1><strong>W</strong>AVE<strong>E</strong>DIT <strong>O</strong>NLINE</h1>\n\n"
       + f"<p>Complete catalog of all <strong>{len(wavs)}</strong> preserved banks (from the site's original "
         "ZIP, 13 Jun 2024). All under CC0 1.0 Public Domain. "
         '<a href="index.html">Back to index</a> · <a href="wav-files.zip">Download everything as ZIP</a>.</p>\n'
       + rows + FOOTER + "\n</body>\n</html>\n")
open(os.path.join(BASE, "catalogo.html"), "w", encoding="utf-8").write(cat)
print("catalogo.html con", len(wavs), "banchi")
