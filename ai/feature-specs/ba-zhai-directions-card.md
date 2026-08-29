# Feature Spec: ba-zhai-directions-card

## Repo(s) Touched
ui

## Summary
The Kua card surfaces only one of the four auspicious Ba Zhai directions the API
already returns, labelled "Top Wealth Direction". Remove that pill and give the
four directions their own card — a grid of four pills, each with a plain-English
meaning and its compass direction spelled out beside a north-up arrow. No API or
contract change: the data is already on the wire and already typed.

## Requirements

- **Remove** the `directionPill` block from the Kua card (`App.tsx:299-303`).
  The Kua card is left showing its tag, the number, and the group line.
- **Add a fifth card** to the results area for the Ba Zhai directions, following
  the existing card conventions: a `cardTag` header in the established bilingual
  style (e.g. `BA ZHAI DIRECTIONS (八宅)`), matching the
  `DAY MASTER (日主)` / `KUA NUMBER (卦号)` pattern already in use.
- The card holds four pills, in this fixed order: **Sheng Qi → Tian Yi →
  Yan Nian → Fu Wei**. Order is set explicitly in code, never derived from
  object key order on `kua_profile`.
- Each pill renders three lines, in this reading order:
  1. **Tag** — romanized name plus Chinese characters, e.g. `SHENG QI · 生气`.
  2. **Meaning** — plain English, fixed copy per direction:
     - Sheng Qi 生气 → `Wealth & Success`
     - Tian Yi 天医 → `Health & Support`
     - Yan Nian 延年 → `Relationships`
     - Fu Wei 伏位 → `Personal Growth`
  3. **Direction** — last in reading order but the most visually prominent line
     in the pill: an arrow icon, then the direction spelled out with the API's
     abbreviation in parentheses, e.g. `↖ Northwest (NW)`.
- Add a UI-side lookup keyed by the abbreviation the API returns, mapping each
  of the eight compass values to a full label and a `MaterialCommunityIcons`
  glyph:

  | API | Label | Icon |
  |-----|-------|------|
  | `N`  | North     | `arrow-up-thick` |
  | `NE` | Northeast | `arrow-top-right-thick` |
  | `E`  | East      | `arrow-right-thick` |
  | `SE` | Southeast | `arrow-bottom-right-thick` |
  | `S`  | South     | `arrow-down-thick` |
  | `SW` | Southwest | `arrow-bottom-left-thick` |
  | `W`  | West      | `arrow-left-thick` |
  | `NW` | Northwest | `arrow-top-left-thick` |

- Arrows are **north-up** — the convention used by a compass and by printed feng
  shui charts, not relative to the user's facing. `NW` points up-left. Comment
  this at the lookup table so it is not later "corrected".
- All eight glyphs are confirmed present in the installed `@expo/vector-icons`
  MaterialCommunityIcons glyph map, and `MaterialCommunityIcons` is already
  imported at `App.tsx:11` — **no new dependency**.
- Any new colors go in `src/styles/colors.ts` and are referenced from
  `src/styles/appStyles.ts`; no inline hex in `App.tsx`, per `CLAUDE.md`.
- `kua_number` and `kua_profile` in `src/services/api.ts` become nullable
  (`number | null`, `{...} | null`). The backend sends `null` for both whenever
  gender is absent, but the interface currently declares them required.
  *Carried forward from a decision made earlier in this session.* Note this repo
  does not enable `strict`, so the change documents the contract rather than
  enforcing it — the runtime guard still does the real work.

## Non-Goals

- **No API change.** `kua_profile` already contains all four values; nothing
  under `fengshui-shifu-api/` is touched.
- **No contract change.** `BaziCalculationResult` already declares all four
  fields. The nullability correction above fixes an inaccurate declaration; it
  does not change the response shape.
- **No inauspicious directions.** Huo Hai, Wu Gui, Liu Sha and Jue Ming are not
  returned by the API today. Out of scope; a separate cross-cutting feature.
- **No Chinese compass names.** Directions are spelled out in English only
  (`Northwest`, not `西北`), even though the direction names are bilingual.
