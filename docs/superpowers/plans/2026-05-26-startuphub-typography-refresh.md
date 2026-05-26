# StartupHub Typography Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `Syne + DM Sans` pairing with a cleaner `Manrope + Inter` typography system across the frontend.

**Architecture:** Centralize the new font pair at the app entry points, then update page-level inline styles and local style objects that currently hardcode the old fonts. Keep hierarchy unchanged by mapping heading roles to `Manrope` and body/UI text to `Inter`.

**Tech Stack:** React, Vite, Tailwind CSS, Google Fonts, inline JSX style objects

---

### Task 1: Replace Global Font Imports

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/src/components/layout/MainLayout.jsx`
- Test: `frontend/index.html`, `frontend/src/components/layout/MainLayout.jsx`

- [ ] **Step 1: Write the failing check**

Use search to prove the old font imports still exist:

```bash
rg -n "Syne|DM\\+Sans|DM Sans" frontend/index.html frontend/src/components/layout/MainLayout.jsx
```

- [ ] **Step 2: Run the check to verify current failure state**

Run:

```bash
rg -n "Syne|DM\\+Sans|DM Sans" frontend/index.html frontend/src/components/layout/MainLayout.jsx
```

Expected: matches in both files showing the old Google Fonts URL and hardcoded font-family strings.

- [ ] **Step 3: Apply the minimal implementation**

Update the global font source from:

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap" rel="stylesheet" />
```

to:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />
```

Update the layout inline import from:

```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
```

to:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap');
```

Then replace font-family references in `MainLayout.jsx`:

```css
font-family: 'DM Sans', sans-serif;
```

with:

```css
font-family: 'Inter', sans-serif;
```

and:

```css
font-family: 'Syne', sans-serif;
```

with:

```css
font-family: 'Manrope', sans-serif;
```

- [ ] **Step 4: Run the verification check**

Run:

```bash
rg -n "Syne|DM\\+Sans|DM Sans" frontend/index.html frontend/src/components/layout/MainLayout.jsx
```

Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add frontend/index.html frontend/src/components/layout/MainLayout.jsx
git commit -m "style: refresh global typography imports"
```

### Task 2: Update Global Typography Defaults

**Files:**
- Modify: `frontend/src/index.css`
- Test: `frontend/src/index.css`

- [ ] **Step 1: Write the failing check**

```bash
rg -n "font-display|font-sans|DM Sans|Syne" frontend/src/index.css
```

- [ ] **Step 2: Run the check to verify current state**

Run:

```bash
rg -n "font-display|font-sans|DM Sans|Syne" frontend/src/index.css
```

Expected: `font-display`/`font-sans` utility usage with no explicit mapping to the new fonts yet.

- [ ] **Step 3: Write the minimal implementation**

Extend the base layer so the document defines the intended families explicitly:

```css
:root {
  --font-sans: 'Inter', sans-serif;
  --font-display: 'Manrope', sans-serif;
}
```

Then update the base typography declarations:

```css
body {
  @apply min-h-screen bg-[rgb(var(--bg))] font-sans text-[rgb(var(--text))] antialiased;
  font-family: var(--font-sans);
}

button,
input,
textarea,
select {
  @apply font-sans;
  font-family: var(--font-sans);
}
```

And reinforce heading display usage:

```css
.page-title {
  @apply font-display text-3xl font-extrabold tracking-tight md:text-4xl;
  font-family: var(--font-display);
}
```

- [ ] **Step 4: Run the verification check**

Run:

```bash
sed -n '1,140p' frontend/src/index.css
```

Expected: `--font-sans` is `Inter`, `--font-display` is `Manrope`, and body/form controls reference the new variables.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/index.css
git commit -m "style: set global font variables"
```

### Task 3: Replace Auth Page Font References

**Files:**
- Modify: `frontend/src/pages/LoginPage.jsx`
- Modify: `frontend/src/pages/RegisterPage.jsx`
- Test: `frontend/src/pages/LoginPage.jsx`
- Test: `frontend/src/pages/RegisterPage.jsx`

- [ ] **Step 1: Write the failing check**

```bash
rg -n "Syne|DM Sans|DM\\+Sans" frontend/src/pages/LoginPage.jsx frontend/src/pages/RegisterPage.jsx
```

- [ ] **Step 2: Run the check to verify current failure state**

Run:

