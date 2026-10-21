# SimSim public site

Angular 21 (standalone components, signals) + Tailwind 4: the public marketplace where visitors
browse listings by category. Build output: `dist/sim-sim-client`. Backend: `new-backend` repo;
agent/admin panel: `sim-sim-realtor`.

## Workflow — read first
- Work on a personal branch (e.g. `batyr/dev`) and open a PR into `main`.
- CI on PR/`main` runs `npm ci` + `npm run build -- --configuration=production`.
- **Deploy happens only on a `v*` tag** (`.github/workflows/main.yml`); pushes to `main` only build.

## Run
```bash
npm ci
npm start                                   # http://localhost:4200
npx ng build --configuration development    # quick compile check
```
`src/app/environments/environment.ts` points to the backend at `http://localhost:8080` and media at
`http://localhost:9000`. If you change it for local testing, revert it before committing.

## Structure
- Every category in `shared/constants/categories.ts` gets a route (`/<slug>`) rendered by
  `pages/category/category.ts`, which switches filter and grid by slug:
  - `real-estate` → `components/filter` + `components/ad-grid` (property cards, view-property modal);
  - `cars` → `components/car-filter` + `components/car-grid` (car cards, `view-car` modal);
  - other slugs → `generic-filter`, shown as "coming soon" until `available` is true.
- Listing data comes only from the public `GET .../filter` endpoints, which return live (`ACTIVE`)
  listings; opening a listing calls its `/{id}/views` counter.
- HTTP services in `shared/services/` (`product/state/product-api.service.ts`,
  `car/car-api.service.ts`, `location.service.ts`).

## Conventions
- i18n: every user-visible string goes through the `t` pipe; add the key to **all three** objects
  (`en`, `uz`, `ru`) in `shared/i18n/translations.ts`. Plurals are `a|b` (en/uz) and
  `one|few|many` (ru).
- Location names come from the backend in the UI language: reload them when `I18nService.lang()`
  changes (see the filters).
- Prettier: 100 columns, single quotes (config in `package.json`).
- Prefer signals and `inject()`; keep components standalone.
