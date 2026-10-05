# ADR-0002: Home district ("where I'm from") shown on share card and wall map

**Status:** accepted

## Context

Neither the share card (`src/lib/share.ts`) nor the wall map (`src/lib/wallMap.ts`) can show
where a traveler is from. The data model has no such field: `State` in `src/lib/store.ts`
holds `user`, `districtMarks`, `mapTheme` etc., and `ShareData` (the shape used by both
renderers, the `/u/[handle]` public profile, the `/api/profile` publish endpoint and the
`encodeShare`/`decodeShare` URL format) carries only visited/want/fav district lists.

## Decision

Add one optional field, a district slug, representing the traveler's home/birth district.

- `State.homeDistrict: string | null` in `src/lib/store.ts`, persisted in the existing
  `ghuri:v1` localStorage blob (missing value reads as `null`; no migration needed).
- `ShareData.home?: string`. `sanitize()` in `src/lib/profileStore.ts` accepts it only if it
  is a known district slug. `encodeShare`/`decodeShare` carry it as an optional `h` query
  parameter; links without it keep working.
- UI: a "My home district" selector on the My Bangladesh page (`MyMapView`), beside the
  colour picker.
- Rendering: a home marker (house/pin icon) at the district's centroid plus a "Home"
  legend entry on both the share card and the wall map. The district keeps its normal
  visited/want/favorite fill.

## Consequences

- Changes the persisted state shape and the public profile/share contract (additive and
  optional, so existing profiles and links stay valid).
- The published profile gains one more piece of personal information, a home district.
  The share dialog's privacy note ("name, bio, map, visited places and tried foods") must
  be updated to mention it.
- Both renderers need label/marker collision handling around the new icon.
- Privacy: the home district is optional and only included when the user sets it; the
  share dialog note says so.
