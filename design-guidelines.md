# Design Guidelines — Shawn Pinciara's Site

> **Istrazione principale:** `cv/index.html` (timeline CV con layout centrato, colori blu, font Montserrat, mobile-first).  
> **Obiettivo:** permettere a qualsiasi agente AI di generare pagine che sembrino "di famiglia", senza replicare file per file ma seguendo il design language.

---

## 1. Filosofia generale

- **Mobile-first di default.** Ogni pagina usa `max-width: 3xl` / `w-10/12` centrato; il desktop è un arricchimento (`md:flex-row`, `md:w-1/2`), non il default.
- **Single-column centrato:** contenuto in una colonna stretta (`max-w-3xl` ~768px) con margini generosi, non layout a griglia ampia.
- **Sfondo caldo, testo freddo:** sfondo crema (`#fffbf5`) o azzurro molto chiaro (`#e8f2fb`) con testo blu scuro (`#154c79`). Nessun grigio neutro come base.
- **Nessun framework pesante per il layout:** Tailwind CSS via CDN (`cdn.tailwindcss.com`) per utility, ma il CSS custom (`style_bw.css`) gestisce tipografia, colori, componenti ricorrenti (timeline, menu, animazioni).

---

## 2. Palette colori (esatta — non approssimare)

| Ruolo | Hex | Nome uso | Dove visto |
|---|---|---|---|
| **Sfondo principale** | `#fffbf5` | `--maincolor` | body, card |
| **Sfondo secondario / sezioni** | `#fae5c8` | `--secondarycolor` | sezioni alternate |
| **Sfondo azzurro chiaro (sezioni luce)** | `#e8f2fb` | `snap-section-light` | home sections |
| **Testo primario (blu scuro)** | `#154c79` | `--textcolor`, `sp_dark_blue` | titoli, body |
| **Testo secondario (blu medio)** | `#1b66a3` | `--textcolor_bitlighter`, `sp_mid_dark_blue` | sottotitoli, link |
| **Accento / blu chiaro** | `#5199d4` | `sp_light_blue` | date timeline, bordi, "now" |
| **Rosso / errore / attenzione** | `#da373d` | `clifford` | toggle nascosto timeline |
| **Bordo / linea timeline** | `#154c79` | — | linea verticale, dot |
| **Bianco / testo su scuro** | `#fffbf5` | — | testo su gradient blu |

**Regola:** i link sono sottolineati (`text-decoration: underline`), colore `#154c79`, font-weight 600, non cambiano colore al hover (si mantiene coerenza).

---

## 3. Tipografia — Montserrat solo, gerarchia rigida

Caricato via Google Fonts (`Montserrat:ital,wght@0,100..900;1,100..900` + `Material Symbols`). **Nessun altro font.**

| Elemento | Regola CSS (estraida) | Valore |
|---|---|---|
| **Font family globale** | `font-family: "Montserrat", sans-serif;` | — |
| **Body / paragrafo** | `p, ul, li` | `font-size: 1rem`; `font-weight: light` (300); `color: #154c79` |
| **Titolo H1 grande** | `.h1_title`, `h1` | `font-size: 2rem`; `font-weight: bold`; `color: #154c79` |
| **Titolo H2** | `.h2_title` | `font-size: 1.5rem`; `font-weight: bold`; `color: #1b66a3` |
| **Titolo H2 leggero** | `h2` | `font-size: 1.5rem`; `font-weight: lighter`; `color: #1b66a3` |
| **Titolo H3** | `h3` | `font-size: 2.5rem`; `font-weight: 800`; `padding-top: 2rem` |
| **Home / intro grande** | `.p_home`, `.a_home` | `font-size: 1.5rem`; `font-weight: light`; `color: #154c79`; link sottolineato |
| **Timeline — data** | `.timeline-date` | `font-size: 0.85rem` (`~13.6px`); `font-weight: 700`; `text-transform: uppercase`; `letter-spacing: 0.05em`; `color: #5199d4` |
| **Timeline — titolo** | `.timeline-title` | `font-size: 1.25rem`; `font-weight: 700`; `color: #154c79`; `margin-bottom: 0.5rem` |
| **Timeline — body** | `.timeline-body` | `font-size: 0.95rem`; `line-height: 1.6`; `color: #154c79` |
| **Link generico** | `a` | `font-size: 1rem`; `font-weight: 600`; `font-style: normal` |

**Nota:** il testo è leggero (`font-weight: light` / 300) per i body; i titoli sono bold (700) o 800. Non usare font serif né sans altrove.

---

## 4. Layout, padding, spaziatura (dal CV — fonte principale)

Struttura `cv/index.html`:

```html
<div class="w-full h-full flex justify-center">
  <div class="flex flex-col w-10/12 max-w-3xl">
    ... contenuto ...
  </div>
</div>
```

