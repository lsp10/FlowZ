# Project Structure

## Top-Level Layout

```
src/
  main/       — Electron main process (Node.js / CommonJS)
  renderer/   — React frontend (Vite / ESNext)
  shared/     — Types and constants shared between both processes
resources/    — Platform-specific sing-box binaries and bundled rule sets
scripts/      — Build and release helper scripts
build/        — Electron Builder icon assets
dist/         — Compiled output (gitignored)
dist-package/ — Packaged app output (gitignored)
```

---

## `src/main/` — Main Process

```
index.ts                  — App entry: window creation, lifecycle, IPC wiring, tray, 1s debounced CONFIG_CHANGED → proxy restart
preload.ts                — Context bridge: exposes window.electronAPI to renderer

services/
  ProxyManager.ts         — Core: spawns sing-box, generates full JSON config, manages TUN/system proxy
  ConfigManager.ts        — Reads/writes config.json in userData dir; in-memory cache with clearCache()
  LogManager.ts           — Centralized logging with EventEmitter
  SystemProxyManager.ts   — Sets/clears OS-level HTTP/SOCKS proxy settings
  SubscriptionService.ts  — Fetches and parses subscription URLs
  AutoStartManager.ts     — OS autostart registration
  AdminPrivilege.ts       — macOS osascript sudo elevation
  TrayManager.ts          — System tray icon and menu
  ResourceManager.ts      — Locates bundled sing-box binary and rule set files
  SpeedTestService.ts     — Per-server latency testing

ipc/
  handlers/               — Domain-split IPC handlers (one file per domain)
    config-handlers.ts    — CONFIG_GET, CONFIG_SAVE, CONFIG_SET_VALUE, etc.
    proxy-handlers.ts     — PROXY_START, PROXY_STOP, PROXY_GET_STATUS
    server-handlers.ts    — SERVER_ADD, SERVER_UPDATE, SERVER_DELETE, SERVER_SWITCH
    rules-handlers.ts     — RULES_GET_ALL, RULES_ADD, RULES_UPDATE, RULES_DELETE
    subscription-handlers.ts
    backup-handlers.ts
    log-handlers.ts
    speed-test-handlers.ts
    autostart-handlers.ts
    version-handlers.ts
    admin-handlers.ts
  ipc-events.ts           — IPC channel constants (mirrors src/shared/ipc-channels.ts usage)
  main-events.ts          — Internal EventEmitter: CONFIG_CHANGED, PROXY_STARTED, PROXY_STOPPED
  ipc-handler.ts          — Handler registration helper
  index.ts                — Registers all handlers

utils/
  paths.ts                — getConfigPath(), getLogPath(), resource path helpers
  memory-monitor.ts       — Periodic heap sampling; triggers GC when thresholds exceeded
  retry.ts                — Generic async retry utility
```

**Key pattern:** Every IPC handler that mutates config calls `emit('CONFIG_CHANGED')` on the main EventEmitter. `index.ts` listens with a 1-second debounce and calls `ProxyManager.needsRestart(newConfig)` — only routing-relevant field changes trigger a sing-box restart.

---

## `src/renderer/` — Renderer Process

```
main.tsx                  — React entry point
App.tsx                   — Root component: routing between pages, event listener setup
index.html                — Vite HTML entry
index.css                 — Global styles (Tailwind base)

pages/
  home-page.tsx           — Connection status, proxy toggle, mode selector
  server-page.tsx         — Server list and management
  rules-page.tsx          — Custom routing rules
  app-policy-page.tsx     — App-level routing (application split tunneling)
  settings-page.tsx       — All settings tabs

components/
  home/                   — Home page sub-components (status card, topology, logs, mode selector)
  rules/                  — Rule dialog, delete dialog, route/app rule cards
  settings/               — Per-protocol server forms + all settings sections
  layout/                 — Shell layout (sidebar, nav)
  ui/                     — shadcn/ui primitives (button, dialog, select, etc.)
  error-boundary.tsx
  theme-provider.tsx

store/
  app-store.ts            — Single Zustand store; all async actions call IPC via api.*
                            Uses deep equality checks to avoid unnecessary re-renders

ipc/
  api-client.ts           — Typed wrappers around window.electronAPI.invoke()
  ipc-client.ts           — Low-level IPC invoke helper
  index.ts                — Exports unified `api` object

bridge/
  api-wrapper.ts          — Maps api.* calls to IPC channel strings
  types.ts                — Re-exports shared types + renderer-only connection types
  index.ts

hooks/
  use-native-events.ts    — Subscribes to main→renderer push events (proxy started/stopped, etc.)

i18n/
  index.ts                — i18next init
  locales/                — zh.json (primary), en.json

lib/
  utils.ts                — cn() (clsx + tailwind-merge)
  error-handler.ts
```

---

## `src/shared/` — Shared Between Processes

```
types.ts              — All TypeScript interfaces: UserConfig, ServerConfig, DomainRule,
                        ProxyStatus, TrafficStats, LogEntry, AppRule, CustomAppPreset, etc.
ipc-channels.ts       — IPC_CHANNELS constant object (single source of truth for channel names)
app-rules-preset.ts   — Built-in app routing presets (YouTube, Netflix, Telegram, etc.)
                        Each preset has: id, name, emoji, geositeTags, geoipTags?, processNames?
```

---

## `resources/` — Bundled Binaries

```
mac-arm64/sing-box    — macOS Apple Silicon binary
mac-x64/sing-box      — macOS Intel binary
win/sing-box.exe      — Windows binary
linux/sing-box        — Linux binary
data/
  geoip-cn.srs
  geosite-cn.srs
  geosite-geolocation-!cn.srs
```

Electron Builder copies the correct platform binary into the app package at build time (configured in `electron-builder.json`).

---

## Key Conventions

- **Language**: Chinese for log messages, UI strings, and code comments. English for identifiers, IPC channel names, and git commits.
- **IPC**: Always use constants from `IPC_CHANNELS` in `src/shared/ipc-channels.ts` — never hardcode channel strings.
- **Types**: Define all cross-process types in `src/shared/types.ts`. Never duplicate type definitions between main and renderer.
- **State**: All renderer state lives in the single Zustand store. Components read from the store; async operations go through store actions which call `api.*`.
- **Config persistence**: Use `ConfigManager.set()` or `saveConfig()` in main process handlers. Never write config files directly from the renderer.
- **Styling**: Use `cn()` from `@lib/utils` to merge Tailwind classes. Follow shadcn/ui patterns for new UI components.
- **Forms**: Use `react-hook-form` + `zod` schema validation for all forms. See existing protocol forms in `src/renderer/components/settings/` for reference.
- **New IPC handlers**: Add the channel to `IPC_CHANNELS`, create a handler in `src/main/ipc/handlers/`, register it in `src/main/ipc/index.ts`, and add a typed wrapper in `src/renderer/ipc/api-client.ts`.
