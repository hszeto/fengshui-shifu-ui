# Plan: ba-zhai-directions-card

Spec: `ai/feature-specs/ba-zhai-directions-card.md`

## Confirmed Decisions

All three of the spec's open questions were answered inline and promoted to
**Resolved Decisions** there. Restated:

1. **Full-width block below the grid**, not a fifth peer inside `resultGrid`.
   As a peer it would inherit `flex: 1, minWidth: 200` and, on a wide viewport,
   sit on a single row at ~220px — stacking its pills one per row and, because
   flexbox stretches every card on a line to the tallest, dragging Day Master
   and Day Branch to roughly 4× their natural height.
2. **Green border, green pills.** `greenBorder` joins the existing
   `goldBorder` / `redBorder` modifiers, reusing `colors.green` and
   `colors.greenBgLight`. No new palette entries.
3. **Kua card stays as is** — tag, number, group line. The group belongs with
   the number that determines it.

Two decisions carried forward from earlier in the session and recorded as spec
requirements rather than re-asked: `Relationships` as Yan Nian's short label,
and including the `api.ts` nullability correction.

## Research findings that shape this plan

- **`teaserCard` is the precedent to copy** (`appStyles.ts:268-275`): full-width
  sibling below the grid, no `flex`, no `minWidth`, `marginTop: 16`, same
  `borderWidth: 1` + `padding` + `borderRadius` idiom. The Ba Zhai card is the
  same shape of thing and should follow it rather than inventing a layout.
- **Insertion point is between the grid and the teaser.** `resultGrid` closes at
  `App.tsx:306`; the forecast teaser opens at `308`. The card goes in that gap,
  so the reading order is pillars → Kua → directions → today's forecast.
- **Modifier idiom is established.** Every card is rendered as
  `[styles.resultCard, styles.goldBorder]` (`App.tsx:260, 271, 283, 295`).
  Keeping `[styles.baZhaiCard, styles.greenBorder]` matches it, which is why the
  green is a separate modifier rather than baked into the base style.
- **`strict` is not enabled.** `tsconfig.json` only extends `expo/tsconfig.base`,
  which sets `allowJs`, `jsx`, `lib`, `target` — not `strict` or
  `strictNullChecks`. The `api.ts` nullability change therefore has no
  compile-time effect; it corrects a misleading interface. The runtime guard is
  still what prevents the null dereference.
- **`npm run build:web` does not type-check.** Metro/Babel strip types without
  checking them. It catches syntax errors, bad imports and bundling failures
  only.
- **`npx tsc --noEmit` exits 0 on the current clean tree**, so it is usable as a
  real second gate and any error it reports afterwards is attributable to this
  work. It is not wired to an npm script; run it directly.
- **All eight arrow glyphs are present** in the installed MaterialCommunityIcons
  glyph map (re-verified on the current tree). `MaterialCommunityIcons` is
  already imported at `App.tsx:11`. No new dependency.

## Approach

Extract the direction metadata into a data module, then drive the pill grid from
an explicit ordered array so render order is guaranteed and no lookup can
silently yield `undefined`.

`src/constants/kuaDirections.ts` holds two lookups:

- `COMPASS` — the eight abbreviations the API returns mapped to
  `{ label, icon }`, carrying the north-up comment the spec requires.
- `AUSPICIOUS_DIRECTIONS` — an ordered array of `{ key, tag, meaning }`, where
  `key` is the `kua_profile` property name. Ordering the array fixes render
  order without depending on object key order.

A `resolveCompass(value)` helper returns the `COMPASS` entry or falls back to
`{ label: value, icon: null }`, handling the unrecognized-value case once rather
than at each call site.

`App.tsx` renders the card after `resultGrid` closes, guarded by its own
`{baziResult.kua_profile && ...}` check — deliberately its own guard, not a
shared one with the Kua card, so the two can never drift apart.

Pill sizing: `flexBasis: '47%'` with `flexGrow: 1` and `minWidth: 150` inside a
wrapping row. Two pills per row while the card's content area is wider than
roughly 312px, dropping to one per row below that. `47%` rather than `48%` or
`50%` leaves room for the `gap` without the two columns overflowing their row on
narrow screens. These numbers want a visual check, not just arithmetic.

## Files Touched

- `fengshui-shifu-ui/src/constants/kuaDirections.ts` — **new.** `COMPASS`,
  `AUSPICIOUS_DIRECTIONS`, `resolveCompass`, and the north-up comment.
- `fengshui-shifu-ui/src/styles/appStyles.ts` — add `baZhaiCard` (full-width,
  modelled on `teaserCard`), `greenBorder`, and the pill styles
  (`directionGrid`, `directionCell`, `directionCellTag`,
  `directionCellMeaning`, `directionCellCompassRow`, `directionCellCompass`);
  **remove** the dead `directionPill` and `directionText` (lines 257-268).
- `fengshui-shifu-ui/App.tsx` — delete the pill block at lines 299-303; add the
  Ba Zhai card between the grid close (306) and the teaser (308); add the
  `kuaDirections` and `colors` imports.
- `fengshui-shifu-ui/src/services/api.ts` — `kua_number: number | null`,
  `kua_profile: {...} | null` (documentation only, per findings above).