- **No compass rose or graphical bagua.** Text pills with arrow glyphs only.
- **No change to the Day Master, Day Branch, Hour Branch or Forecast cards**,
  beyond whatever row-height effects fall out of the layout choice below.

## Edge Cases

- **Gender not selected → no Kua at all.** The API returns `kua_number: null`
  and `kua_profile: null` when gender is blank. The new card needs its own guard
  — it cannot rely on the Kua card's — and must not dereference `kua_profile`
  outside it. This is the default state: `handleCalculate` runs on mount with an
  empty gender, so first paint exercises this path. Result: **four cards without
  gender, five with** (or three/four without a birth time).
- **Row-height stretching.** `resultCard` is `flex: 1` inside a wrapping row, and
  flexbox stretches every card on a line to the line's height. A card holding
  four stacked pills is substantially taller than a three-line sibling, so
  whichever cards share its row grow to match, leaving dead space in them. This
  is the main reason the layout question below is open.
- **Narrow cards.** With `minWidth: 200` and `padding: 20`, a card at its
  minimum gives 160px of content — too narrow for two pills side by side, so
  the pills stack into a single column and the card becomes very tall.
- **Unrecognized direction value.** If the lookup misses (an API value outside
  the eight compass points), the pill must render the raw string with no icon
  rather than crashing or showing `undefined`.
- **Kua number 5 never occurs.** The service maps 5 → 2 (male) or 5 → 8 (female)
  and `KUA_DIRECTIONS` has no key `5`, so there is no missing-profile case
  beyond the null check above.
- **Dead styles.** `directionPill` and `directionText` (`appStyles.ts:257-268`)
  exist only for the pill being removed and are referenced nowhere else. They
  should be deleted, not left orphaned.

## Acceptance Criteria

- With a birth date entered **and** a gender selected, a Ba Zhai card appears
  showing four pills in the order Sheng Qi, Tian Yi, Yan Nian, Fu Wei.
- Each pill shows the bilingual tag, the fixed English meaning, and the compass
  direction spelled out with its abbreviation in parentheses, with the direction
  the most visually prominent line.
- Each pill shows the correct north-up arrow for its direction, verified by
  spot-checking one East-group and one West-group Kua against `KUA_DIRECTIONS`
  in the API's `constants.rb`.
- The Kua card no longer contains a direction pill, and the string
  `Top Wealth Direction` no longer appears anywhere in the codebase.
- With **no** gender selected, neither the Kua card nor the Ba Zhai card renders,
  and no error appears in the console on first load.
- No hex color literals are introduced into `App.tsx`; any new colors are named
  entries in `colors.ts`.
- No file under `fengshui-shifu-api/` is modified.
- `npx tsc --noEmit` passes (baseline is currently clean) and
  `npm run build:web` completes. **Note:** the UI repo has no test runner and no
  linter — `package.json` defines only `start`, `android`, `ios`, `web`,
  `build:web` — and `build:web` bundles through Babel, which strips types without
  checking them. Neither command verifies any of the criteria above. Visual
  confirmation via `npm run web` is required.

## Resolved Decisions

All questions raised at spec time have been answered by the user. None remain open.

1. **Placement — full-width block below the grid.** The Ba Zhai card spans its
   own row beneath `resultGrid` rather than joining it as a fifth peer. As a
   peer it would inherit `flex: 1, minWidth: 200`, land on a one-row layout at
   roughly 220px on a wide viewport, stack its pills one per row, and — because
   flexbox stretches every card on a line to the tallest — drag Day Master and
   Day Branch to ~4× their natural height with dead space inside. Full width
   lets the four pills sit 2×2 and leaves the existing cards untouched.
2. **Green border and green pills.** Adds only a `greenBorder` style alongside
   the existing `goldBorder` / `redBorder`, reusing `colors.green` and
   `colors.greenBgLight`. No new palette entries. Green carries over the
   treatment the current direction pill already uses and reads as "directions",
   distinct from gold (BaZi pillars) and red (Kua).
3. **Kua card stays as is.** After the pill is removed it shows its tag, the
   number, and the group line. The group is a property of the Kua number that
   determines it, so it stays with the number rather than moving to the Ba Zhai
   card.
