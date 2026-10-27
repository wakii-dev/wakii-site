---
title: npm ecosystem
description: Three published packages — @wakii/ui-kit, create-wakii-app and create-wakii-stack — with install commands, versions and where to look next.
order: 19
---

Wakii ships its design system and scaffolding as **three public npm packages**.
Everything below is live on the registry and verified end-to-end.

## @wakii/ui-kit — 0.7.1

The React design system behind every Wakii surface: 113 antd-style components
for admin and dashboard work — Button (ripple + classNames slots), the full
Input family, Table, Tree, Form (InputOTP…), data display (Carousel, Avatar,
Timeline, Statistic…), feedback (Alert, Message, Notification), overlays —
plus heavy engines behind subpaths: **chart** (chart.js), **schedule**
(FullCalendar), **editor** (Tiptap) and **Experience3D** (three.js —
Scene3D / ShipModel / ScrollFlythrough).

- **Theming** — `UiKitProvider` dark/light + accent override through
  `data-bp-theme`; CSS tokens cascade across the whole tree.
- **Customization** — every component takes `classNames` slots and `style`
  passthrough, so overrides reach each part without wrapper components.
- **Graceful peer deps** — chart.js / swiper / tiptap / three / fullcalendar
  are optional: a missing engine falls back to a plain node, never a crash.
- **0.5.0 breaking** — Carousel moved to the `@wakii/ui-kit/carousel` subpath.

```bash
npm install @wakii/ui-kit
```

Browse every component live: [Storybook](https://storybook-static-khaki-two.vercel.app)
· [npm](https://www.npmjs.com/package/@wakii/ui-kit)

## create-wakii-app — 0.2.4

```bash
npm create wakii-app@latest my-app
```

CRA-style React starter with a preset per surface — demo (default), minimal,
product (TanStack Query + zod + MSW), admin, landing — and the demo preset
ships as vite, next (App Router) or astro (React island) variants.
TypeScript or JavaScript, react-router v7, demo routes for the extras
(chart / carousel / schedule / editor), a working dark toggle, dogfooding
`@wakii/ui-kit` ^0.7.1. Full non-interactive flags.

[npm](https://www.npmjs.com/package/create-wakii-app)

## create-wakii-stack — 0.1.11

```bash
npm create wakii-stack@latest my-stack
```

Scaffolds the whole Wakii architecture: pick services from the manifest
(Postgres, Kafka KRaft, auth-svc JWT, nginx gateway, node-svc / spring-svc /
go-svc, MF shell + tasks & activity remotes, admin) and the CLI prunes
compose, lockfile and workspace to match — `docker compose up` boots the
stack behind a single gateway entry (`:8080`; the generated README carries
the warning). The tarball is chmod-safe. Recent cuts harden kafka-init
against topic-creation races, and the generated README lists the seeded
demo accounts. Verified end-to-end from the real
registry: register/login JWT, tasks CRUD, activity feed over Kafka.

[npm](https://www.npmjs.com/package/create-wakii-stack)
