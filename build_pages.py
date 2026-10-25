# Generates one SEO page per tool from template.html. Run: python3 build_pages.py
import re, json, html
DOMAIN="https://cinch2108.github.io/chroma"
SELF = "chroma"
# ---- "More free tools" team footer: edit this ONE list, then run `python3 build_pages.py`. ----
# Applied to every generated page plus privacy.html, terms.html and 404.html. The current site is left out.
TEAM = [
    ("chroma",     "Chroma",     "https://cinch2108.github.io/chroma/",     "Color palettes, contrast checker & gradients"),
    ("textforge",  "Textforge",  "https://cinch2108.github.io/textforge/",  "Word counter, JSON, Base64, diff & regex"),
    ("hourlark",   "Hourlark",   "https://cinch2108.github.io/hourlark/",   "Timer, stopwatch, Pomodoro & world clock"),
    ("numora",     "Numora",     "https://cinch2108.github.io/numora/",     "30 calculators & a unit converter"),
    ("pixelsmith", "Pixelsmith", "https://cinch2108.github.io/pixelsmith/", "Compress, resize & convert images"),
    ("mintkit",    "Mintkit",    "https://cinch2108.github.io/mintkit/",    "QR codes, barcodes & passwords"),
    ("tagloom",    "Tagloom",    "https://cinch2108.github.io/tagloom/",    "SEO tools: meta tags, sitemaps & schema"),
    ("localforge", "LocalForge PDF", "https://cinch2108.github.io/",        "Merge, split, compress & sign PDFs"),
]
def team_html():
    items = ''.join(f'<li><a href="{u}" rel="noopener">{n}</a><span>{d.replace("&", "&amp;")}</span></li>' for k, n, u, d in TEAM if k != SELF)
    return f'<!--team--><nav class="more-tools" aria-label="More free tools"><h2>More free tools</h2><ul>{items}</ul></nav><!--/team-->'
def add_team(s):
    import re as _re
    if '<!--team-->' in s: return _re.sub(r'<!--team-->.*?<!--/team-->', lambda m: team_html(), s, flags=_re.S)
    if '<footer>' in s: return s.replace('<footer>', '<footer>' + team_html(), 1)
    return s.replace('</main>', '</main><footer>' + team_html() + '</footer>', 1)

