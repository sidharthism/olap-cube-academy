# Route Map

## Routing system

The project uses Vinext with Next.js App Router file conventions.

## Routes

### /

- Entry: app/page.tsx
- Layout: app/layout.tsx
- Current content: generated loading placeholder with a three-column skeleton and centered “Building your site” status card.
- Product target: The Decision Room mission overview and chapter learning shell.

No router configuration file exists. There are no other route files in the generated starter.

## Planned static-safe navigation

The product brief requires browser-hash locations such as /#/home and /#/chapter/1 through /#/chapter/17 so a basic static host can refresh directly into the selected chapter without server-side route rewrites.
