# Feature Spec: pink-female-gender-button

## Repo(s) Touched
ui

## Summary
The selected Female button renders red, the same as Male, because both share the
`genderBtnActive` style. Give Female its own pink selected state — pink border
and pink translucent background — leaving Male as is.

## Requirements

- When `gender === 'female'`, the Female button's border and background are pink
  instead of red. Unselected appearance is unchanged.
- Male's selected state is unchanged (red), per Open Question 1.
- Add a Female-specific active style rather than editing `genderBtnActive`, which
  is applied to both buttons (`App.tsx:221`, `:227`). Editing it in place would
  turn Male pink too.
- New colors are named entries in `src/styles/colors.ts`, referenced from
  `appStyles.ts`. No inline hex in `App.tsx`, per `CLAUDE.md`.
- Two colors are needed, mirroring the existing `red` / `redBgLight` pair: a
  solid pink for the border and a translucent pink for the background.

## Non-Goals

- No change to the unselected button appearance, layout, spacing or labels.
- No change to `genderTextActive` — selected label text stays `textPrimary` for
  both buttons.
- No change to toggle behaviour. Clicking a selected button still clears the
  selection (`App.tsx:222`, `:228`).
- No functional change. Gender still drives the Kua calculation exactly as now;
  this is purely presentational.
- No pink anywhere else in the app — not the Calculate button, not the Kua card.

## Edge Cases

- **Neither selected** is the default on load, and both buttons must look
  unchanged in that state.
- **Toggling off** — clicking selected Female clears `gender` and the button
  must return to the neutral style with no pink residue.
- **Switching Male → Female** must swap red for pink cleanly, with only one
  button ever showing a selected state.
- **Contrast.** Pink sits on `bgDark` (`#0F172A`). Whatever pink is chosen must
  keep the `♀ Female` label readable — the label is `textPrimary` (`#F8FAFC`)
  when selected.

## Acceptance Criteria

- Selecting Female shows a pink border and pink-tinted background.
- Selecting Male still shows red — unchanged from today.
- Deselecting either returns it to the neutral grey-bordered style.
- No hex literals added to `App.tsx`; new colors live in `colors.ts`.
- `npx tsc --noEmit` passes and `npm run build:web` completes. Neither verifies
  appearance — the UI repo has no test runner or linter — so visual confirmation
  via `npm run web` is required.

## Resolved Decisions

All questions raised at spec time have been answered. None remain open.

1. **Male stays red.** Only the Female button changes. The asymmetry is
   intentional for now — revisit if red beside pink looks unbalanced in practice.
2. **Tailwind pink-500.** `#EC4899` for the border, `rgba(236, 72, 153, 0.2)` for
   the translucent background — mirroring the existing `red` / `redBgLight` pair
   and staying on the Tailwind scale the palette already follows.
3. **Named `pink` / `pinkBgLight`.** Consistent with the palette's existing
   convention of naming entries by colour (`red`, `green`, `gold`) rather than by
   role.
