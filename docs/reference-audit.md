# Reference audit: nota.uprock.pro (homepage)

Phase 0 output. This is the spec we build against: layout per breakpoint, every interaction, the asset
inventory, the content-model draft and the risks. Measurements were taken on **16 Nov 2026**.

> **How the reference was observed (R1 and R2).** Everything here comes from watching and measuring the
> *rendered* page in Google Chrome driven by Playwright: viewport screenshots at stepped scroll positions,
> screen recordings, element bounding boxes, computed font sizes and colours of visible text, video
> playheads, and colour-picked pixels. No HTML, CSS or JS source was saved, read for reuse or copied. No class
> names, selectors, keyframes or scripts are carried into our code. No cloning or export tool was used.
> Individual image, video and Lottie files were listed from network requests so they can be uploaded to
> Strapi later, which the brief allows for images (videos and Lottie are an open question, see §9).
>
> Screenshots, recordings and raw measurement data live in `docs/reference/` (gitignored, local only, so
> we never redistribute the design). Paths below are relative to that folder.

**One incident to disclose.** While probing the waitlist modal, a test pressed Enter on the **empty**
form. The reference returned its error state ("Something went wrong! Try again"). No email or personal
data was sent. After that, no further submits were made against the reference.

---

## 1. Global findings

### 1.1 Breakpoints and the scaling model (most important finding)

The reference has **6 layout ranges, not 7**. Inside each range, **every dimension (type, spacing, header
height, radii) scales linearly with viewport width**, relative to the range's lower-bound design width.
We measured this at 20 widths, including just either side of each boundary:

| Range | Design width | Evidence ("Works with" heading) | Mode |
|---|---|---|---|
| ≥ 1920 | 1920 | 200px at 1920 → 250px at 2400 | cinematic |
| 1440–1919 | 1440 | 150px at 1440 → 199.96px at 1919 | cinematic |
| 992–1439 | 992 | 120px at 992 → 154.9px at 1280 → 174.1px at 1439 | cinematic |
| 768–991 | 768 | 96px at 768 → 123.9px at 991 | static |
| 480–767 | 480 | 70px at 480 → 111.8px at 767 | static |
| ≤ 479 | 320 | 60px at 320 → 70.3px at 375 | static |

1280 is **not** a breakpoint: 1100, 1280, 1360 and 1439 all follow the 992 design exactly. Sizes jump at
each boundary (for example 174px at 1439 → 150px at 1440), which is how the reference behaves, and we copy that
behaviour.

**Implication for our CSS:** one custom property per range, `--u = 100vw / <design width>`, and every size
written as `calc(<design px> * var(--u))`. Then one set of design values per range reproduces the
reference at any width. This is our own technique; only the numbers come from measurement.

**Refinements found in Phase 3** (measured with transform-free geometry at 992×620/744, 1440×800/900 and
1920×1080/1200):

- **The 1920 range is only partly re-specified.** Type, the header, the footer, the details bento and the
  inside-the-box captions have their own 1920 values. Some spacing in specs, who-it's-for and smart paper keeps
  scaling from the 1440 design (×4/3 at 1920: card padding 40, radius 23.2, row gaps). Those values get explicit
  ≥1920 overrides.
- **Pinned desktop stages are partly sized in viewport height.** Specs: 992 is laid out in vh (padding 5.6vh,
  pen 71vh, cards 12.6vh above the bottom), and the pen is 66vh at 1440 and 68vh at 1920, with the cards a
  fixed distance above the bottom edge. Inside the box: kit and product cards are `100vh − 2 gutters` (820 at
  1440×900, 1000 at 1920×1080).
- **Phones and tablets:** smart-paper steps are 680/1024 design px tall but never taller than the screen
  (`min(…, 100svh)`).
- **Desktop statement spacing:** the who-it's-for statement is split into per-word spans for its scroll reveal,
  which adds 0.13em to every space. We reproduce that with `word-spacing` so the lines break where the
  reference's do (checked at 992, 1440 and 1920). On phones it is plain text with normal spacing.
