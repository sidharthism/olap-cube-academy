# Theme Context

## Part 1 — Compact token summary

### Current starter tokens

- Background: #ffffff
- Foreground: #171717
- Dark background: #0a0a0a
- Dark foreground: #ededed
- Sans font: Geist Sans via --font-geist-sans
- Monospace font: Geist Mono via --font-geist-mono
- Spacing, radius, shadow, and breakpoints: Tailwind CSS 4 defaults; no project-specific extensions

### CSS approach

- Tailwind CSS 4 imported from app/globals.css
- Tailwind utility classes appear directly in app/page.tsx
- No CSS Modules, CSS-in-JS, or component library theme

## Part 2 — Raw source

### app/globals.css

~~~css
@import 'tailwindcss';

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
}
~~~

There is no Tailwind configuration file or separate theme provider.
