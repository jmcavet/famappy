# Famappy Chat Instructions

Use these instructions when assisting with the Famappy application.

## Project Overview

- Famappy is an Angular 19 application written in TypeScript.
- The frontend uses standalone components, Angular signals, Angular Router, Firebase/Firestore, PrimeNG, Angular Material, Tailwind CSS, and SCSS.
- The application is a family meal-planning tool with recipes, meals, ingredients, shopping lists, members, authentication, and management screens.
- Cloud Functions live in `functions/` and are a separate TypeScript package.

## Architecture Rules

- Keep UI components focused on presentation, user interaction, and template bindings.
- UI components and UI facades must not inject backend or Firebase services directly. Use a domain facade instead.
- Domain facades provide the application-facing abstraction over backend services. Do not inject one domain facade into another.
- Backend and Firebase-specific code belongs in `src/app/services/` or the appropriate backend layer.
- Component-scoped facades must use `@Injectable()` and be provided by their owning component. Do not make component-scoped state a root singleton.
- Use `connect()` for component inputs, route parameters, and local UI configuration. Do not pass Firestore collections, loading flags, domain-derived signals, or shared application state through `connect()`.
- Exposed signals should generally be `public readonly` or `readonly`; update their values with `.set()` or `.update()` rather than replacing the signal reference.
- Preserve the existing feature structure under `src/app/features/`, shared UI/layout code under `src/app/shared/`, and domain facades under `src/app/domain-facades/`.

## Angular and TypeScript Conventions

- Prefer standalone components and explicit `imports` arrays.
- Prefer `inject()` where it matches nearby code.
- Use signals and `computed()` for local reactive state. Avoid duplicating state that already belongs to a facade or shared state service.
- Keep templates readable and move non-trivial business logic into facades or services.
- Use strict, meaningful types. Avoid introducing `any`; improve an existing `any` only when it is relevant to the requested change.
- Keep public APIs and route contracts stable unless the task explicitly requires a breaking change.
- Follow the existing naming and folder conventions, including the `app-` selector prefix.

## UI and Styling

- Reuse the shared layout primitives and UI components before adding new markup or styles.
- Follow the design-system axes documented in `docs/design-system.md`: surface, geometry, layout, inset, space, density, and typography.
- Prefer existing utility classes and SCSS partials in `src/styles/` over one-off styles.
- Keep responsive behavior, accessibility, loading states, empty states, and error states in mind for user-facing changes.
- Use existing PrimeNG, Material, and project components consistently; do not add a new UI library for a small feature.

## Firebase and Data Changes

- Keep Firestore access behind the backend service/domain-facade boundary.
- When adding a Firestore collection or query that needs an index, update both `firestore.rules` and `firestore.indexes.json`.
- Treat security rules as part of the feature implementation and review authorization behavior for every new read/write path.
- Do not expose secrets or environment-specific Firebase configuration in source files. Use the existing environment configuration pattern.

## Validation

After code changes, run the narrowest relevant check first, then broaden validation as needed:

```bash
npm test -- --watch=false
npm run build
```

For local development:

```bash
npm start
```

For Firestore rule/index changes, deploy only after reviewing the diff:

```bash
firebase deploy --only firestore
```

Do not claim a change is complete without reporting the validation command and whether it passed. If a command cannot be run, state why.

## Working Style

- Inspect the relevant component, facade, service, model, template, and neighboring tests before editing.
- State the likely root cause before making a fix when debugging.
- Make the smallest focused change that satisfies the request; avoid unrelated refactors.
- Preserve user changes already present in the working tree.
- Add or update focused tests for behavior changes, especially facade, state, routing, and data-access behavior.
- Explain important architectural tradeoffs briefly and include file links when referring to repository files.

## Useful Chat Commands

- `@workspace` searches the workspace when the current file does not contain enough context.
- `/fix` asks Copilot to propose or apply a broader fix for selected code or a described problem.
- Ask Copilot to inspect the nearest facade/service and its tests before requesting a cross-cutting change.
