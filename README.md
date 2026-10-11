# Web Lukáše Havránka

Statický web (Eleventy) s editorem na `/admin/` (Sveltia CMS). Kód leží na GitHubu, hostuje a staví ho Netlify.
Každé uložení v editoru = commit do GitHubu → Netlify web do ~minuty přegeneruje.

## Struktura

```
src/
  pages/              Home, O mně, Nabídka školení, Kontakt, Blog, Podcast, sitemap
  content/episodes/   epizody podcastu (jeden .md soubor = jedna epizoda)
  content/articles/   články blogu (odkaz ven i vlastní články)
  _data/              site.json (doména), podcast.yml (úvod a odkazy na platformy), categories.json
  _includes/          společná hlavička, patička a šablony epizody/článku
  assets/             style.css, main.js, obrázky
  admin/              editor (index.html + config.yml)
eleventy.config.js    sestavení webu
netlify.toml          nastavení Netlify
```

Hlavička a patička jsou teď na jednom místě (`src/_includes/header.njk`, `footer.njk`) — změna navigace se dělá jednou.
Styly zůstávají v `src/assets/style.css`. Všechny odkazy ve vygenerovaném webu jsou relativní.

## 1. Nasazení (jednorázově)

1. **GitHub:** vytvořte repozitář a nahrajte do něj obsah této složky (`node_modules` a `_site` se nenahrávají, jsou v `.gitignore`).
2. **Přepište repozitář v editoru:** v `src/admin/config.yml` změňte řádek `repo: UZIVATEL/lukashavranek-web` na skutečný `uživatel/repozitář`.
3. **Netlify:** *Add new site → Import an existing project* → vyberte repozitář. Build příkaz a složka se načtou z `netlify.toml` (`npm run build`, `_site`).
4. **Doména:** v Netlify *Domain management → Add a domain* a podle pokynů nastavte DNS u registrátora (obvykle `CNAME www → <název>.netlify.app`, případně Netlify DNS). HTTPS certifikát Netlify vystaví sám.
   Pokud bude doména jiná než `www.lukashavranek.cz`, přepište ji v `src/_data/site.json`, `src/robots.txt` a `src/admin/config.yml` a v JSON-LD blocích stránek (hledejte `lukashavranek.cz` ve složce `src/pages/`).

## 2. Přihlášení do editoru (jednorázově)

Editor je na `https://<doména>/admin/`. Přihlašuje se přes GitHub, takže Lukáš potřebuje účet na GitHubu a v repozitáři roli *Collaborator* (právo zápisu): *Settings → Collaborators → Add people*.

**Doporučená varianta (přihlášení tlačítkem):**

1. GitHub: *Settings → Developer settings → OAuth Apps → New OAuth App*. Do *Authorization callback URL* zadejte `https://api.netlify.com/auth/done`.
2. Netlify: *Site configuration → Access & security → OAuth → Install provider → GitHub* a vložte Client ID a Client Secret z předchozího kroku.
3. Na `/admin/` klikněte na přihlášení přes GitHub.

**Rychlá varianta pro vás (bez OAuth):** na `/admin/` zvolte *Sign In with Token* a vložte osobní přístupový token z GitHubu (fine-grained token s oprávněním *Contents: Read and write* pro tento repozitář). Token se ukládá jen v prohlížeči.

## 3. Přidání epizody podcastu

V editoru: **Podcast — epizody → Nová epizoda**.

- Vyplňte název, číslo (dvě číslice, např. `02`), datum, ID videa (YouTube: část adresy za `v=`; Spotify: část za `/episode/`) a popis pro Google (max. 155 znaků).
- Obrázek je nepovinný: když ho nenahrajete, použije se náhled z YouTube. Doporučeno 1280×720 px, do 300 kB.
- Kapitoly, odkazy a text jsou nepovinné.
- Klikněte na **Publikovat**. Epizoda se objeví na `/podcast/` (nejnovější nahoře), dostane vlastní stránku a zapíše se do `sitemap.xml`. Na blogu se nezobrazuje.

Až podcast poběží na Spotify nebo Apple Podcasts: **Nastavení → Podcast** a vložte odkaz — tlačítko se na stránce objeví. Upravte nebo smažte i poznámku pod tlačítky.

## 4. Přidání článku na blog

V editoru: **Blog — články → Nový článek**. Dvě možnosti:

- **Odkaz na článek jinde (např. GrowJOB):** vyplňte *Odkaz na externí článek*, text nechte prázdný. Karta pak vede na externí web.
- **Vlastní článek:** odkaz nechte prázdný a napište text. Článek dostane vlastní stránku `/blog/<název>/`.

Články s datem se řadí od nejnovějšího a jsou nad starými články bez data (ty drží pořadí podle pole *Pořadí*).

## 5. Lokální spuštění (volitelně)

```bash
npm install
npm start        # http://localhost:8080
npm run build    # výstup do _site/
```

Vyžaduje Node.js 18 nebo novější.

## 6. Formulář (FormSubmit)

Formuláře posílají přes **formsubmit.co** na `lukas@lukashavranek.cz`. **První odeslání vyvolá aktivační e-mail** — Lukáš musí kliknout na potvrzení, pak už zprávy chodí normálně. Ochrana proti spamu: honeypot a captcha FormSubmitu. Alternativa: Netlify Forms nebo Formspree (stačí vyměnit `action` formuláře).

## 7. Po spuštění

- [ ] Doplnit skutečné datum vydání první epizody (editor → epizoda 01 → *Datum vydání*); teď je zástupné `2026-01-01`.
- [ ] Aktivovat FormSubmit prvním odesláním formuláře.
- [ ] Google Search Console: ověřit doménu, odeslat `sitemap.xml`.
- [ ] Rich Results Test na Home a Nabídce školení (JSON-LD).
- [ ] Nahradit placeholder fotky reálnými (WebP, hero ≤ 200 kB) a doplnit QR kód WhatsApp skupiny na Home.
- [ ] Analytika (GA4 nebo Plausible): vložit snippet do `src/_includes/base.njk`.