- **Copy variant we do not reproduce:** at 992–1439 the reference swaps in shorter spec bullets ("Replaceable pen
  ink cartridge"). We keep one CMS string per bullet, so two of them wrap to a second line in that range.

### 1.2 Two layout modes

- **≥ 992px: cinematic.** Preloader, then a chain of pinned, scroll-driven scenes (§1.3). The page is about
  **27 viewport heights** tall: 24,306px at 1440×900, 29,366px at 1920×1080, 20,928px at 992×768.
- **≤ 991px: static.** No preloader, no pinned scenes. Stacked layouts with swipe carousels, burger menu,
  and a tablet design (768) distinct from the mobile designs (480, 320). Page height is 14,486px at 768,
  10,703px at 480 and 12,397px at 375.

### 1.3 Scroll architecture: stacked sticky scenes

Pinned scenes are built from **CSS `position: sticky`**, not JS pinning. Each scene is a tall wrapper
with a 100vh sticky "stage". When a scene finishes, it **stays stuck underneath** while the next scene slides
over it. Scene lengths are in **viewport heights** (identical in vh at 900, 1080, 1200 and 768 tall). We will
use the same robust approach: CSS sticky for pinning, GSAP ScrollTrigger only for scrubbing, so nothing jumps
when JS loads late.

Timeline at 1440×900 (1vh = 900px of scroll):

| # | Scene | Scroll range (vh) | What happens (detail in §3) |
|---|---|---|---|
| 1 | Hero | 0 → 1.7 (pinned) | Lottie image sequence of the pen scrubs with scroll. Heading stays bottom-left. |
| 2 | Column wipe ↑ | 1.7 → 2.5 | 6 white columns rise with a left-to-right stagger over the frozen hero. |
| 3 | Specs | 2.5 → 4.5 (pinned) | Heading settles, vertical pen rises, 3 spec cards rise with a stagger. |
| 4 | Silhouette to black | 4.8 → 5.6 | A black stepped pen silhouette grows from the pen and fills the screen. |
| 5 | Who it's for | 5.6 → ~8.1 | Statement text reveals grey→white, then intro and 3 audience cards scroll by. |
| 6 | Video frame | 8.1 → 9.9 | Video tile grows from bottom-right to near full-bleed, then shrinks and fades as the white "Works with smart paper" panel rises. |
| 7 | Smart paper | 9.9 → 14.9 (pinned) | 4 steps (~1.1vh each). The panel splits into columns that drop away, then image, heading and card change per step, with a 4-segment progress bar. |
| 8 | Into "Inside the box" | 14.9 → 17.2 | Columns rise to black, a 6px white dot appears centre-screen and expands into a full white circle revealing "Inside the box", which then moves up. |
| 9 | Inside the box | normal flow | Kit image card, statement word-reveal, stripe ("blinds") reveal of 2 product cards. |
| 10 | Details bento | normal flow | Black background, 6 rounded tiles (one is a looping video) that scale 1.28→1.0 and fade in on entry. |
| 11 | Colorways | 23.0 → 25.5 (pinned) | Intro, then 4 colourways cross-fade (~0.5vh each). Footer revealed underneath. |

Fine easing curves per scene will be measured in Phase 4 using the same capture tooling at a finer scroll
step (100px). The ranges above are the contract for Phase 3 layout.

**Phase 4 measurements** (1440×900, 100px steps, element geometry and opacity per step). Values below are in
viewport heights; the code keeps them as named constants next to each scene.

| Scene | Measured behaviour |
|---|---|
| Hero | 75-frame sequence over 0 → 1.7; the header slides away at the end of it. |
| Column wipe | 6 columns, each rises over 0.39 (power2.inOut), starting 1.706 and 0.08 apart. Faint dividers fade as the heading arrives. |
| Specs | Heading appears centred at 2.5 and moves to its place over 2.72 → 3.5 (sine.inOut). Pen rises 2.77 → 3.77 (sine.out). Cards peek in by 77px at 3.05, then rise one after another (start 3.5 / 3.75 / 4.05) and land together at 4.55. |
| Silhouette | Not one shape: 4 black bands (1:2:2:2 of the height) grow from the centre, bottom first, 4.82 → 5.53. |
| Who it's for | Statement held at the top while words turn #666 → white (5.44 → 6.28); intro fades in; cards (38px under the intro) slide in from 480px right (sine.out, 0.11 apart). The video tile's stage (camera) starts 30px below the last card and clips the tile, so it never covers the cards. Measured from when the camera enters the screen: the 1360×660 tile (full width less the gutters, centred) grows from 0.5 and 9.3vh up to full size over 0.02 → 1.12 (sine.inOut) while playing once in real time, then shrinks to 0.68, moves 16% left and 9.3vh down and dims to 20% (1.16 → 2.77). Re-measured in Phase 6 at 1100–2400 wide: 992 range 0.7 / 17.5vh up / ends 0.65, 17.3% left; 1920 range 0.5 / 8.3vh / ends 0.65, 17.4% left; gaps 28 and 58 design px. |
| Smart paper | Panel pins at 10.0; heading fades and column dividers appear (10.17 → 10.44); columns drop (from 10.61, 0.053 apart). Steps change at 11.89, 12.72, 13.56: the old image shrinks to 0.6 and fades, the new one zooms 1.4 → 1 (power2.out), copy switches. Last step fades to black; a white dot (600px circle at 0.01) grows to cover the screen, 14.94 → 15.56, following the measured scale every 100px. |
| Inside the box | Takes over when the circle covers (15.56); heading fades in on white and holds 0.66; normal flow after. Cards revealed by white stripes 33px apart closing as they scroll in; statement words #ddd → black. Statement sits ~0.4 screens below the kit and above the products. |
| Details | Each tile's picture fades in quickly and settles 1.3 → 1 (sine.inOut) between 85% and 15% of the viewport; the video tile only fades. |
| Colorways | Pins for 2.5; cross-fades at +0.26, +0.93, +1.43, +1.93 (≈0.2 each), then scrolls away uncovering the footer. |
| Scrolling | Lenis smooth wheel: one 300px wheel step glides with a ~167 ms time constant (≈90% in 0.4 s, settled in ~1 s). |


### 1.4 Typography

Fonts: **Instrument Serif** 400 (display) and **Inter** 400/500/600 (UI and body), both from Google
Fonts (OFL), so `next/font/google` is fine. No other face is used, apart from the header wordmark, which is an SVG image.

Measured styles (design px per range; letter-spacing in em):

| Style | Used for | 1920 | 1440 | 992 | 768 | 480 | 320 | line-height / tracking |
|---|---|---|---|---|---|---|---|---|
| display-xl | "Works with / smart paper", "Inside / the box" | 200 | 150 | 120 | 96 | 70 | 60 | 0.8 (≥992), 1.0 (≤991) / −0.05 |
| display-l | Hero, "Nota pen / Specifications", "Stay ahead" | 96 | 96 | 96 | 96 | 70 | 60 | 1.0 / −0.04 (≥768), −0.05 |
| display-colorway | "Impossible to", colourway names/taglines | 96 | 96 | 60 | 52 | 30 | 30 | 1.0 (1.1 ≤767) / −0.04…−0.05 |
| heading-m | Smart-paper step headings, statements | 70 | 55 | 46 | 52 | 30 | 30 | 1.1 / −0.03 |
| lead | "This tool is made for people…" | 32 | 26 | 26 | 26 | 20 | 20 | 1.2 / −0.07 (−0.06 ≤767) |
| title | Card titles, spec group titles, step subheadings | 24 | 22 | 22 | 24 | 18 | 18 | 1.0 / −0.07 |
| body | Card bodies, modal subtitle | 18 | 18 | 18 | 18 | 15 | 14 | 1.3 / −0.05 |
| body-s | Spec items, step bodies | 16 | 16 | 16 | 16 | 15 | 14 | 1.3 / −0.05 |
| tagline | Footer tagline | 24 | 24 | 24 | 20 | 18 | 18 | 1.15 (1.2 ≤991) / −0.06 |
| ui | Nav, CTA, footer links | 16 | 16 | 16 | 16 | 15 | 14 | 1.0 / −0.04 |
| label | "Navigation", "Year", copyright | 14 | 14 | 14 | 14 | 14 | 14 | 1.0 / −0.04 |
| pill | Bento tile labels | 18 | 18 | 18 | 18 | 14 | 14 | 1.0 / −0.07 |
| credit-name | Credits popover names | – | 30 | – | – | – | – | 1.1 / – |

Weights: nav and header 500, footer 600, titles/lead 600, body 400, list items 500. **Two-tone headings** are
a recurring pattern: first line muted (#666 "Nota pen" or #999 "Inside", "Works with"), second line black.
Statement sizes per range were confirmed in Phase 3 (inside-the-box statement: 43.65 at 992, 53.28 at 1440,
67.2 at 1920; word spacing in §1.1).

### 1.5 Colour tokens (colour-picked)

| Token | Value | Where |
|---|---|---|
| black / white | #000 / #fff | Text, footer, who-it's-for, details background |
| grey-666 | #666666 | Muted heading line, modal subtitle, footer credits |
| grey-999 | #999999 | Muted display line ("Inside", "Works with") |
| panel-light | #f2f2f2 | Kit image card and light tiles |
| card-dark | #131313 | Smart-paper step cards |
| error | #ff2200 | Modal error state (label, line, message, button) |
| white-40/50/55 | rgba(255,255,255,.4/.5/.55) | "Nota One" in CTA, copyright, footer labels |
| stage gradient | radial: #9fa9b1 at top-centre → #6d7178 → #3a3c40 at edges | Preloader and hero background |
| colourway text | e.g. Bright Orange = #5e1550 | Varies per colourway (CMS field) |

### 1.6 Header

- **Desktop (≥992):** fixed, transparent, 112px tall at 1440. Wordmark top-left, 4 nav links in a row
  (Inter 500, 16), and on the right a **white panel** holding the brand mark and a black **"Order · Nota One · $300"**
  button ("Nota One" at 40% white, radius 4px).
- **Mobile/tablet (≤991):** wordmark left, 3×3-dot **burger centred** (38px), brand mark right, and a hairline
  divider beneath. 76px tall at 375, 57px at 768.
- **Behaviour (all widths):** hides (translateY −100%) once you scroll past the end of the hero, and comes back
  on **any** upward scroll. Text colour switches **per section** (white over dark scenes, black over light
  ones), so each scene declares its header theme.

---

## 2. Content (copy) inventory

The full visible text per layout is in `data/visible-text-{1440,768,375}.txt`. Desktop and mobile copy is
**identical**. The only differences are forced line breaks (desktop breaks headings at fixed points, mobile
lets them wrap). So for the content model, a newline in a heading field means "desktop line break" (rendered as
block lines ≥992 and inline text ≤991). No separate mobile copy fields are needed.

Copy not in the main flow that must still come from Strapi: modal title and subtitle, the "E-mail"
placeholder, "Notify me", "Close", the error message ("Something went wrong! Try again"), credits names (9, in two
groups), footer links and their URLs, nav labels, and the CTA "Order" plus product name and price.

---

## 3. Section specs

Each section lists: content fields → desktop behaviour → static (≤991) layout → interactions.

### 3.0 Preloader (≥992 only)
- **Content:** none (the counter is functional UI).
- **Desktop:** full-screen stage gradient, centred counter "0%…100%" (Instrument Serif, about 32px, white).
  Measured: counts **0→100 in ~1.2s with an ease-in-out curve**, holds at 100% for ~1.9s (assets loading),
  then the overlay **fades out over ~0.8s**. The header and hero heading **fade in over ~0.7s**, starting about
  2.0s after 100%; during this fade the nav labels **scramble once** and resolve to their text. Pen frame 0 is already in place underneath.
- **≤991:** no preloader.
- **Ours:** real progress (fonts, Lottie, first video metadata), minimum 1.2s, fade 0.8s, hard timeout 6s.

### 3.1 Hero (`#hero`)
- **Content:** heading "Smart pen / for real thinking"; desktop image sequence (Lottie, 76 frames,
  1920×1080, 15fps); mobile/tablet static vertical pen image (`nota_hero_image_adaptive`).
- **Desktop:** stage gradient background, sequence scrubbed by scroll across the 1.7vh pin (the pen slides in from
  the right, nib pointing left, then reveals the full pen horizontally). Heading fixed bottom-left (display-l,
  white, left 40 design px). The header sits over it in its dark theme.
- **≤991:** full-height gradient, pen vertical (nib down) and centred, heading centred near the bottom.

### 3.2 Column wipe (transition, desktop)
- 6 equal white columns rise from the bottom with a left→right stagger, covering the frozen hero. When full,
  1px light-grey column dividers stay visible briefly, then fade as specs content enters. Pure code, no CMS.

### 3.3 Specs (`#specifications`)
- **Content:** two-tone heading (muted "Nota pen", strong "Specifications"), pen image (desktop vertical
  233×734; tablet `scene2-adaptive768`; mobile horizontal `scene2-adaptive480`), **3 spec groups**
  (Writing System / Capture Technology / Digital Continuity), each with **4 items**.
- **Desktop:** white background. Heading eases up and settles; the pen rises from below to the centre; three cards
  (title plus item rows, each row with a small dot on the right) rise with a stagger and align in a row. The pen
  overlaps the middle card with a soft white fade at its base.
- **≤991:** heading centred, pen image beneath, groups stacked as light-grey rounded panels with rows.

### 3.4 Silhouette to black (transition, desktop)
- A black, stepped pen-shaped silhouette rises from the pen's position and scales up until it fills the screen.
  It's our own SVG shape, not CMS content.

### 3.5 Who it's for (`#who-its-for`)
- **Content:** statement ("Some thoughts need time…"), eyebrow "WHO IT'S FOR:", 2 intro paragraphs,
  **3 audience cards** (title + body), and one video (`25824…_1920.mp4`, 5.07s, H.264) with a poster.
- **Desktop:** black. The statement (heading-m, white) is sticky at the top while its words **reveal from grey to
  white** with scroll. The intro paragraphs sit right-aligned with a first-line indent. Cards scroll up in a
  right-hand column, each indented a little further right (staircase).
- **Video (scene 6):** **plays in real time once** (not looped, **not scrubbed**: the playhead advances with
  wall-clock time). Scroll drives its **frame**: it grows from a tile at the bottom right (831×403) to near full-bleed
  (1340×650, 50px margins), then shrinks and fades to 20% as the white "Works with smart paper" panel rises.
- **≤991:** stacked: statement, eyebrow, lead paragraph, cards, then the video as a rounded tile.

### 3.6 Smart paper (`#about`: the "About" nav link lands here)
- **Content:** two-tone intro heading ("Works with / smart paper"), **4 steps**, each with a heading (desktop line
  breaks), subheading, body and an art-directed image:
  1. "We use special paper / with a nearly invisible pattern", "For the pen, it's a precise map"
  2. "Looks like paper. / Works like a system.", "For you, it's just a blank sheet"
  3. "No delays. No glitches. / No random effects.", "AI-powered structure"
  4. "Everything you write is synced / to your phone in real time", "Your notes. Already there."
- **Desktop (pinned 5vh):** the white intro panel splits into 6 columns that drop away, revealing step 1. Each step
  change: the current full-bleed image **shrinks and fades** while the next **zooms from 1.4× to 1.0×**. Heading
  top-left (heading-m, white). Bottom-right **two stacked dark cards** (#131313): subheading, then body.
  **4-segment progress bar** at the bottom; the active segment is brighter.
- **≤991:** intro heading on white, then a **swipeable carousel** (no autoplay, verified over 8s) with heading,
  image, cards and a segmented progress bar.

### 3.7 Into "Inside the box" (transition, desktop)
- Columns rise to black, a **6px white dot** appears centre-screen, the dot **expands into a circle** until white
  fills the screen and reveals "Inside / the box" (display-xl, two-tone), and the heading moves up while horizontal
  stripes draw in below.

### 3.8 Inside the box (`#inside-the-box`)
- **Content:** two-tone heading; kit card title "A complete, ready-to-use set" plus body; kit image (box with
  notebook and pen); statement ("A precision smart pen with a solid aluminum body…"); **2 items** (name,
  description, image): "The NŌTA Smart Pen" and "Charging Adapter".
- **Desktop (normal flow):** kit image in a large #f2f2f2 rounded tile (1360×820 at 1440) with the kit card text
  top-right fading in. The statement is centred serif with a **word-by-word grey→black reveal**. The two product
  cards (670×820 each) are revealed through a **horizontal-stripe "blinds" wipe**, then their title and body fade in.
- **≤991:** stacked: heading, kit card, kit image, statement, then product cards (image + text).

### 3.9 Details bento
- **Content:** **6 tiles** in fixed slots: 5 images plus 1 looping video (`7b66…_1920.mp4`, 5.2s). 4 tiles carry a pill
  label: "Flush-fit precision cap", "Refined colors. Personal expression", "Durable metal nib, low-profile
  control button" (on the video), "Aluminum body". Art-directed crops per range (`scene_6_*`).
- **Desktop:** black background, large-radius tiles. As each tile enters it scales ~1.28→1.0 and fades in. The
  video loops while visible. Pills: dark translucent background, white Inter 600.
- **≤991:** single-column stack of the art-directed tiles, video included.

### 3.10 Colorways
- **Content:** split heading "Impossible to" | "overthink", intro image (silver pen), and **4 colourways**
  (name + tagline + full-bleed image + text colour): Graphite Black ("Clarity in silence."), Mist Blue ("Light
  thinking."), Precision Red ("Form follows thought."), Bright Orange ("Steady focus."). The pen and gradient
  are part of each image.
- **Desktop (pinned 2.5vh):** text splits around the centred pen. Each colourway **cross-fades** its image
  (stacked, next fades in on top) and its name/tagline pair over ~0.5vh. **5-segment progress bar** plus a
  small dot at the bottom. The footer is revealed from underneath at the end.
- **≤991:** **swipe carousel** (no autoplay) of 5 slides, text centred above the pen, segmented progress.
- **Pricing link:** the product is "Nota One, $300". The same product feeds the header CTA.

### 3.11 Footer and credits popover
- **Content:** tagline (2 desktop lines), "Navigation" heading plus the 4 nav links, "Year" / "2026",
  "@2026 Nōta Team", credit links: "Made in Taptop" (taptop.pro), "Builded by NōtaTeam" (**opens the credits
  popover**), "Designed by Alice" (behance.net/alicem), "& UPROCK Studio" (uprock.ru).
- **Desktop:** black, 370 design-px tall. Tagline left, Navigation column at the centre line, Year right-aligned;
  bottom row of credits in #666, underline on hover.
- **Credits popover:** a small card with the stage gradient, anchored above "Builded by NōtaTeam", with a × close
  button. **9 names in two groups (5 + 4)**, Instrument Serif ~30 at 1440, white, centred. Closes with ×, Esc or a
  click outside.
- **Not reproduced:** the grey "Made in Taptop" badge bar below the footer, which the platform injects and is not part of
  the design.

### 3.12 Waitlist modal ("Stay ahead")
- **Trigger:** any "Order · Nota One · $300" CTA (header, or mobile menu).
- **Content:** title "Stay ahead", subtitle "Launching soon. Get early access and insider updates", field
  placeholder "E-mail", button "Notify me •", link "Close", error "Something went wrong! Try again".
- **Layout (1440):** dim overlay, centred white card ~550×460. Title display-l black; subtitle body #666, centred;
  underline input (1px rgba(0,0,0,.2)); full-width black button (60px tall, radius 4px); centred grey "Close".
- **States:** default, focus, **error** (label, underline and message turn #ff2200 and the button turns #ff2200),
  invalid email (the reference falls back to the browser's native tooltip). Success state: not observable without submitting a
  real email, so we design it to match the error-state layout with CMS copy.
- **Reference quirks we won't copy:** its "required" message is in Russian ("Это поле обязательно"), and its CTA
  is a non-semantic element. Ours uses English CMS copy and a real `<button>`.

### 3.13 Mobile menu (≤991)
- **Trigger:** the centred 3×3-dot icon, which becomes ×.
- **Behaviour:** a white panel **slides down from the top** (~300ms) and covers the screen. It holds the header row,
  centred nav links (Inter 600, ~20 at 375, black), an **oval image** of the blue pen with the "Order Nota One •
  $300" pill on top (`popup_order-img*` art-directed: ≥768 / 480 / 320), and the footer credits. Tapping a link
  closes the menu and **smooth-scrolls (~1s)** to the section; × slides the panel back up.

### 3.14 Anchor navigation
- **Desktop:** links **jump instantly** (no smooth scroll) to fixed points inside the pinned scenes:
  Specifications 2.65vh, Who it's for 5.92vh, About 9.92vh (smart-paper start), Inside the box 16.2vh. The
  reference uses invisible marker elements. We'll compute targets from our ScrollTrigger scene positions.
- **≤991:** smooth scroll to the section top. The logo links to `/`.

---

## 4. Interaction inventory (the build checklist)

| # | Interaction | Where | Trigger | Behaviour | Confidence |
|---|---|---|---|---|---|
| 1 | Preloader counter + reveal | ≥992 | load | §3.0 timings | High (measured) |
| 2 | Header hide/show | all | scroll direction | hide past hero, show on any scroll-up, translateY | High |
| 3 | Header theme switch | all | section under header | white ↔ black text | High |
| 4 | Nav hover | ≥992 | hover | 1px underline fades in/out | High |
| 5 | Nav text scramble | ≥992 | page load | Labels show random letters that resolve to the real label once, during the header reveal (~0.7s). Not on hover. | Medium (seen by eye, §9) |
| 6 | Order CTA hover | ≥992 | hover | subtle (to match in Phase 4) | Medium |
| 7 | Waitlist modal | all | CTA | open/close, Esc, overlay click, 4 states | High |
| 8 | Hero sequence scrub | ≥992 | scroll | 76-frame Lottie tied to the 1.7vh pin | High |
| 9 | Column wipe ↑ (×2) and ↓ (×1) | ≥992 | scroll | §3.2, §3.6, §3.7 | High |
| 10 | Specs entrance | ≥992 | scroll | heading, pen, staggered cards | High |
| 11 | Silhouette to black | ≥992 | scroll | §3.4 | Medium (shape to design) |
| 12 | Statement word reveal (×2) | ≥992 | scroll | grey→white / grey→black per word | High |
| 13 | Audience cards staircase | ≥992 | scroll | right-column offsets | Medium |
| 14 | Video frame grow/shrink + play-once | ≥992 | scroll / in-view | §3.5 | High |
| 15 | Smart-paper steps + progress | ≥992 | scroll | §3.6 | High |
| 16 | Dot → circle reveal | ≥992 | scroll | §3.7 | High |
| 17 | Kit card fade, product "blinds" reveal | ≥992 | scroll | §3.8 | Medium |
| 18 | Bento tile scale-in, looping video | ≥992 | scroll / in-view | §3.9 | High |
| 19 | Colorway cross-fades + progress | ≥992 | scroll | §3.10 | High |
| 20 | Footer reveal from under colorways | ≥992 | scroll | sticky curtain | High |
| 21 | Credits popover | all | click "Builded by…" | §3.11 | High |
| 22 | Footer link hover | all | hover | underline | High |
| 23 | Burger menu | ≤991 | tap | §3.13 | High |
| 24 | Smart-paper carousel | ≤991 | swipe | no autoplay, segmented progress | High |
| 25 | Colorways carousel | ≤991 | swipe | no autoplay, 5 slides | High |
| 26 | Anchor nav | all | click | §3.14 | High |
| 27 | Reduced motion | all | OS setting | **The reference ignores it** (same pins and preloader). Ours: static layouts, no preloader, posters instead of autoplay. Exceeds the reference. | n/a |

---

## 5. Asset inventory → Strapi fields

Full list with source URLs: `data/media-inventory.json` (about 60 images, 2 videos, 1 Lottie, 2 SVGs).
Many images are **art-directed per range**, so images use a `shared.responsive-image` component (§6).

| Asset(s) | Used in | Variants | Strapi field |
|---|---|---|---|
| `favicon.svg` | tab icon | – | `global.favicon` |
| `logo.svg` (4-petal mark) | header panel | – | `global.brandMark` |
| Wordmark "Nōta" (inline SVG, saved as `.svg`) | header | – | `global.logo` |
| `0_refinedcover_03_09.json` (Lottie, 1.77MB, 76 WebP frames) | hero, ≥992 | – | `sections.hero.sequence` (JSON media) |
| `nota_hero_image_adaptive` | hero, ≤991 | 1 | `sections.hero.staticImage` |
| `nota_scene_2_img`, `scene2-adaptive768`, `scene2-adaptive480` | specs pen | desktop / tablet / mobile | `sections.specs.penImage` |
| `25824…_1920.mp4` (3.0MB, 5.07s) | who it's for | 1 | `sections.audience.video` (+ poster) |
| `nota_scene_4_img_01…04` (1920×1080) | smart paper ≥992 | desktop | `steps[n].image.desktop` |
| `41_block`, `41_block1212`, `42_block`, `43_block` | smart paper 768 | tablet | `steps[n].image.tablet` |
| `41/42/43_block_480` | smart paper 480 | mobileLarge | `steps[n].image.mobileLarge` |
| `41_block_mobile_1…4` | smart paper ≤479 | mobile | `steps[n].image.mobile` |
| `nota_scene_5_img1`, `…img_01_adaptive`, `scene_5_320_smartpaper` | kit image | per range | `sections.inside-box.kitImage` |
| `nota_scene_5_img_02`, `scene_5_pen_static_480/320` | product: pen | per range | `items[0].image` |
| `nota_scene_5_img_03`, `new-scene_5_adapter`, `scene_5_768_devise-1`, `…img3_768/480`, `scene_5_adapter_static_320` | product: adapter | per range | `items[1].image` |
| `nota_scene_6_img_01/02/03/05/06`, `scene_6_1440_card_5`, `scene_6_{992,768,480,320}_card-N` | details tiles | per range | `sections.details.tiles[n].media` |
| `7b66…_1920.mp4` (3.2MB, 5.2s, loop) | details tile 4 | 1 | `sections.details.tiles[3].video` |
| `nota_scene_7_img_01` | colorways intro | 1 (+640 thumb) | `sections.colorways.introImage` |
| `nota_scene_7_img_02…05` | colourway images | 1 | `product.colorways[n].image` |
| `ellipse_6750.svg` (6px dot) | colorways progress dot | – | UI chrome in code (functional) |
| `popup_order-img`, `…img480`, `…img320` | mobile menu oval | ≥768 / 480 / 320 | `global.mobileMenu.image` |
| `opengraph.jpg` | og:image | – | `global.defaultSeo.ogImage` |

---

## 6. Content-model draft (to finalise in Phase 2)

Corrected against the audit. Changes from the master-prompt draft are marked **(changed)**.

**Shared components**
- `shared.seo`: `metaTitle` (≤60), `metaDescription` (≤160), `ogImage`, `canonicalUrl`, `noIndex`
  (default true), `noFollow` (default true).
- `shared.responsive-image` **(new)**: `desktop` (image, required), `tablet` (≤991, optional),
  `mobileLarge` (≤767, optional), `mobile` (≤479, optional), `alt` (required, ≤160). Each slot falls back to the
  next larger one, rendered as `<picture>`.
- `shared.video` **(new)**: `file` (video, required), `poster` (image, required), `alt`/label.

**Single type `global`**
- `siteName`, `logo`, `brandMark`, `favicon`
- `navigation`: repeatable `elements.nav-link` { `label` (≤24), `targetAnchor` } **(changed: one list shared
  by header, mobile menu and footer)**
- `orderCta`: `elements.order-cta` { `label` ("Order"), `product` → Product } (renders "Order · {name} · {price}")
- `mobileMenu`: { `image` (responsive-image) } **(changed: the only menu-specific content)**
- `preloader`: { `enabled` }
- `waitlistModal`: { `title`, `subtitle`, `emailPlaceholder`, `submitLabel`, `closeLabel`, `successTitle`,
  `successMessage`, `errorRequired`, `errorInvalidEmail`, `errorGeneric` } **(changed: no image, since the
  reference modal has none)**
- `footer`: { `tagline`, `navHeading`, `yearLabel`, `yearValue`, `copyright`, `credits` (repeatable
  `elements.credit-link` { `label`, `url`, `opensTeamPopover` (bool) }), `teamGroups` (repeatable
  `elements.person-group` { `people` (repeatable `elements.person` { `name` }) }), `popoverCloseLabel` }
- `defaultSeo`: `shared.seo`

**Single type `homepage`**: `seo` plus `sections` (dynamic zone). Every section has `anchorId` and `isHidden`.
- `sections.hero`: `heading` (text, newline = desktop break), `sequence` (Lottie JSON media), `poster`
  (image, reduced-motion fallback), `staticImage` (responsive-image, ≤991)
- `sections.specs`: `headingMuted`, `heading`, `penImage` (responsive-image), `groups` (repeatable
  `elements.spec-group` { `title`, `items` (repeatable `elements.text-item`) }, exactly 3)
- `sections.audience` **(changed name and fields)**: `statement`, `eyebrow`, `intro` (repeatable paragraph),
  `cards` (repeatable { `title`, `body` }), `video` (shared.video)
- `sections.smart-paper`: `headingMuted`, `heading`, `steps` (repeatable `elements.story-step` { `heading`,
  `subheading`, `body`, `image` (responsive-image) }, 2–6)
- `sections.inside-box`: `headingMuted`, `heading`, `kitTitle`, `kitBody`, `kitImage`, `statement`,
  `items` (repeatable `elements.product-item` { `name`, `description`, `image` }, exactly 2)
- `sections.details` **(changed: tiles, not callouts)**: `tiles` (repeatable `elements.detail-tile`
  { `image` (responsive-image), `video` (optional shared.video), `label` (optional pill) }, exactly 6 slots)
- `sections.colorways`: `headingStart`, `headingEnd`, `introImage`, `product` → Product

**Collection `product`** (D&P on): `name`, `slug` (uid), `price` (decimal), `currency` (enum, default USD),
`colorways` (repeatable `elements.colorway` { `name`, `tagline`, `image` (responsive-image), `textColor`
(color picker), `swatch` (color picker) }).

**Collection `waitlist-signup`** (D&P off): `email` (email, required, unique, ≤254), `source` (enum:
`header-cta`, `mobile-menu-cta`).

What stays in code (to list in README trade-offs): burger/×/chevron icons, the progress-dot SVG, the
silhouette shape, column/stripe/circle transitions, all scene timings and easings (named constants), header
theme per section, and the reference's design-width scaling numbers.

---

## 7. Risks

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| 1 | **Time:** ~3.5 days for 7 phases | High | Order work by assessment weight: infra and CMS first (deterministic marks), then static layouts, then scenes by visual impact (hero, specs, smart paper, colorways, then transitions). Cut Strapi Preview. |
| 2 | **Railway $5 trial** may not last until the round closes (3 always-on services + volume) | High | Watch usage daily. Tell you before anything billable. Keep services small. |
| 3 | **Video/Lottie reuse** is not explicitly allowed by the brief | Medium | Ask Surge (§9). Fallback: still images with CSS/GSAP motion in place of the sequence and videos. |
| 4 | **Art-directed images** (~60 files) make the seed and editor UX heavy | Medium | `responsive-image` with fallbacks; an idempotent seed uploads everything. |
| 5 | **Page weight:** 1.77MB Lottie + 2×3MB video + images | Medium | Lottie desktop-only and loaded during the preloader; videos `preload="metadata"` and lazy; `next/image` sizes; mobile never loads the sequence. |
| 6 | **Scene fidelity:** 9 bespoke transitions | Medium | Fine per-scene capture (100px steps) in Phase 4; side-by-side QA script. |
| 7 | **Safari / iPad:** cinematic mode applies to iPad landscape (≥992, touch) | Medium | CSS sticky (not JS pin), `svh`/`lvh` units, test iOS Safari in Phase 6. |
| 8 | **Next 16 / Strapi 5 API drift** (caching, `revalidateTag`, Document Service, webhooks) | Medium | Check current docs before each API use, as the master prompt requires. |
| 9 | **Reference may change or go down** mid-build | Low | All captures stored locally in `docs/reference/`. |
| 10 | **Scaling jumps at boundaries** (e.g. 174px → 150px at 1440) look like bugs to a reviewer | Low | Document as "matches reference" in the README. |

---

## 8. Corrections to the master prompt's initial observations

| Master prompt said | Audit found |
|---|---|
| 7 breakpoint ranges incl. 1280–1439 | **6 ranges**; 1280 is not a breakpoint. Per-range vw scaling (§1.1). |
| Text-scramble hover on nav | Scramble runs **once on page load**. Hover is an **underline fade** (§9). |
| Two scroll-**scrubbed** videos in transitions | The **hero Lottie image sequence** is the scrubbed element. Video 1 **plays once** with a scroll-driven frame; video 2 **loops** in the bento. The dense-keyframe re-encode is not needed (a web-optimised encode still helps). |
| Lottie location unknown | It **is the hero** (76-frame image sequence). |
| Details = image + callouts with anchorX/Y | Details = **bento of 6 tiles** with pill labels. |
| Credits popup opens from "Designed by…" | Opens from **"Builded by NōtaTeam"**; "Designed by Alice" and "UPROCK Studio" are external links. |
| Modal has an image | Modal has **no image**; `popup_order-img*` belongs to the **mobile menu**. |
| Header fixed | Header **hides on scroll-down, shows on scroll-up**, and switches theme per section. |
| Preloader on all sizes | **≥992 only.** |
| Colorways switching unknown | Desktop: **scroll cross-fade**. ≤991: **swipe carousel**. |

---

## 9. Open questions

**Resolved with the candidate (16 Nov):**
1. **Scramble:** the nav labels scramble **once, on page load** (during the header reveal). Checked by eye
   in a real browser; automation only captured the fade-in. **Hover is the underline.**
2. **Wordmark:** save the "Nōta" logo as an `.svg` file and upload it to Strapi as `global.logo`, like the
   other images.
3. **"Made in Taptop" credit:** keep it as-is (seeded content; editors can change it).

**For Surge (email Kavinda; the candidate sends it):**
1. May we reuse the reference's **videos** and **Lottie** (image sequence), or only still images?
2. Should reviewer accounts be **Super Admin** or **Editor**?

---

## 10. Plan to the deadline (Fri 20 Nov 09:00 IST; freeze Thu 19 Nov ~22:00 IST)

| When | Phase |
|---|---|
| Mon 16 evening | Phase 0 ✓, start Phase 1 locally (monorepo, docker Postgres, Strapi + Next) |
| Tue 17 | Phase 1 deployed on Railway (needs you for account/GitHub), Phase 2 content model + seed |
| Wed 18 | Phase 3 layouts at all 6 ranges, Phase 5 form end-to-end |
| Thu 19 | Phase 4 scenes (priority order), Phase 6 hardening, Phase 7 docs, recording, reviewer accounts, `v1.0.0` |
