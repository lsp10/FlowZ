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

# Package (run build first)
npm run package:mac      # electron-builder for macOS
npm run package:win      # electron-builder for Windows
npm run package:linux    # electron-builder for Linux

# Quality
npm run lint             # ESLint across the project
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier format all files
npm run test             # Jest run (single pass)
npm run test:watch       # Jest in watch mode
```

After `package:mac`, ad-hoc sign and create DMG:
```bash
codesign --force --deep --sign - dist-package/mac/FlowZ.app
hdiutil create -volname "FlowZ-<ver>" -srcfolder dist-package/mac/FlowZ.app -ov -format UDZO dist-package/FlowZ-<ver>-mac-x64.dmg
```

## Architecture

**Three process boundaries:**
- `src/main/` — Electron main process (Node.js). Manages sing-box child process, system proxy, tray, config persistence, subscriptions, updates.
- `src/renderer/` — React 19 frontend served by Vite. UI components, state, pages.
- `src/preload/` — Context bridge exposing typed IPC API as `window.electronAPI`.
- `src/shared/` — Types and IPC channel definitions shared between both.

**Main process structure:**
- `index.ts` — App lifecycle, window creation, IPC event wiring, tray management. Listens to `CONFIG_CHANGED` events with 1s debounce and smart restart (only restarts proxy when routing-affecting fields change).
- `services/ProxyManager.ts` — Core service: spawns sing-box, generates full JSON config, manages TUN/system proxy modes. On macOS TUN, uses `osascript` for sudo elevation. `restartSingBoxWithSudo()` combines kill+start in one osascript call. `needsRestart(newConfig)` compares routing-relevant fields to skip unnecessary restarts.
- `services/ConfigManager.ts` — Reads/writes `config.json` in user data directory.
- `services/LogManager.ts` — Centralized logging with EventEmitter.
- `ipc/handlers/` — Domain-specific IPC handlers (config, rules, proxy, subscription, backup, etc.). Each handler emits `CONFIG_CHANGED` on the main EventEmitter after saving.
- `ipc/main-events.ts` — Internal EventEmitter with `CONFIG_CHANGED`, `PROXY_STARTED`, `PROXY_STOPPED`.

**Renderer structure:**
- `pages/` — View components: Home, Rules, Server, Settings, Logs, About.
- `components/` — Organized by page/feature. UI primitives in `components/ui/` (shadcn/ui).
- `store/app-store.ts` — Zustand store for app state.
- `locales/` — i18next with zh (Chinese) and en (English).

**IPC flow:** Renderer → `window.electronAPI.invoke(channel, args)` → preload `ipcRenderer.invoke` → main handler in `ipc/handlers/` → saves config → emits `CONFIG_CHANGED` → debounced restart if routing config changed.

**sing-box config generation:** `ProxyManager.generateSingBoxConfig()` builds the full sing-box JSON from `UserConfig` including inbounds, outbounds, route rules, rule sets, and DNS. Remote rule sets use `fastly.jsdelivr.net` CDN. GeoIP tags are filtered to valid ISO 2-letter country codes only.

## Key Conventions

- **Path aliases**: `@/` → `src/renderer/`, `@shared/` → `src/shared/`, plus `@components/`, `@lib/`, `@hooks/`, `@store/`, `@pages/`, `@bridge/`. Configured in both tsconfig and vite.
- **Styling**: Tailwind CSS 3.4 + shadcn/ui component library (Radix primitives). Dark mode via CSS class.
- **State**: Zustand store, no Redux.
- **Forms**: react-hook-form + zod validation.
- **i18n**: All user-facing strings go through i18next. Chinese (zh-CN) is the primary locale.
- **TypeScript**: Strict mode. Separate tsconfig for main (`tsconfig.main.json`, CommonJS) and renderer (`tsconfig.renderer.json`, bundler resolution).
- **Testing**: Jest + ts-jest. Test files use `.test.ts` / `.test.tsx` suffix.
- **npm registry**: Uses npmmirror.com (configured in `.npmrc`).
- **Log/comment language**: Chinese for log messages, comments, and UI strings. English for code identifiers and git commits.

## Platform Resources

Platform-specific sing-box binaries in `resources/`:
- `resources/mac-x64/`, `resources/mac-arm64/` — macOS
- `resources/win/` — Windows
- `resources/linux/` — Linux
- `resources/data/` — Bundled rule set files (geoip-cn.srs, geosite-cn.srs, etc.)

## App Presets

`src/shared/app-rules-preset.ts` defines built-in app routing presets (Google, YouTube, Twitter, etc.) with `geositeTags`, `processNames`, and optional `geoipTags`. The `geoipTags` field only supports valid ISO country codes — sing-geoip has no app-level rule sets.