```bash
rg -n "Syne|DM Sans|DM\\+Sans" frontend/src/pages/LoginPage.jsx frontend/src/pages/RegisterPage.jsx
```

Expected: matches in both files for `@import` URLs and inline font-family strings.

- [ ] **Step 3: Write the minimal implementation**

In both files:

- replace the `@import` URL with the `Inter + Manrope` URL
- replace all body/supporting text references from:

```css
font-family: 'DM Sans', sans-serif;
```

to:

```css
font-family: 'Inter', sans-serif;
```

- replace all heading/wordmark/button emphasis references from:

```css
font-family: 'Syne', sans-serif;
```

to:

```css
font-family: 'Manrope', sans-serif;
```

- [ ] **Step 4: Run the verification check**

Run:

```bash
rg -n "Syne|DM Sans|DM\\+Sans" frontend/src/pages/LoginPage.jsx frontend/src/pages/RegisterPage.jsx
```

Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/LoginPage.jsx frontend/src/pages/RegisterPage.jsx
git commit -m "style: update auth pages typography"
```

### Task 4: Replace App Page Font References

**Files:**
- Modify: `frontend/src/pages/FeedPage.jsx`
- Modify: `frontend/src/pages/DiscoverPage.jsx`
- Test: `frontend/src/pages/FeedPage.jsx`
- Test: `frontend/src/pages/DiscoverPage.jsx`

- [ ] **Step 1: Write the failing check**

```bash
rg -n "Syne|DM Sans" frontend/src/pages/FeedPage.jsx frontend/src/pages/DiscoverPage.jsx
```

- [ ] **Step 2: Run the check to verify current failure state**

Run:

```bash
rg -n "Syne|DM Sans" frontend/src/pages/FeedPage.jsx frontend/src/pages/DiscoverPage.jsx
```

Expected: multiple matches in the local style objects.

- [ ] **Step 3: Write the minimal implementation**

Replace style-object font families:

```js
fontFamily: "'DM Sans', sans-serif"
```

with:

```js
fontFamily: "'Inter', sans-serif"
```

and:

```js
fontFamily: "'Syne', sans-serif"
```

with:

```js
fontFamily: "'Manrope', sans-serif"
```

Keep the same sizes, weights, and spacing values.

- [ ] **Step 4: Run the verification check**

Run:

```bash
rg -n "Syne|DM Sans" frontend/src/pages/FeedPage.jsx frontend/src/pages/DiscoverPage.jsx
```

Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/FeedPage.jsx frontend/src/pages/DiscoverPage.jsx
git commit -m "style: update feed and discover typography"
```

### Task 5: Verify Typography Refresh End-to-End

**Files:**
- Test: `frontend/index.html`
- Test: `frontend/src/index.css`
- Test: `frontend/src/components/layout/MainLayout.jsx`
- Test: `frontend/src/pages/LoginPage.jsx`
- Test: `frontend/src/pages/RegisterPage.jsx`
- Test: `frontend/src/pages/FeedPage.jsx`
- Test: `frontend/src/pages/DiscoverPage.jsx`

- [ ] **Step 1: Run a final old-font scan**

Run:

```bash
rg -n "Syne|DM Sans|DM\\+Sans" frontend/index.html frontend/src/index.css frontend/src/components/layout/MainLayout.jsx frontend/src/pages/LoginPage.jsx frontend/src/pages/RegisterPage.jsx frontend/src/pages/FeedPage.jsx frontend/src/pages/DiscoverPage.jsx
```

Expected: no matches.

- [ ] **Step 2: Run targeted lint**

Run:

```bash
cd frontend && npx eslint src/components/layout/MainLayout.jsx src/pages/LoginPage.jsx src/pages/RegisterPage.jsx src/pages/FeedPage.jsx src/pages/DiscoverPage.jsx src/index.css
```

Expected: exit code `0`.

- [ ] **Step 3: Run the frontend build**

Run:

```bash
cd frontend && npm run build
```

Expected: Vite build completes successfully with exit code `0`.

- [ ] **Step 4: Commit**

```bash
git add frontend/index.html frontend/src/index.css frontend/src/components/layout/MainLayout.jsx frontend/src/pages/LoginPage.jsx frontend/src/pages/RegisterPage.jsx frontend/src/pages/FeedPage.jsx frontend/src/pages/DiscoverPage.jsx
git commit -m "style: refresh app typography"
```
