---
name: angular
description: Angular 19 development guidance for Famappy, including standalone components, signals, facades, Firebase boundaries, and project validation.
---

# Angular Skill for Famappy

Use this skill when implementing, reviewing, or refactoring Angular code in the Famappy application.

## Project context

- Famappy is an Angular 19 application written in strict TypeScript.
- The frontend uses standalone components, Angular Router, signals, Firebase/Firestore, PrimeNG, Angular Material, Tailwind CSS, and SCSS.
- The application provides family meal planning for recipes, meals, ingredients, shopping lists, members, authentication, and management screens.
- Cloud Functions are maintained separately under `functions/`.

## Architecture

- Keep presentation components focused on rendering, user interaction, accessibility, and template bindings.
- Keep backend and Firebase-specific access in `src/app/services/` or the appropriate backend layer.
- Components and UI facades must not inject backend or Firebase services directly. Use a domain facade as the application-facing boundary.
- Do not inject one domain facade into another.
- Keep shared UI and layout code under `src/app/shared/`, feature code under `src/app/features/`, and domain facades under `src/app/domain-facades/`.
- Component-scoped facades must use `@Injectable()` and be provided by their owning component; do not turn component-local state into a root singleton.
- Preserve existing public component APIs and route contracts unless the task explicitly requires a breaking change.

## Angular and TypeScript conventions

- Prefer standalone components with explicit `imports` arrays.
- Prefer `inject()` where it matches nearby code.
- Use signals and `computed()` for local reactive state. Avoid duplicating state owned by a facade or shared state service.
- Expose signals as `readonly` or `public readonly`; update them with `.set()` or `.update()` rather than replacing the signal reference.
- Use `connect()` for component inputs, route parameters, and local UI configuration. Do not use it to pass Firestore collections, loading flags, domain-derived signals, or shared application state.
- Keep non-trivial business logic out of templates and move it into the appropriate facade or service.
- Use strict, meaningful types and avoid introducing `any`.
- Follow the existing `app-` selector and feature naming conventions.

## UI and styling

- Reuse existing shared layout primitives and UI components before adding new markup.
- Follow `docs/design-system.md` and the existing style patterns for surface, geometry, layout, inset, space, density, and typography.
- Prefer existing Tailwind utilities and SCSS partials in `src/styles/` over one-off styles.
- Use PrimeNG and Angular Material consistently with neighboring code; do not add another UI library for a small feature.
- Preserve responsive behavior and include appropriate loading, empty, error, keyboard, and accessible states for user-facing changes.

## Firebase and data changes

- Keep Firestore access behind the backend service/domain-facade boundary.
- Review authorization behavior for every new read or write path.
- When adding a collection or query that requires an index, update both `firestore.rules` and `firestore.indexes.json`.
- Do not hard-code secrets or environment-specific Firebase configuration; use the existing environment configuration pattern.
- Review the diff before deploying Firestore changes. The project deployment command is:

```bash
firebase deploy --only firestore
```

## Workflow and validation

1. Inspect the relevant feature component, template, facade, service, model, route, and neighboring tests before editing.
2. Search for existing helpers, shared components, and patterns before adding new abstractions.
3. Make the smallest focused change that addresses the request and preserve unrelated user changes.
4. Add or update focused tests for behavior changes, especially facade, state, routing, and data-access behavior.
5. Run the narrowest relevant validation first, then broaden it as needed:

```bash
npm test -- --watch=false
npm run build
```

For local development, use:

```bash
npm start
```

Do not claim validation passed unless the command was actually run. If a command cannot run, report the command and the blocking reason explicitly.