- **Contenitore:** `w-10/12` (~83%) con `max-w-3xl` (~768px). Centra su desktop, rimane stretto su mobile.
- **Header foto + testo:** `flex flex-col md:flex-row` con `gap-6`; immagine `w-full md:w-1/2 h-60 lg:h-96 rounded-md object-cover`; testo `w-full md:w-1/2`.
- **Sezioni:** `mt-10` tra sezioni principali; `mt-6` / `mt-8` per sottosezioni (timeline sotto un titolo).
- **Padding interno timeline:** `padding-left: 2.5rem` (desktop), `2rem` (mobile ≤640px).
- **Padding entry timeline:** `padding-left: 2rem`; `padding-bottom: 2.5rem`.
- **Margin bottom body:** `margin-bottom: 0.25rem` per data; `0.5rem` per titolo.
- **Spaziatura testo corpo:** `line-height: 1.6`; liste con `margin-left: 1.2rem`; `margin-top: 0.3rem`.

**Mobile (`max-width: 640px`):**
- Timeline si comprime: `padding-left: 2rem`; dot 14px; toggle 14px; titolo 1.1rem.
- Header diventa colonna (`flex-col`), foto full width.
- Font leggermente ridotto ma mantenuto leggibile.

---

## 5. Componenti ricorrenti — come ricrearli

### 5.1 Timeline (il componente chiave del CV)

**Struttura:**
```html
<div class="timeline mt-8">
  <!-- wrapper per ogni voce -->
  <div class="timeline-item">
    <div class="timeline-entry now">  <!-- o senza .now -->
      <div class="timeline-date">March 2025 – Present</div>
      <div class="timeline-title">Titolo</div>
      <div class="timeline-body">
        <p>...</p>
        <ul><li>...</li></ul>
      </div>
    </div>
  </div>
</div>
```

**Visuale:**
- Linea verticale blu (`#154c79`, 3px, `border-radius: 2px`) a sinistra, per entry (`::before` su `.timeline-item`).
- Circolo (dot) 17px (`#154c79`) con bordo 3px crema (`#fffbf5`) a sinistra dell'entry; il dot "now" è `#5199d4` con `box-shadow: 0 0 0 4px rgba(81,153,212,0.3)`.
- Toggle nascosto (×) 17px cerchiato, compare al hover (`opacity: 0` → `1`); se hidden, bordo `#da373d` e testo `#da373d`. Clic per nascondere/mostrare voce.
- `page-break-inside: avoid` e `break-inside: avoid` per stampa / PDF.

**CSS essenziali da replicare (estratto dal CV):**
```css
.timeline { position: relative; padding-left: 2.5rem; }
.timeline-entry { position: relative; padding-left: 2rem; padding-bottom: 2.5rem; }
.timeline-entry::before { content:''; position:absolute; left:-2.5rem; top:0.25rem; width:17px; height:17px; background:#154c79; border:3px solid #fffbf5; border-radius:50%; z-index:1; }
.timeline-entry.now::before { background:#5199d4; box-shadow:0 0 0 4px rgba(81,153,212,0.3); }
.timeline-item::before { content:''; position:absolute; left:calc(-2.5rem + 7px); top:0; bottom:0; width:3px; background:#154c79; border-radius:2px; }
.timeline-date { font-weight:700; font-size:0.85rem; color:#5199d4; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem; }
.timeline-title { font-weight:700; font-size:1.25rem; color:#154c79; margin-bottom:0.5rem; }
.timeline-body { font-size:0.95rem; color:#154c79; line-height:1.6; }
```

### 5.2 Header foto + bio (isspirato a `cv/index.html` header)

- Layout: `flex flex-col md:flex-row gap-6`.
- Foto: `w-full md:w-1/2 h-60 lg:h-96 rounded-md object-cover` (bordo arrotondato, ombra implicita dai bordi).
- Testo: `w-full md:w-1/2 text-sp_dark_blue`; nome `text-xl font-semibold`; dati `mt-2`.
- Link email: `text-sp_mid_dark_blue hover:underline`.

### 5.3 Menu orizzontale (da `style_bw.css`, usato nel sito generale)

```css
.menu_container { width:100%; height:5rem; background-color: var(--primarycolor); box-shadow:0 1px 5px rgba(0,0,0,0.12); padding:0; position:fixed; top:0; z-index:99; }
.menu { display:flex; flex-direction:row; flex-wrap:wrap; justify-content:flex-end; margin:auto; width:80%; height:100%; }
.menu_item { font-family:"Montserrat"; font-size:1rem; padding-left:1rem; padding-right:1rem; align-self:center; color:white; }
.menu_hamburger { font-size:3rem; display:none; color:black; } /* visibile solo su mobile */
```

- **Desktop:** menu orizzontale a destra (`justify-flex-end`), sfondo blu (`#154c79` implicito da `primarycolor` o da gradient), voci bianche.
- **Mobile (`max-width:950px`):** `flex-direction: column`, `flex-wrap: nowrap`, `justify-content: center`; voci diventano nere (`color: black`) su sfondo chiaro (`--maincolor`); hamburger visibile (`display: block` o similar).
- **Tabs orizzontali:** non c'è un componente "tab" esplicito nel CV, ma il sito usa il menu come navigazione orizzontale. Per "tabs" in una pagina: replicare lo stile `.menu_item` (font 1rem, padding 1rem orizzontale, colore testo blu o bianco a seconda dello sfondo, sottolineatura implicita o hover).