T=open('template.html').read()
PAGES=[
 dict(v='palette',slug='',tab='Palettes',
  title='Color Palette Generator: Free, Fast &amp; Accessible | Chroma',
  desc='Create beautiful color palettes in one click. Lock colors, choose harmony rules, check color blindness, and export to CSS, Tailwind, JSON or PNG. Free, no signup.',
  h1='Color palette generator, <span>one tap of the spacebar.</span>',
  lead='Press Space for a fresh palette, lock the colors you love, and export to CSS, Tailwind or PNG. Every palette is checked for color blindness automatically.',
  how=['Press <b>Space</b> or click <b>Generate</b> to create a new palette.','Click the lock icon on any color you want to keep, then generate again to change only the rest.','Pick a style such as Analogous, Pastel or Dark UI from the menu to steer the results.','Click a hex code to copy it, or use Export to get CSS variables, SCSS, Tailwind config, JSON or SVG.','Save favorites with ♥ Save, or copy the Share link to send the exact palette to anyone.'],
  faq=[('Is the palette generator free?','Yes. Every feature is free with no account and no limits, and palettes are generated in your browser.'),
       ('How does Chroma pick colors that go together?','It builds palettes in the OKLCH color space, which matches how people perceive brightness and saturation, then applies harmony rules such as analogous, complementary or triadic so colors stay balanced.'),
       ('Can I use these palettes commercially?','Yes. Anything you create is yours to use in any project, including client and commercial work.'),
       ('How do I check my palette for color blindness?','Below every palette, Chroma shows how it looks with protanopia, deuteranopia, tritanopia and full color blindness, so you can spot colors that become hard to tell apart.')]),
 dict(v='convert',slug='color-converter',tab='Converter',
  title='Color Converter: HEX to RGB, HSL, CMYK &amp; OKLCH | Chroma',
  desc='Convert any color between HEX, RGB, HSL, HSV, CMYK, OKLCH, Swift and Android formats instantly. Get a full 50 to 950 shade scale and color harmonies. Free.',
  h1='Convert any color <span>to every format.</span>',
  lead='Paste a hex code, rgb(), hsl(), oklch() or even a color name and get every format at once, plus tints, shades and matching harmonies.',
  how=['Type or paste a color in any format, or pick one with the color picker.','Copy the format you need: HEX, RGB, HSL, HSV, CMYK, OKLCH, OKLAB, Swift, Android or integer.','Use the tints and shades scale to build a full 50 to 950 design-system ramp, and copy it as Tailwind config.','Browse complementary, triadic and other harmonies generated from your color.'],
  faq=[('How do I convert HEX to RGB?','Paste the hex code (for example #7C5CFF) into the box. The RGB value appears instantly, as rgb(124, 92, 255) in this case, along with every other format.'),
       ('What is OKLCH and why should I use it?','OKLCH is a modern CSS color format based on how people see color. Changing its lightness keeps hue and saturation looking consistent, which makes it ideal for design systems and accessible palettes.'),
       ('Is the CMYK conversion print accurate?','It is a standard mathematical conversion, which is right for quick reference. For professional print work, confirm the values with your printer’s color profile.'),
       ('Can I enter color names?','Yes. Common CSS names like coral, teal or rebeccapurple work, and Chroma also tells you the closest human-friendly name for any color.')]),
 dict(v='contrast',slug='contrast-checker',tab='Contrast',
  title='Color Contrast Checker (WCAG 2.2 AA &amp; AAA) | Chroma',
  desc='Check text and background color contrast against WCAG AA and AAA in real time, preview the result, and auto-fix failing colors with one click. Free accessibility tool.',
  h1='Contrast checker that <span>fixes colors for you.</span>',
  lead='See your contrast ratio and WCAG pass or fail instantly. If it fails, one click finds the closest color that passes.',
  how=['Enter your text color and background color, or pick them with the color pickers.','Read the contrast ratio and the pass or fail result for AA and AAA, normal and large text, and UI elements.','Check the live preview to see headings, body text, small print and a button in your colors.','If it fails, click <b>Fix contrast for me</b> to get the nearest passing text color that keeps your hue.'],
  faq=[('What contrast ratio do I need for WCAG AA?','WCAG AA requires at least 4.5:1 for normal text and 3:1 for large text (about 24px, or 19px bold) and for icons and UI components. AAA requires 7:1 for normal text and 4.5:1 for large text.'),
       ('How is the contrast ratio calculated?','It compares the relative luminance of the two colors using the formula in the WCAG specification, giving a ratio from 1:1 (no contrast) to 21:1 (black on white).'),
       ('Does the fix button change my brand color?','It only adjusts lightness of the text color and keeps the hue and saturation, so the result still looks like your color, just readable.'),
       ('Is contrast a legal requirement?','In many places accessibility laws reference WCAG, including the ADA in the US and the European Accessibility Act. Meeting AA contrast is a core part of compliance.')]),
 dict(v='gradient',slug='gradient-generator',tab='Gradients',
  title='CSS Gradient Generator: Linear, Radial &amp; Conic | Chroma',
  desc='Build smooth CSS gradients with unlimited color stops, linear, radial and conic modes, and vibrant OKLCH mixing. Copy the CSS or download a 4K wallpaper. Free.',
  h1='CSS gradients <span>without the muddy middle.</span>',
  lead='Drag color stops, switch between linear, radial and conic, and mix in OKLCH for vivid transitions. Copy the CSS or download a wallpaper.',
  how=['Click the color bar to add a stop, drag stops to move them, and double-click a stop to remove it.','Choose linear, radial or conic, and set the angle with the slider.','Turn on Vibrant (OKLCH) mixing to avoid the gray, washed-out middle that standard gradients often have.','Copy the CSS, which includes a solid fallback color, or download a 2560×1440 PNG wallpaper.','Start from a preset or hit Random for instant ideas.'],
  faq=[('How do I make a CSS gradient?','Use linear-gradient(), radial-gradient() or conic-gradient() in the background property. Chroma writes the exact code for you as you design, ready to paste.'),
       ('Why do some gradients look gray in the middle?','Mixing in standard sRGB passes through duller colors between two vivid hues. Mixing in OKLCH keeps saturation up, so the transition stays bright.'),
       ('Do OKLCH gradients work in all browsers?','All current versions of Chrome, Edge, Safari and Firefox support “in oklch” gradients. Chroma also includes a solid fallback line for older browsers.'),
       ('Can I use the gradient as a wallpaper?','Yes. Click Download wallpaper to save a high-resolution PNG of your gradient.')]),
 dict(v='image',slug='image-color-picker',tab='From image',
  title='Image Color Picker: Get a Palette from Any Photo | Chroma',
  desc='Upload or paste an image to extract its color palette and pick exact pixel colors with a magnifier. Images never leave your device. Free online color picker.',
  h1='Pull the perfect palette <span>from any image.</span>',
  lead='Drop in a photo to extract its main colors, or hover to pick any exact pixel. Your image is processed on your device and never uploaded.',
  how=['Drag an image onto the page, paste one with Ctrl+V or ⌘V, or click to upload.','Chroma extracts the dominant colors and shows how much of the image each one covers.','Use the slider to get between 3 and 10 colors.','Hover the image to see a magnified color preview and click to copy any exact pixel.','Send the extracted colors to the palette editor to refine and export them.'],
  faq=[('Is my image uploaded anywhere?','No. The image is read and analysed entirely inside your browser and never sent to a server.'),
       ('How are the palette colors chosen?','Chroma groups similar pixels with k-means clustering in the OKLab color space, which matches human perception, and ranks colors by how much of the image they cover.'),
       ('Which image formats work?','PNG, JPG, WebP, GIF, AVIF and BMP images up to 25 MB.'),
       ('Can I get the hex code of one exact pixel?','Yes. Hover over the image to preview, then click to copy that pixel’s hex code.')]),
]
def rel(depth,p): return ('../'*depth)+p
def page_url(p): return f"{DOMAIN}/{p['slug']+'/' if p['slug'] else ''}"
for p in PAGES:
    d=1 if p['slug'] else 0
    s=T
    s=re.sub(r'<title>.*?</title>',f"<title>{p['title']}</title>",s,flags=re.S)
    s=re.sub(r'<meta name="description" content="[^"]*">',f'<meta name="description" content="{p["desc"]}">',s)
    s=re.sub(r'<link rel="canonical" href="[^"]*">',f'<link rel="canonical" href="{page_url(p)}">',s)
    s=re.sub(r'<meta property="og:url" content="[^"]*">',f'<meta property="og:url" content="{page_url(p)}">',s)
    s=re.sub(r'<meta property="og:title" content="[^"]*">',f'<meta property="og:title" content="{re.sub("<[^>]+>","",p["title"])}">',s)
    s=re.sub(r'<meta property="og:description" content="[^"]*">',f'<meta property="og:description" content="{p["desc"]}">',s)
    s=s.replace('<body>',f'<body data-view="{p["v"]}">')
    s=re.sub(r'<h1>.*?</h1>',f"<h1>{p['h1']}</h1>",s,flags=re.S)
    s=re.sub(r'(<section class="hero">.*?)<p>.*?</p>',lambda m:m.group(1)+f"<p>{p['lead']}</p>",s,count=1,flags=re.S)
    s=s.replace('<div class="logo">',f'<a class="logo" href="{rel(d,"") or "./"}" style="color:inherit;text-decoration:none">').replace('Chroma</div>\n  <nav','Chroma</a>\n  <nav',1)
    tabs=''.join(f'<a class="tab{" active" if q["v"]==p["v"] else ""}" data-v="{q["v"]}" href="{rel(d,q["slug"]+"/" if q["slug"] else "") or "./"}">{q["tab"]}</a>' for q in PAGES)
    s=re.sub(r'<nav class="tabs" id="tabs">.*?</nav>',f'<nav class="tabs" id="tabs">{tabs}</nav>',s,flags=re.S)
    # make views other than the current one hidden by default
    s=s.replace('class="view active"','class="view"').replace(f'class="view" id="v-{p["v"]}"',f'class="view active" id="v-{p["v"]}"')
    for a in ['styles.css','app.js','privacy.html','terms.html']: s=s.replace(f'"{a}"',f'"{rel(d,a)}"')
    name=re.sub(r'<[^>]+>','',p['h1'])
    others=''.join(f'<a href="{rel(d,q["slug"]+"/" if q["slug"] else "") or "./"}">{q["title"].split(":")[0].split("(")[0].replace("&amp;","&").strip()}<span>{q["desc"].split(".")[0]}.</span></a>' for q in PAGES if q is not p)
    art=f'''<article class="seo">
<h2>How to use the {p["title"].split(":")[0].split("(")[0].strip().lower()}</h2>
<ol>{''.join(f"<li>{x}</li>" for x in p["how"])}</ol>
<h2>Frequently asked questions</h2>
{''.join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q,a in p["faq"])}
<h2>More free color tools</h2>
<div class="toollinks">{others}</div>
</article>'''
    s=s.replace('<!-- AD SLOT: footer 728x90 -->',art+'\n<!-- AD SLOT: footer 728x90 -->')
    faq={"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in p["faq"]]}
    crumbs={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Chroma","item":DOMAIN+"/"}]+([{"@type":"ListItem","position":2,"name":p["tab"],"item":page_url(p)}] if p['slug'] else [])}
    s=s.replace('</head>',f'<script type="application/ld+json">{json.dumps(faq)}</script>\n<script type="application/ld+json">{json.dumps(crumbs)}</script>\n</head>')
    out=(p['slug']+'/index.html') if p['slug'] else 'index.html'
    import os; os.makedirs(os.path.dirname(out) or '.',exist_ok=True)
    s = add_team(s)
    open(out,'w').write(s)
open('sitemap.xml','w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{page_url(p)}</loc><lastmod>2026-10-25</lastmod></url>\n' for p in PAGES)+f'  <url><loc>{DOMAIN}/privacy.html</loc></url>\n  <url><loc>{DOMAIN}/terms.html</loc></url>\n</urlset>\n')
print('built',len(PAGES))

# team footer on the static pages
for _f in ['privacy.html', 'terms.html', '404.html']:
    _s = open(_f, encoding='utf-8').read()
    open(_f, 'w', encoding='utf-8').write(add_team(_s))