- `fengshui-shifu-ui/src/styles/colors.ts` — **no change.** `colors.green` and
  `colors.greenBgLight` already exist.

## Checkpoints

1. **Data module + styles.** Add `src/constants/kuaDirections.ts`; add
   `baZhaiCard`, `greenBorder` and the pill styles to `appStyles.ts`; apply the
   `api.ts` nullability change. Nothing renders differently yet — the app must
   build and run exactly as before. Gate: `npx tsc --noEmit`.
   — lands in `fengshui-shifu-ui`; the user commits it.
2. **Render the card.** Remove the pill from the Kua card, add the Ba Zhai card
   below the grid, delete the dead `directionPill` / `directionText` styles.
   Gates: `npx tsc --noEmit`, `npm run build:web`, then the manual pass below.
   — lands in `fengshui-shifu-ui`; the user commits it.

Single-repo feature, so there is no cross-repo sequencing constraint. The two
checkpoints can be squashed into one commit if an intermediate commit that adds
an unused module isn't wanted — the split is for reviewability, not correctness.

**No git operations will be run.** No branch is created and nothing is
committed; each checkpoint is reported as ready with its message, and the user
runs `git commit`.

## Test Plan

- **api:** none. Nothing under `fengshui-shifu-api/` is modified, no RSpec run is
  required, and the response contract is unchanged. `KUA_DIRECTIONS` in
  `constants.rb` serves only as the reference table to check expected values
  against.
- **ui:** the repo has **no test runner and no linter** — `package.json` defines
  only `start`, `android`, `ios`, `web`, `build:web`. Nothing automated asserts
  any acceptance criterion. Two partial gates exist, and it is worth being
  precise about each:
  - `npx tsc --noEmit` — catches wrong property names on `kua_profile`, invalid
    icon names (the icon type is derived from the glyph map), and import errors.
    Baseline currently clean.
  - `npm run build:web` — catches syntax errors, unresolved imports, bundling
    failures. **Does not type-check.** Necessary, not sufficient.
  - **Manual verification is the only real coverage.** Run `npm run web` and:
    1. **Default load, no gender** — neither the Kua card nor the Ba Zhai card
       renders; no console error. This is the on-mount state and the primary
       edge case.
    2. **1990-06-15, Male** → Kua 9, East group. Sheng Qi **East**, Tian Yi
       **Southeast**, Yan Nian **North**, Fu Wei **South** — arrows → ↘ ↑ ↓.
    3. **1990-06-15, Female** → Kua 6, West group. Sheng Qi **West**, Tian Yi
       **Northeast**, Yan Nian **Southwest**, Fu Wei **Northwest** — arrows
       ← ↗ ↙ ↖. Cases 2 and 3 together cover one East-group and one West-group
       Kua, and are a real transposition check because no direction occupies the
       same slot in both.
    4. **1985-06-15, Male** → Kua 2, via the 5→2 centre-palace substitution.
       **Northeast**, **West**, **Northwest**, **Southwest**.
    5. **1980-06-15, Female** → Kua 8, via the 5→8 substitution. **Southwest**,
       **Northwest**, **West**, **Northeast**.
    6. **1990-01-01, Male** → Kua **1**, not 9. January 1 precedes Lichun, so the
       astrological year is 1989. Included deliberately: deriving the expected
       value from the calendar year gives the wrong answer, and correct output
       should not be mistaken for a bug. **Southeast**, **East**, **South**,
       **North**.
    7. **Layout regression check** — confirm the four existing cards are
       unchanged and, in particular, that Day Master and Day Branch are *not*
       stretched taller. Avoiding that was the whole reason for the full-width
       placement, so it is the thing to look at first.
    8. **Narrow viewport** — squeeze the browser until the card's content area
       drops below roughly 312px; pills should reflow from 2×2 to a single
       column with no clipped direction line and no horizontal page scroll.
    9. **Toggle gender off after a result** — the Ba Zhai card disappears
       cleanly along with the Kua card.
  - Expected values above were computed against the service's actual formulas
    (Lichun cutoff, gender branch, 5→2 / 5→8 substitution) and cross-checked
    against `KUA_DIRECTIONS`, not read off a calendar year. If the API happens to
    be running locally, they can also be confirmed directly with `curl` against
    `POST /api/v1/bazi/calculate` before touching the browser.

## Risks / Rollback

- **Low blast radius.** Presentation-only, one repo, one new file plus edits to
  three. The numbers are computed server-side and untouched, so the worst
  realistic outcome is a card that looks wrong, not one that lies.
- **Silent wrong-direction mapping is the real correctness risk.** Nothing
  automated catches `tian_yi` wired into the Yan Nian pill — both render
  plausibly. The paired East/West check in cases 2 and 3 exists specifically to
  catch a transposition, since a single Kua could coincidentally look right.
- **Layout is the most likely defect**, and `build:web` cannot see it. Two
  specific things to watch: sibling cards stretching (should now be impossible
  given the full-width placement — if it happens, the card ended up inside
  `resultGrid` by mistake), and the 2×2 → 1×4 reflow threshold.
- **Rollback:** revert either checkpoint. Reverting checkpoint 2 alone restores
  the old single pill only if the dead styles are restored with it; reverting
  both is the clean path back to the current card.
