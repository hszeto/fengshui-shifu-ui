# Plan: pink-female-gender-button

Spec: `ai/feature-specs/pink-female-gender-button.md`

## Confirmed Decisions

The spec's three questions were answered inline and promoted to **Resolved
Decisions** there:

1. **Male stays red** — only the Female button changes.
2. **Tailwind pink-500** — `#EC4899` border, `rgba(236, 72, 153, 0.2)` fill,
   mirroring the existing `red` / `redBgLight` pair.
3. **Named `pink` / `pinkBgLight`** — the palette names entries by colour, not
   role.

## Research findings

- **`genderBtnActive` is applied to both buttons** (`App.tsx:221` and `:227`) and
  is defined once (`appStyles.ts:178`). Editing it turns Male pink too, so the
  change has to be a new style plus a swap on the Female line only.
- **The Female button needs no compound style.** `genderBtnActive` sets exactly
  two properties, `backgroundColor` and `borderColor`, both of which the pink
  variant overrides. So Female uses `genderBtnActiveFemale` *instead of*
  `genderBtnActive`, not layered on top — one array entry changes, not two.
- **`colors.ts` groups accents together** (lines 7-18) as colour + translucent
  pairs. `pink` / `pinkBgLight` go after the `red` pair.
- **`npx tsc --noEmit` is clean** on the current tree, so it's usable as a gate
  and any new error is attributable to this change.
- **No contract change.** Nothing under `fengshui-shifu-api/` is touched and
  `api.ts` is untouched; `gender` still drives the Kua calculation identically.

## Approach

Add the two palette entries, add a `genderBtnActiveFemale` style, and change one
line of `App.tsx` so the Female button reaches for the pink variant.

`genderBtnActive` is deliberately left in place and unrenamed. It is now used
only by Male, and renaming it to `genderBtnActiveMale` would be more symmetric —
but that touches the Male line for no behavioural gain, and the style is still a
sensible generic "selected" appearance if a third option is ever added.

## Files Touched

- `fengshui-shifu-ui/src/styles/colors.ts` — add `pink: '#EC4899'` and
  `pinkBgLight: 'rgba(236, 72, 153, 0.2)'` to the Accents block, after the `red`
  pair.
- `fengshui-shifu-ui/src/styles/appStyles.ts` — add `genderBtnActiveFemale`
  (`backgroundColor: colors.pinkBgLight`, `borderColor: colors.pink`) next to
  `genderBtnActive`.
- `fengshui-shifu-ui/App.tsx` — line 227 only:
  `gender === 'female' && styles.genderBtnActive` →
  `gender === 'female' && styles.genderBtnActiveFemale`.
  Line 221 (Male) and line 230 (the label) are unchanged.

## Checkpoints

1. **The whole change** — palette entries, style, and the one-line swap in
   `App.tsx`. Gates: `npx tsc --noEmit`, `npm run build:web`, then the manual
   pass below.
   — lands in `fengshui-shifu-ui`; the user commits it.

**One checkpoint on purpose.** Three files, roughly five lines, no sequencing
constraint and nothing to verify in between. Splitting palette-then-usage would
produce an intermediate commit adding unused colours, which is ceremony rather
than reviewability at this size.

## Test Plan

- **api:** none. No file under `fengshui-shifu-api/` is modified and no RSpec run
  is required.
- **ui:** the repo has **no test runner and no linter** — `package.json` defines
  only `start`, `android`, `ios`, `web`, `build:web`. Nothing automated can
  assert a colour. Two partial gates:
  - `npx tsc --noEmit` — catches a typo'd style or colour key (e.g.
    `colors.pinkBgLigt`). Baseline currently clean. Not wired to a script.
  - `npm run build:web` — catches syntax and bundling errors only. **Does not
    type-check**; Metro/Babel strip types without checking them.
  - **Manual verification is the only real coverage.** `npm run web`, then:
    1. **Default load** — neither button selected, both neutral grey.
    2. **Click Female** — pink border and pink-tinted background; the `♀ Female`
       label stays clearly readable against it.
    3. **Click Male** — Male turns red, Female returns to neutral. Only one
       button ever appears selected.
    4. **Click the selected button again** — it clears back to neutral with no
       colour residue.
    5. **Look at the two side by side selected in turn** — this is the check that
       decides whether Resolved Decision 1 (Male stays red) actually holds up
       visually. If red and pink clash, that decision is worth reopening.

## Risks / Rollback

- **Near zero.** Presentational, one repo, ~5 lines, no data or logic path
  touched. The worst outcome is a colour someone dislikes.
- **The one real mistake available** is applying the pink style to line 221
  instead of 227, turning Male pink and leaving Female red. Manual step 3 catches
  it immediately.
- **Contrast** is the only judgement call: `#EC4899` at 20% opacity over
  `bgDark` (`#0F172A`) behind `textPrimary` (`#F8FAFC`). Expected to be fine —
  the fill is a subtle tint, not a solid — but it is a visual check, not a
  computed one.
- **Rollback:** revert the single commit.
