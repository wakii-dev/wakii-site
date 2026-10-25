---
title: Hệ sinh thái npm
description: Ba package đã publish — @wakii/ui-kit, create-wakii-app và create-wakii-stack — kèm lệnh cài, phiên bản và chỗ xem tiếp.
order: 19
---

Wakii đóng gói design system và bộ scaffold thành **ba package npm công
khai**. Mọi thứ dưới đây đã live trên registry và được verify end-to-end.

## @wakii/ui-kit — 0.5.0

Design system React đứng sau mọi mặt của Wakii: hơn 60 component kiểu antd
cho công việc admin/dashboard — Button (ripple + classNames slots), cả họ
Input, Table, Tree, Form (InputOTP…), data display (Carousel, Avatar,
Timeline, Statistic…), feedback (Alert, Message, Notification), overlay —
kèm các engine nặng sau subpath: **chart** (chart.js), **schedule**
(FullCalendar), **editor** (Tiptap) và **Experience3D** (three.js —
Scene3D / ShipModel / ScrollFlythrough).

- **Theming** — `UiKitProvider` dark/light + override accent qua
  `data-bp-theme`; CSS tokens cascade toàn cây.
- **Peer deps giảm nội bộ** — chart.js / swiper / tiptap / three /
  fullcalendar đều optional: thiếu engine thì fallback về node thường,
  không bao giờ crash.
- **0.5.0 breaking** — Carousel chuyển sang subpath `@wakii/ui-kit/carousel`.

```bash
npm install @wakii/ui-kit
```

Xem mọi component sống động: [Storybook](https://storybook-static-khaki-two.vercel.app)
· [npm](https://www.npmjs.com/package/@wakii/ui-kit)

## create-wakii-app — 0.1.2

```bash
npm create wakii-app@latest my-app
```

Starter React kiểu CRA: TypeScript hoặc JavaScript, react-router v7, demo
route cho extras (chart / carousel / schedule / editor), dark toggle chạy
thật, dogfood `@wakii/ui-kit` ^0.5.0. Đầy đủ flag non-interactive.

[npm](https://www.npmjs.com/package/create-wakii-app)

## create-wakii-stack — 0.1.5

```bash
npm create wakii-stack@latest my-stack
```

Scaffold trọn vẹn kiến trúc Wakii: chọn services qua manifest (Postgres,
Kafka KRaft, auth-svc JWT, gateway nginx, node-svc / spring-svc / go-svc,
MF shell + remote tasks & activity, admin) và CLI prune compose, lockfile,
workspace theo đúng lựa chọn — `docker compose up` là stack chạy ngay sau
cửa vào duy nhất gateway (`:8080`; README sinh kèm cảnh báo). Tarball
chmod-safe. Đã verify end-to-end từ registry thật: register/login JWT,
tasks CRUD, activity feed qua Kafka.

[npm](https://www.npmjs.com/package/create-wakii-stack)
