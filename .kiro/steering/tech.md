# Tech Stack

## Runtime & Framework
- **Electron 39** — desktop shell; main process runs Node.js, renderer runs Chromium
- **React 19** + **TypeScript 5** (strict mode)
- **sing-box** — bundled proxy core binary (platform-specific, in `resources/`)

## Renderer
- **Vite 7** — dev server (port 5173) and production bundler
- **Tailwind CSS 3.4** + **shadcn/ui** (Radix UI primitives) — styling and component library
- **Zustand 4** — global state (`src/renderer/store/app-store.ts`)
- **react-hook-form** + **zod** — form handling and validation
- **i18next** + **react-i18next** — internationalization (zh-CN primary, en secondary)
- **sonner** — toast notifications
- **lucide-react** — icons

## Main Process
- TypeScript compiled to CommonJS via `tsc` (`tsconfig.main.json`)
- Node.js built-ins only — no bundler for main process

## Testing
- **Jest 30** + **ts-jest** — unit tests
- **fast-check** — property-based testing
- Test files: `*.test.ts` / `*.test.tsx`

## Code Quality
- **ESLint 9** with `@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-prettier`
- **Prettier** — formatting (enforced via husky pre-commit + lint-staged)
- npm registry: `npmmirror.com` (configured in `.npmrc`)

## Package Manager
- **npm** (uses `package-lock.json`)

---

## Common Commands

```bash
# Development
npm run dev              # Start full Electron app in dev mode (main + renderer)
npm run dev:renderer     # Vite dev server only (port 5173)

# Build
npm run build            # Compile main (tsc) + renderer (vite)
npm run build:main       # Main process only: tsc -p tsconfig.main.json → dist/main/
npm run build:renderer   # Renderer only: vite build → dist/renderer/

# Package
npm run package:mac      # Build + electron-builder for macOS → dist-package/mac/
npm run package:win      # Build + electron-builder for Windows
npm run package:linux    # Build + electron-builder for Linux (x64)

# Quality
npm run lint             # ESLint (src/**/*.ts, *.tsx)
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier write
npm run test             # Jest single pass (--passWithNoTests)
npm run test:watch       # Jest watch mode
npm run test:coverage    # Jest with coverage
```

## macOS Post-Package Steps
```bash
# Ad-hoc sign (required without Apple Developer cert)
codesign --force --deep --sign - dist-package/mac/FlowZ.app

# Create DMG (update version number to match package.json)
hdiutil create -volname "FlowZ-<version>" \
  -srcfolder dist-package/mac/FlowZ.app \
  -ov -format UDZO \
  dist-package/FlowZ-<version>-mac-x64.dmg
```

## TypeScript Configuration
Two separate tsconfigs for the two compile targets:
- `tsconfig.main.json` — main process: CommonJS, `moduleResolution: node`, emits to `dist/main/`
- `tsconfig.renderer.json` — renderer: ESNext, `moduleResolution: bundler`, no emit (Vite handles it)
- `tsconfig.json` — base config with shared strict settings and path aliases

## Path Aliases (Vite + tsconfig)
| Alias | Resolves to |
|---|---|
| `@/*` | `src/renderer/*` |
| `@shared/*` | `src/shared/*` |
| `@components/*` | `src/renderer/components/*` |
| `@lib/*` | `src/renderer/lib/*` |
| `@hooks/*` | `src/renderer/hooks/*` |
| `@store/*` | `src/renderer/store/*` |
| `@pages/*` | `src/renderer/pages/*` |
| `@bridge/*` | `src/renderer/bridge/*` |
