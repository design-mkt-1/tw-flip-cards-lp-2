# <campaign name>

Fill this in as you go. It is the campaign's own record — what it is, what was
decided, and anything that deviates from the template. An empty deviation
section is the expected state.

---

## What this campaign is

One paragraph. The offer, the audience, where the traffic comes from.

- **Repo:** tw-<campaign>
- **Live:** https://design-mkt-1.github.io/tw-<campaign>/
- **Figma:** <node URL>
- **Started:** <date>

## The offer

| | |
|---|---|
| percent | |
| amount | |
| currency | |
| spins | |
| bonus code | |

## The mechanic

The six answers from step 2 of CAMPAIGN.md:

1. Does the visitor always win?
2. How many interactions before the pop-up?
3. What does the reveal show?
4. Behaviour under `prefers-reduced-motion`?
5. What happens on reload?
6. Layout mode — scrolling / fixed stage / artboard — and why.

## Art

Where each raw file came from, and the command that produced the shipped one.
`raw/` is gitignored, so this section is the only record of how to regenerate
it.

| shipped file | source | command |
|---|---|---|
| | | |

## Integration

| seam | value | filled by | date |
|---|---|---|---|
| form.endpoint | | | |
| links.terms | | | |
| links.privacy | | | |
| links.cta | | | |
| analytics | | | |

## Deviations from the template

Append-only. One line each: date · what deviated · why · who approved.

An entry here means a shared file was changed. That change belongs in
tw-lp-template, not in this clone — say here why it could not wait.

## Open at ship time

The things that cannot be closed from a desk, and anything else still unverified.

- [ ] iOS Safari on the live URL
- [ ] Android Chrome on the live URL
- [ ] Windows High Contrast

## Figma reference (flip cards 2)

Source: file `s2CqwGqe0O0FcALhBNlTRe`, page "Flip Cards 2" (42:848). Read 2026-11-03 via
`get_design_context` / `get_metadata`. Hex values are reference only: map them to
`css/tokens.css` tokens or keep them inside the exported art; never write a colour
literal in campaign CSS (`tools/tokens.py` forbids it).

### Exported art (`raw/img/` is gitignored; shipped files are in `campaign/assets/`)

| file | source node | notes |
|---|---|---|
| `card-back.{avif,webp}` | 42:2475 (inside "close" 42:2474) | 544x762 = 272x381 at 2x, transparent rounded corners (r=64px at 2x). Drop shadow NOT baked in: add in CSS. Has no text. |
| `card-face-*.svg` (glow, rays, corner-tl/tr/bl/br, star) | 42:2685 / 2686 / 2696-2702 / 2704 | Flat vector pieces of the gold face. The face itself cannot be exported text-free as one image (see below), so it is rebuilt in CSS from these + the recipe below. |
| `bg-desktop-{1280,1920,2560}` | 42:2390 | Whole frame (glows, rings, light beams, dot grid, bottom fade). It contains no header, footer or cards. |
| `bg-mobile-{375,750}` | 42:2739 | Same layers, 375x714 artboard. |
| logo | n/a | Template already ships `assets/img/logo-topwin.svg` (shared, not exported again). |

Not exportable clean:
- **Gold face as one image:** in 42:2683 the amount text is a live text layer inside the same `playing-card`/`Background` frame, and `download_assets` cannot export a frame without its text (hiding layers means editing Figma, not allowed). Face = CSS gradient + the SVG pieces above.
- **Win glow (42:2711):** there is no glow layer. 42:2711 differs from 42:2683 only in the card `box-shadow` (below) and the text colour of the first line's wrapper (`#ffe27a`, but every line is overridden by its own colour, so no visible change). The glow is CSS only.

### Card (desktop and mobile)

Design size of one card is 272x381 (card art box 272x381, symbol box 272x569 includes room for the flip shadow). Both layouts scale that card uniformly.

| | desktop (frame 1920x1080) | mobile (frame 375x714) |
|---|---|---|
| grid box | x 1173, y 173, 602 wide (right edge 1775) | x 45, y 232, 284 wide |
| card size | 176.4 x 246.9 (scale 0.6487 of 272x381) | 83.2 x 116.5 (scale 0.306) |
| column gap | 36.35 | 17.15 |
| row gap | 37.86 | 17.86 |
| grid | 3 x 3 | 3 x 3 |
| corner radius | 32 at 272 wide, i.e. about 20.8 scaled | about 9.8 scaled |

In the grid frames a card instance is 369 tall when it is the open face (the flip shadow area counts), 247 when closed: use the 247 box (ratio 272:381) for layout. Open-face instances in frame 42:3957 are 176.4 wide, same as closed.