---

## 6. Elementi grafici ricorrenti (ricreabili)

| Elemento | Come si fa | Note |
|---|---|---|
| **Linee timeline** | `::before` su `.timeline-item`, `width:3px`, `background:#154c79`, `left:calc(-2.5rem + 7px)` | Per entry, non globale |
| **Dot timeline** | `::before` su `.timeline-entry`, cerchio 17px, bordo 3px crema | `now` = blu chiaro con glow |
| **Toggle hide** | pulsante assoluto 17px, `opacity:0` → `1` su hover; `.timeline-hidden` nasconde `.timeline-entry` | JS semplice: `classList.toggle` |
| **Foto rotonda/arrotondata** | `rounded-md` (Tailwind ~6px) o `border-radius: 1rem` | Non cerchi pieni, bordi morbidi |
| **Gradient blu (homepage)** | `bg-gradient-to-br from-sp_darkb_lue to-sp_mid_dark_blue` | `#154c79` → `#1b66a3`; usato in sezioni hero |
| **Animazioni SVG / offset-path** | `#dewi-ani`, `#points-ani`, `#redneko-ani` con `offset-path: ellipse(...)`; `animation: move... 50000ms infinite linear` | Solo se si vuole replicare l'estetica home; non obbligatorio per pagine interne |
| **Bordi sottili / ombre leggere** | `border-2` per download button (`border-sp_mid_dark_blue`); `box-shadow: 0 1px 5px rgba(0,0,0,0.12)` per menu | Non ombreggiature pesanti |

---

## 7. Regole mobile-first esplicite

1. **Viewport:** `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0` (bloccato zoom — stile sito attuale).
2. **Contenitore:** `w-10/12` anche su mobile; non full-bleed.
3. **Font:** non ridurre drásticamente; body resta `1rem`, titoli `1.1rem`–`1.25rem` su mobile.
4. **Layout:** `flex-col` su mobile; `md:flex-row` solo sopra `768px`.
5. **Timeline:** padding e dimensioni dot si riducono ma mantenono proporzione (`14px` dot, `2rem` padding-left).
6. **Menu:** passa da orizzontale a verticale; hamburger visibile.
7. **Immagini:** `object-cover`, `w-full`, altezza fissa (`h-60` mobile, `h-96` desktop).

---

## 8. Template di pagina consigliato (per nuovi agenti)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
  <title>...</title>
  <!-- Font -->
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <!-- Tailwind -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { theme: { extend: { colors: {
      clifford: '#da373d',
      sp_dark_blue: '#154c79',
      sp_mid_dark_blue: '#1b66a3',
      sp_light_blue: '#5199d4'
    }}}}
  </script>
  <!-- CSS custom (copiare da style_bw.css o replicare i pezzi essenziali) -->
  <link rel="stylesheet" href="../style_bw.css">
  <style>
    /* Inserire qui o in CSS esterno: timeline, typography, mobile tweaks */
    body { background-color: #fffbf5; }
    h1 { font-family:"Montserrat",sans-serif; font-size:2rem; font-weight:bold; color:#154c79; }
    /* ... ecc. ... */
  </style>
</head>
<body>
  <!-- Menu orizzontale (opzionale) -->
  <nav class="menu_container">...</nav>

  <div class="w-full h-full flex justify-center">
    <div class="flex flex-col w-10/12 max-w-3xl">
      <!-- Sezione 1 -->
      <section class="mt-10">
        <h1 class="h1_title">Titolo sezione</h1>
        <p>Testo corpo, font Montserrat light 1rem colore #154c79.</p>
      </section>

      <!-- Sezione timeline (se applicabile) -->
      <div class="timeline mt-8">...</div>

      <!-- Sezione riassuntiva -->
      <section class="mt-10 page-section">...</section>
    </div>
  </div>
</body>
</html>
```

---

## 9. Checklist per ogni nuova pagina

- [ ] Font `Montserrat` caricato; nessun altro font.
- [ ] Colori esatti: testo `#154c79`, accenti `#5199d4`, sfondo `#fffbf5`.
- [ ] Layout centrato `w-10/12 max-w-3xl`; mobile-first.
- [ ] Se c'è una timeline: linea verticale, dot 17px, data in maiuscolo `0.85rem` `#5199d4`.
- [ ] Titoli: `.h1_title` = `2rem` bold `#154c79`; `.h2_title` = `1.5rem` bold `#1b66a3`.
- [ ] Link sottolineati, `font-weight: 600`, colore `#154c79`.
- [ ] `viewport` bloccato zoom (`user-scalable=0`); responsive con `md:`.
- [ ] Nessun layout a 3 colonne o griglia ampia; preferire colonna singola stretta.

---

*Generato analizzando `cv/index.html` come fonte primaria, con riferimento a `style_bw.css`, `index.html` (home con gradient e animazioni SVG) e `tailwind.config`. Per domande su un componente specifico (es. come replicare esattamente il toggle della timeline), consultare il blocco CSS in `cv/index.html` nelle sezioni `/* Timeline core */` e `.timeline-toggle`.*
