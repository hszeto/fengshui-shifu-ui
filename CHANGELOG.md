# Changelog

All notable changes to `fengshui-shifu-ui` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This file starts with the Ba Zhai directions card — changes before that point
live only in the git history and have not been backfilled.

## [1.1.1] - 2026-08-29

### Changed

- The selected **Female** gender button is now pink (`#EC4899`) instead of red.
  Both buttons previously shared one selected style, so Female was
  indistinguishable from Male. Male is unchanged.

## [1.1.0] - 2026-08-29

### Added

- **Ba Zhai directions card.** Shows all four auspicious directions — Sheng Qi
  (Wealth & Success), Tian Yi (Health & Support), Yan Nian (Relationships) and
  Fu Wei (Personal Growth) — each with its compass direction spelled out beside
  a north-up arrow icon. Renders full width below the results grid, and only
  when a gender has been supplied.
- `src/constants/kuaDirections.ts` — compass abbreviation to label/icon lookup
  for all eight points, the ordered list of auspicious directions, and a
  fallback for unrecognized values.

### Changed

- `kua_number` and `kua_profile` are now typed nullable in
  `src/services/api.ts`, matching the API, which omits the Kua entirely when
  gender is absent.

### Removed

- The single "Top Wealth Direction" pill on the Kua card, superseded by the Ba
  Zhai card. Three of the four directions were previously fetched from the API
  and discarded.
