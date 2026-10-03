# waveeditonline — copia d'archivio offline

Questa cartella contiene una copia di **http://waveeditonline.com** (WaveEdit Online),
purtroppo non più online, preservata tramite **Wayback Machine**
(snapshot 21 giugno 2024: https://web.archive.org/web/20240621052534/http://waveeditonline.com/index.html).

Stato della copia (verificato il 3 ott 2026 su web.archive.org, Arquivo.pt e Common Crawl):

- `index.html` + `index-1.html` … `index-23.html`: le 24 pagine della paginazione originale.
  10 pagine (`index`, `1`, `2`, `3`, `4`, `5`, `14`, `16`, `17`, `22`) sono gli originali
  archiviati; le altre 14 **non sono mai state salvate da nessun archivio web**, quindi sono
  ricostruite come segnaposto nello stesso stile (navigazione Prev/Next intatta) con rimando
  al catalogo. Le pagine originali coprono ~300 dei 695 banchi con nomi, date, autori e note.
- `art.html`: vista hi-res del singolo banco (`?fn=*.json`), originale preservato.
- `css/`, `js/`: fogli di stile e script originali (i percorsi `/files/` sono stati
  resi relativi `files/` per funzionare da sottocartella; jQuery da CDN).
- `files/*.json`: dati per disegnare i grafici a canvas (uno per banco, 16384 campioni).
  Recuperati da Wayback; quelli mai archiviati sono stati rigenerati dai WAV con la stessa
  formula del sito originale (json = -troncamento(wav/1024)), verificata esatta su 139/140
  banchi campione. Tutti i grafici delle 10 pagine originali sono visibili come sul sito vero.
- `wav/*.WAV`: **tutti i 713 banchi** estratti da `wav-files.zip` (PCM mono 16-bit,
  64 forme × 256 campioni). Ogni file suona e si apre in WaveEdit.
- `wav-files.zip`: archivio completo originale del sito (13 giu 2024, 19 MB).
- `catalogo.html`: elenco completo di tutti i banchi con link di download,
  ricostruito dallo ZIP per non perdere nulla delle pagine mancanti.

Tutti i wavetable sono **CC0 1.0 Universal (Public Domain)**.
Servizio originale di **Martin Doudoroff LLC** per **Synthesis Technology**
(E370 / E352, compatibili anche Piston Honda Mark III e Qu-Bit Chord v2).

Strumenti: `mirror.py` (download da Wayback con backoff), `build_missing.py`
(segnaposto + catalogo). Per completare i JSON mancanti: `python3 mirror.py --only-json --skip-wav`.
