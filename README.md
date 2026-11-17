# NŌTA homepage rebuild: Next.js + Strapi on Railway

A rebuild of the homepage of [nota.uprock.pro](https://nota.uprock.pro/) for the Surge Global Senior Web Developer
assignment. All content is managed in a self-hosted Strapi CMS; everything runs on Railway.

> **Work in progress.** This README is completed in the final phase (framework choice, content model, trade-offs,
> improvements, AI usage). The design belongs to its original creators; the site is `noindex` and will be taken
> down when the review round closes.

- **Architecture, caching and Railway setup:** [docs/architecture.md](docs/architecture.md)
- **Content model (types, components, validation, editor experience, seed):** [docs/content-model.md](docs/content-model.md)
- **Reference audit (what we are rebuilding and how it behaves):** [docs/reference-audit.md](docs/reference-audit.md)
- **AI usage log:** [docs/ai-usage.md](docs/ai-usage.md)

## Repository layout

```
apps/web   Next.js 16 (App Router, TypeScript): the site
apps/cms   Strapi 5 (TypeScript, Postgres): content and media
.railway/  Railway Infrastructure as Code (railway.ts)
docs/      Architecture, reference audit, AI usage
```

Two independent apps with their own lockfiles (no workspace hoisting; Strapi is happiest standalone).

## Run locally

**Prerequisites:** Node 24 (`.nvmrc`), npm 10+, Docker.

```bash
# 1. Database
docker compose up -d                      # Postgres 18 on localhost:5432

# 2. CMS
cd apps/cms
cp .env.example .env                      # then replace every "change-me" with a random value
npm install
npm run seed                              # all homepage content and media (~1 min the first time)
npm run develop                           # http://localhost:1337/admin → create your admin user

# 3. In the admin: Settings → API Tokens → Create new API Token, type "Custom", duration "Unlimited":
#    - read token: find on Global, Homepage and Product        → STRAPI_READ_TOKEN
#    - form token: create on Waitlist-signup (nothing else)     → STRAPI_FORM_TOKEN
#    (or locally: cd apps/cms && npm run --silent create-token -- read|form, which prints just the token)

# 4. Web (new terminal)
cd apps/web
cp .env.example .env.local                # paste the tokens into STRAPI_READ_TOKEN / STRAPI_FORM_TOKEN and use the
npm install                               # same REVALIDATE_SECRET as apps/cms/.env
npm run dev                               # http://localhost:3000
```

Publishing in Strapi now refreshes the local site immediately: the CMS calls `http://localhost:3000/api/revalidate`.

### Checks

```bash
cd apps/web && npm run lint && npm run typecheck && npm test && npm run build
cd apps/cms && npm run typecheck && npm test && npm run build
```

CI runs the same steps on every push (`.github/workflows/ci.yml`).

### End-to-end tests

Playwright drives the waitlist form against the running site and CMS (desktop and phone): empty and
invalid input, success with the entry stored in Strapi, a repeat address shown as success without a second
entry, and the honeypot. They need both servers running and an `E2E_STRAPI_TOKEN` (find + delete on
Waitlist-signup) in `apps/web/.env.local`, so they can check and then delete what they created.

```bash
cd apps/cms && npm run --silent create-token -- e2e   # paste into apps/web/.env.local as E2E_STRAPI_TOKEN
cd apps/web && npm run test:e2e                       # uses the installed Chrome
```
