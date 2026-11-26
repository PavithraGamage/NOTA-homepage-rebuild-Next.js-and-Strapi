# NŌTA homepage rebuild: Next.js and Strapi

My rebuild of the [NŌTA](https://nota.uprock.pro/) product homepage, first made as the take-home assignment for a
Senior Web Developer role at Surge Global. The page is a long scroll story of pinned, scrubbed scenes, and every
word, image, link and price in it is edited in a self-hosted Strapi CMS.

> **Unofficial rebuild.** Not affiliated with NŌTA or UPROCK Studio. The design, copy, photography, videos and
> hero animation belong to their creators; the code is my own (see [Credits](#credits)). The site is `noindex`.

**Stack:** Next.js 16 (App Router, TypeScript), Strapi 5 on Postgres, CSS Modules, GSAP ScrollTrigger, Zod,
Vitest and Playwright. Hosted on Netlify (site), Render (CMS) and Neon (database and media storage). The
assignment build is tagged [`v1.0.0`](https://github.com/PavithraGamage/senior-web-developer-surge/tree/v1.0.0)
and ran on Railway.

## What this project shows

- **Scroll choreography matched to the reference.** Seven pinned, scrubbed scenes, timed from measurements of the
  original at 1440×900, across six layout ranges from 320 to 1920 wide. Phones, tablets and reduced-motion
  visitors get static layouts and never download the animation code.
- **A content model built for editors.** A dynamic zone of seven section components, repeatable items, art-directed
  responsive images with required alt text, and help text on every field.
- **Publish to live without a deploy.** Tagged fetch caching plus a webhook: the first refresh after publishing
  shows the change.
- **A form that is safe by default.** The same Zod rules in the browser and a Server Action, a honeypot, a per-IP
  rate limit, a create-only token, and duplicates shown as success so the form never reveals who signed up.
- **Infrastructure and security as code.** Railway IaC for the assignment, Netlify and Render configs for this
  deployment, CI-gated deploys, and a CSP with per-request nonces.

## Why Next.js

The page is mostly scroll choreography wrapped around CMS content. Next.js handles the CMS side, and the motion side
stays ordinary client components:

- **Server Components fetch Strapi on the server**, so API tokens never reach the browser.
- **Tagged fetch caching with on-demand revalidation** puts a Strapi publish on the live site without a deploy.
- **`generateMetadata`** builds the SEO tags from Strapi.
- **A Server Action** is the form's proxy to Strapi: origin check, body limit, no public API route.

**Alternatives considered:** Astro (nearly every section needs client JavaScript, so islands buy little), Nuxt
(equivalent; I chose the React ecosystem), and a plain SPA (tokens in the browser and weaker SEO metadata).

## How content reaches the page

1. The site reads Strapi with a read-only token. Each response is cached and tagged (`strapi:global`,
   `strapi:homepage`, `strapi:product`).
2. An editor publishes. Strapi's webhook, created from env vars on every boot, calls `/api/revalidate` with a
   shared secret.
3. The site expires the tags with `{ expire: 0 }`, so **the very next refresh shows the change**. Next's default
   profile would serve one stale page first.
4. Pages render per request, never at build time, so a build never depends on the CMS. Cached fetches mean most
   requests never touch Strapi.
5. If Strapi is down, cached content keeps being served. With nothing cached, the site returns a branded error page
   with a 5xx.

More: [architecture](docs/architecture.md) (caching, motion, security headers, the form) and
[hosting](docs/hosting.md).

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

# 3. Tokens (or in the admin: Settings → API Tokens)
npm run --silent create-token -- read     # → STRAPI_READ_TOKEN
npm run --silent create-token -- form     # → STRAPI_FORM_TOKEN

# 4. Web (new terminal)
cd apps/web
cp .env.example .env.local                # paste the tokens, and the same REVALIDATE_SECRET as apps/cms/.env
npm install
npm run dev                               # http://localhost:3000
```

**Checks** (CI runs the same on every push):

```bash
cd apps/web && npm run lint && npm run format:check && npm run typecheck && npm test && npm run build
cd apps/cms && npm run typecheck && npm test && npm run build
cd apps/web && npm run test:e2e           # form end to end; needs both servers and an E2E_STRAPI_TOKEN
```

## Content model

| Type | Kind | Holds |
|---|---|---|
| **Global** | Single type | Brand, navigation, order button, mobile menu, preloader, form copy, footer, default SEO |
| **Homepage** | Single type | Title, SEO and a **dynamic zone** of the seven section components |
| **Product** | Collection | Name, price, currency and colorways; the order button and colorways section read it through a **relation**, so the price is edited once |
| **Waitlist signup** | Collection, no Draft & Publish | Email (validated, unique) and which button opened the form |

- **Sections are components in a dynamic zone**, so editors can reorder or hide them without a deploy, and the page
  can't receive a section it can't render. Lists are repeatable components; there are no rich-text blobs.
- **Responsive images** are one component: an image, optional crops per breakpoint, and required alt text.
- **Editor experience:** help text saying where each field appears, placeholders, length limits sized to the
  layout, format checks, and Draft & Publish so a saved draft never changes the live site.
- **Access:** the Public role has no permissions, enforced on every boot. The site reads with a token that cannot
  see waitlist emails, and writes signups with a create-only token.
- **Seed:** `npm run seed` rebuilds the whole page on an empty database. It downloads the media from the original
  site at run time, so the repository doesn't redistribute it.

| Homepage sections (dynamic zone) | Product with colorways |
|---|---|
| ![Homepage sections in the admin](docs/images/admin/homepage-sections.png) | ![Product with colorways](docs/images/admin/product.png) |

Every type, component and validation rule: [docs/content-model.md](docs/content-model.md).

## Hosting

| Piece | Service | Why |
|---|---|---|
| Site | Netlify | Next.js 16 support, CDN, free plan |
| CMS | Render (free) | Runs Strapi as a long-lived Node server; sleeps when idle |
| Database | Neon (free) | Postgres that doesn't expire, in the CMS's region |
| Media | Neon Object Storage (free) | S3-compatible, same project; Render's free disk is wiped on restart |

Config lives in [`netlify.toml`](netlify.toml) and [`render.yaml`](render.yaml); the setup steps and checks are
in [docs/hosting.md](docs/hosting.md).

**The assignment ran on Railway:** site, CMS, Postgres with no public access, and a volume for uploads, all
declared in [`.railway/railway.ts`](.railway/railway.ts). The site read Strapi and received the webhook over
Railway's private network, and deploys waited for CI. Details:
[architecture → Railway](docs/architecture.md#railway-configuration-as-code).

## Key trade-offs

- **Request-time rendering with a tagged cache, not a static build.** Builds stay independent of the CMS, and
  `expire: 0` makes the first refresh after publishing fresh. The cost is a server render per request, which is
  cheap because the data is cached.
- **Free plans over always-on servers.** The CMS sleeps after 15 idle minutes, so the admin, and the first page
  view after a publish or a deploy, can wait up to a minute. Netlify builds wake it in the background.
  Media comes from one region without a CDN; Netlify's image CDN covers the images, not the videos.
- **Honeypot and rate limit, not a captcha.** No third-party script or friction. The limiter is in memory, which
  was right for one Railway instance; on Netlify each function instance keeps its own count.
- **Motion timing lives in code, content in the CMS.** Scene lengths and eases are design behaviour measured on the
  reference; editors change words, media, order and visibility, not choreography.
- **What stays in code:** functional icons, the header's light or dark theme per section, per-breakpoint scaling,
  scene timing, the error and 404 copy (they must work when the CMS is down), `noindex`, and the
  unofficial-rebuild notice, so no CMS field can switch the last two off.
- **The hero "Lottie" is drawn on a canvas.** The file is 75 full-frame images with static transforms, so a canvas
  is lighter than a Lottie runtime and scrubs exactly. Wheel easing is ~85 lines of my own code rather than Lenis.
- **Reference greys over AA contrast.** Three greys from the design fall below AA for their size (#666 on black,
  white at 40% on black, #999 on white). I tried the nearest AA values and kept the originals for fidelity.
- **Known deviations:** the shorter spec copy the reference shows at 992–1439 px (one CMS string per bullet), one
  details tile's separate art at ≥1920 px, and scenes starting up to ~200 px of scroll later on wide, short screens.

## What I'd improve with more time

- **Visual regression tests:** Playwright screenshots at each breakpoint and scroll position, compared in CI.
- **End-to-end tests in CI**, with a Postgres service and the seed.
- **A shared store for the rate limit** (Netlify Blobs or Redis), so it holds across function instances.
- **A CDN in front of the media bucket**, so videos load fast far from Singapore.
- **Strapi Preview with Next.js Draft Mode**, so editors see a draft on the real page before publishing.
- **An optional short label per spec bullet**, to reproduce the reference's shorter copy at 992–1439 px.
- **Real-device testing** on iOS Safari and Android Chrome, and **Lighthouse CI budgets**.

## How I used AI

I used **Claude Code (Claude Opus 5.5)** as a pair programmer throughout. The log for each phase is in
[docs/ai-usage.md](docs/ai-usage.md).

**What I decided before any code was written.** I wrote the build brief the agent worked from. It set:

- the stack and the reasons for it;
- the content-freshness rules: a tagged cache, immediate expiry after publishing, builds that never need the
  CMS, and last-good content when Strapi is down;
- the form's security design and a locked Public role;
- a phase plan with a review gate before each merge;
- the rule that no reference HTML, CSS or JS is copied.

**What the AI did.** It wrote most of the code to that brief, measured the rendered reference with throwaway
Playwright scripts, wrote the tests and drafted the docs. It had to check every framework API against the installed
version's docs and source rather than memory.

**Where I reviewed, tested and overruled:**
- I reviewed each phase before merging, and compared the build with the original on my own screens and phone. My
  recordings caught several bugs:
  - the video tile covering the "Who it's for" cards;
  - the missing wheel easing;
  - phone slider bugs;
  - colorways that slid instead of cross-fading;
  - a missing heading animation;
  - a black menu over the About slides.
- I reverted the AA versions of the reference's greys, and documented the contrast gap instead.
- I handled every secret, account and billable step myself, and moved the hosting to Singapore, near the reviewers.

Commits carry no AI trailer by my choice; AI use is disclosed here and in the log.

## Testing, accessibility and performance

- **Unit tests (Vitest):** 74 in the site (content mappers, env, revalidation, form rules, rate limiter, CSP,
  motion helpers) and 67 in the CMS (editor copy on every field, webhook bootstrap, upload settings).
- **End to end (Playwright):** the form on desktop and a phone: empty and invalid input, success stored in Strapi,
  a repeat address, the honeypot. Firefox, WebKit and an iPhone on request (`E2E_ALL_BROWSERS=1`).
- **Accessibility:** axe (WCAG 2.1 AA) on desktop, reduced motion, the phone menu and the open form; the only
  findings are the three reference greys above. Skip link, focus trap and return in dialogs, visible focus, and
  carousels usable with the arrow keys.
- **Performance:** on the Railway deployment, Lighthouse mobile scored 93–98 with CLS 0; not yet re-measured on
  Netlify. Phones skip GSAP, the scenes and the 1.8 MB hero sequence; videos load only within a screen of view.
- **Browsers:** the full scroll story in Chrome, Firefox and WebKit, and the phone layout in iPhone emulation.

## Credits

The design, copy, photography, videos and hero animation belong to the creators of the original NŌTA site
([nota.uprock.pro](https://nota.uprock.pro/), designed by Alice and UPROCK Studio, made in Taptop). The assignment
allowed reusing the images, and Surge Global cleared the videos and animation for it. The code is written from scratch: the reference was observed and measured,
never copied (see [docs/reference-audit.md](docs/reference-audit.md)).