| piece | back (42:2475) | gold face (42:2684) |
|---|---|---|
| border | 2px solid `#fff0b3` | 4px solid white at 95% |
| radius | 32 | 32 |
| fill | linear 255.4deg: `#2457e0` 11%, `#12348f` 50%, `#0a1e5e` 89% | linear to bottom: `#fff6d6`, `#ffd86b` 50%, `#f3ae2e` |
| box-shadow | 0 14 28 0 black 50% | 0 0 36 2 `#ffc400` 50%, then 0 14 28 0 black 50% |
| drop-shadow on symbol | 0 4 12 black 50% | same |
| frame outer | 1.5px `#fff0b3`, 95% opacity, r 22, inset 10 | 1.5px `#a8650a`, 55% opacity, r 22, inset 8 |
| frame inner | 1px `#fff0b3`, 50% opacity, r 16, inset 17 | 1px `#a8650a`, 30% opacity, r 16, inset 15 |
| extras | lattice lines 4% white, rays, medallion (TW coin), sheen 9% white 90px wide rotated 28deg | rays, face glow, corners, star, orn lines (gradient `#c2410c` 0-80%, 32x2), diamond 8px `#c2410c` rotated 45deg, sheen 35% white 70px wide rotated 28deg |

Win state (42:2711) = gold face with `box-shadow: 0 0 48 6 #ffc400 at 70%, 0 14 28 0 black 50%` (instead of 36 / 2 / 50%).

### Card text (gold face, real text, uppercase, centred, text-shadow 0 1 0 white 60%)

| variant | line | font | size / line-height | colour |
|---|---|---|---|---|
| 250 000 ₴ + 250 FS (42:2683, win 42:2711) | amount "250 000 ₴" | Roboto Black, wdth 100 (upright) | 46px / 52px | `#2a1600` |
| | "+" | same | 40px / 52px | `#7a2e00` |
| | "250 FS" | same | 50px / 52px | `#7a2e00` |
| 100% + 10 FS (seen in 42:3961) | "100%" | Roboto Black, wdth 100 (upright) | 71.58px / 47.24px | `#2a1600` |
| | "+" | same | 44px / 47.24px | `#7a2e00` |
| | "10 FS" | same | 53.69px / 47.24px | `#7a2e00` |

Text box: left 12.84%, right 13.09%, top 33.83%, bottom 27.9% of the 303.75x405 `playing-card` layer (x -20, y -28 inside the card). Not measured: the 650% + 250 FS variant (42:2599) and the 250 50 variant (42:2627); size them from the two rows above. The ₴ glyph is U+20B4: it needs the Noto Black carve-out (`python tools/fonts.py --check` after copy). Roboto wdth 100 means no `font-stretch` change here.

### Hero title (frame 42:3726; mobile 42:3654)

Both lines: Roboto Condensed Black Italic (`font-stretch: 75%`, weight 900, italic), uppercase.

| | desktop | mobile |
|---|---|---|
| eyebrow "ПЕРЕВЕРНИ КАРТКИ" | 44px, line-height 1.1, letter-spacing 1.76px, white | 18px, 1.1, 0.72px, white |
| eyebrow ornaments | line 96x3 (r 2) gradient `#ff6a2b` to transparent, star 14px, gap 20 | line 32x2, star 8px, gap 10 |
| headline "ЗАБЕРИ СВІЙ БОНУС!" | 106px, line-height 1, colour `#ff5a1f`, no wrap | 37px, 1, `#ff5a1f`, no wrap |
| headline effect | text-shadow 0 6 0 `#8f1f00`, 0 0 36 `#ff4500` at 40% | text-shadow 0 1 0 `#8f1f00`, 0 0 16 `#ff4500` at 40% |
| stack gap | eyebrow to headline 10, title block to status 48 | eyebrow to headline 6, logo to title 24 |
| position | frame x 152 y 403 (step 0) / x 123 y 403 (step 4), 875x275 | x 17 y 85, 340x115, logo 142x28 on top |

### Progress pill (status block; desktop 42:3735, mobile 42:3698)

| | desktop | mobile |
|---|---|---|
| pill | padding 6/14, gap 8, radius 100, fill white 8%, border 1px white 16% | padding 4/10, gap 6, radius 100, same fill and border |
| dots | 9 dots, 8px, pitch 12 (box 104x8) | 9 dots, 6px, pitch 9 (box 78x6) |
| dot filled | `#ffd900` | same |
| dot empty | white at 25% opacity | same |
| text "Відкрито N з 9" | Inter SemiBold 14px, white, line-height normal | Inter SemiBold 12px, white |
| hint line under pill | Inter Medium 20px, `#c9d6f2`, centred, gap 8 | Inter Medium 13px, `#c9d6f2`, gap 4 |
| example copy | step 0 mobile: "Відкривай карти по одній та збери 3 однакові"; step 1 desktop: "Чудовий старт! Шукай ще такі карти"; step 4: "Майже! Наступна карта може стати виграшною" | |

Note: Figma names Inter for the status text; the template ships one family (Roboto, see topwin-lp non-negotiables). Use Roboto weights 600 / 500 and say so if the owner wants Inter.
Dots: in step 1 (1 of 9) the first dot is filled, the rest empty; filled count = opened count (step 4 shows 4 filled).

### "Opened but dimmed" card (frame 42:3957, step 4)

An already-opened card keeps the full gold face (same gradient, frame, ornaments, text and the same `box-shadow` as the normal face, 36 / 2 / 50% glow) and the whole symbol is set to `opacity: 0.5`. No greyscale or filter. The symbol-level `drop-shadow(0 4 12 black 50%)` stays. The card that just flipped is at full opacity.
