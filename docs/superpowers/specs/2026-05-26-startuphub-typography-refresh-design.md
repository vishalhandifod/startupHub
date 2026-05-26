# StartupHub Typography Refresh Design

## Goal

Replace the current `Syne + DM Sans` pairing with a cleaner, more modern, more professional typography system across the frontend UI.

## Chosen Direction

- Use `Manrope` for headings, titles, prominent labels, and branded emphasis.
- Use `Inter` for body copy, navigation, form controls, and supporting UI text.

This keeps strong visual hierarchy while improving readability and making the product feel more polished and professional.

## Scope

Update the frontend font setup in the places that currently hardcode `Syne` and `DM Sans`:

- `frontend/index.html`
- `frontend/src/index.css`
- `frontend/src/components/layout/MainLayout.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/RegisterPage.jsx`
- `frontend/src/pages/FeedPage.jsx`
- `frontend/src/pages/DiscoverPage.jsx`

## Implementation Notes

- Replace Google Fonts imports with `Inter` and `Manrope`.
- Keep `font-display` mapped to the heading font.
- Keep `font-sans` mapped to the body font.
- Replace inline `font-family` references so they use the new pair consistently.
- Preserve the existing spacing, weights, and sizing unless the new fonts expose a clear visual issue.

## Expected Outcome

- The app should feel cleaner and more professional immediately.
- Forms, navigation, and dense content should become easier to read.
- Headings should retain hierarchy without the overly stylized look of `Syne`.

## Risks

- Inline styles may still contain old font references if not updated systematically.
- Slight visual shifts in letter width may affect a few tight layouts, especially auth pages and sidebar labels.

## Verification

- Run targeted lint on edited frontend files.
- Run a frontend production build.
- Manually confirm no old `Syne` or `DM Sans` references remain in the updated scope.
