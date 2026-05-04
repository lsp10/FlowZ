# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

FlowZ is a cross-platform proxy client desktop app built on sing-box core. Electron main process + React renderer. Supports NaiveProxy, VLESS, VMess, Trojan, Shadowsocks, Hysteria2, Anytls, TUIC, and Shadows-tls protocols.

## Commands

```bash
# Development
npm run dev              # Start Electron app in dev mode (main + renderer concurrently)
npm run dev:renderer     # Vite dev server only (port 5173)
npm run dev:main         # Build main process in watch mode

# Build
npm run build            # Build both main (tsc) and renderer (vite)
npm run build:main       # TypeScript compile main process only
npm run build:renderer   # Vite build renderer only
npm run package          # electron-builder package (after build)

# Quality
npm run lint             # ESLint across the project
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier format all files
npm run format:check     # Prettier check without writing
npm run typecheck        # TypeScript check both main and renderer
npm run test             # Vitest run (single pass)
npm run test:watch       # Vitest in watch mode
npm run test:coverage    # Vitest with coverage
```

## Architecture

**Three process boundaries:**
- `src/main/` — Electron main process (Node.js). Manages sing-box child process, system proxy, tray, config persistence, subscriptions, updates.
- `src/renderer/` — React 19 frontend served by Vite. UI components, state, pages.
- `src/shared/` — Types and IPC channel definitions shared between both.

**Main process structure:**
- `services/` — Core business logic: `ProxyManager` (sing-box lifecycle + config generation), `ConfigManager` (JSON config load/save), `SystemProxyManager` (OS proxy settings), `TrayManager`, `SubscriptionService`, `SpeedTestService`, `UpdateService`, `CoreUpdateService`.
- `ipc/handlers/` — Domain-specific IPC handlers (proxy, config, subscription, rules, speed-test, update, backup, log). Registered centrally in `ipc-handler.ts`.
- `config/sing-box/` — sing-box JSON config template builders per protocol.

**Renderer structure:**
- `pages/` — View components: Home, Proxies, Rules, Subscriptions, SpeedTest, Logs, Settings, About.
- `components/` — Reusable UI (shadcn/ui based, in `components/ui/`).
- `store/` — Zustand stores: `proxyStore`, `configStore`, `subscriptionStore`, `rulesStore`, `logStore`.
- `bridge/` — `electronBridge.ts` wraps `window.electron` IPC calls with a typed API.
- `lib/i18n/` — i18next with zh-CN (default) and en-US locales.

**IPC pattern:** All channel names live in `src/shared/ipc-channels.ts` as a single const object. The preload script (`src/main/preload.ts`) exposes `invoke`/`on`/`send` via contextBridge. Renderer code calls through `electronBridge.ts`, never directly through `window.electron`.

**sing-box integration:** Platform-specific binaries bundled in `resources/`. `ProxyManager` spawns sing-box as a child process and generates its JSON config from user settings. The `ui/` directory contains a pre-built yacd dashboard (not part of the build pipeline).

## Key Conventions

- **Path aliases**: `@/` → `src/renderer/`, `@shared/` → `src/shared/`, plus `@components/`, `@lib/`, `@hooks/`, `@store/`, `@pages/`, `@bridge/`. Configured in both tsconfig and vite.
- **Styling**: Tailwind CSS 3.4 + shadcn/ui component library (Radix primitives). Dark mode via CSS class. Color tokens use CSS custom properties.
- **State**: Zustand stores, no Redux. Each domain has its own store file.
- **Forms**: react-hook-form + zod validation.
- **Platform handling**: CSS class `platform-${platform}` on document root. macOS gets traffic light spacers in sidebar layout.
- **i18n**: All user-facing strings go through i18next. Chinese (zh-CN) is the primary locale.
- **TypeScript**: Strict mode. Separate tsconfig for main (`tsconfig.main.json`, CommonJS target) and renderer (`tsconfig.renderer.json`, bundler resolution).
- **Testing**: Vitest. Test files use `.test.ts` / `.test.tsx` suffix.
- **npm registry**: Uses npmmirror.com (configured in `.npmrc`).
