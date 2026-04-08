# AI Style Writer

Webová aplikace pro generování článků podle stylu autora. Postavena na React + Cloudflare Pages + OpenAI GPT-4o.

## Co aplikace umí

1. **Analyzuje styl** — z nahraných ukázkových článků vytvoří stylový profil autora
2. **Extrahuje pravidla** — z dokumentu s pravidly strukturuje hard/soft rules
3. **Generuje článek** — podle stylu, pravidel a zadání
4. **Validuje výstup** — zkontroluje shodu s profilem (0–100 skóre)
5. **Auto-opraví** — pokud skóre < 75, automaticky přepíše článek

---

## Nasazení na Cloudflare Pages

### 1. Push na GitHub

```bash
cd ai-style-writer
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TVUJ-GITHUB-USERNAME/ai-style-writer.git
git push -u origin main
```

### 2. Cloudflare Pages — připojení repa

1. Přihlás se na [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Vyber GitHub repozitář `ai-style-writer`
4. Nastav build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (nechej prázdné)
5. Klikni **Save and Deploy**

### 3. Nastavení OpenAI API klíče

Po prvním deployi:

1. **Workers & Pages** → tvůj projekt → **Settings** → **Environment variables**
2. Přidej proměnnou:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-...` (tvůj klíč z [platform.openai.com](https://platform.openai.com))
   - Zaškrtni **Encrypt**
3. Klikni **Save**
4. Spusť nový deploy: **Deployments** → **Retry deployment**

---

## Lokální vývoj

### Předpoklady
- Node.js 18+
- npm nebo yarn

### Spuštění

```bash
# Instalace závislostí
npm install

# Build + spuštění s Cloudflare Workers (doporučeno)
npm run pages:dev

# Nebo jen frontend (bez funkčního API)
npm run dev
```

### Environment proměnné pro lokální vývoj

Vytvoř soubor `.dev.vars` v kořeni projektu (je v .gitignore):

```
OPENAI_API_KEY=sk-tvuj-klic-zde
```

---

## Struktura projektu

```
ai-style-writer/
├── src/                     # React frontend
│   ├── components/          # Layout, FileDropzone, ValidationDisplay
│   ├── context/             # AppContext (state + localStorage)
│   ├── lib/                 # types.ts, api.ts, fileParser.ts
│   └── pages/               # Upload, Profiles, Generate, History
├── functions/
│   └── api/                 # Cloudflare Pages Functions (Workers)
│       ├── analyze-style.ts
│       ├── extract-rules.ts
│       ├── generate-article.ts
│       ├── validate-article.ts
│       └── rewrite-article.ts
├── wrangler.toml
└── vite.config.ts
```

## Podporované formáty souborů

- `.txt` — plain text
- `.docx` — Word dokumenty
- `.pdf` — PDF soubory
