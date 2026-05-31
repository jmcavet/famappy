# Design system

## Axes

The system is built on independent, composable axes.
Each class answers exactly one question.

| Axis       | Classes                                 | File               |
| ---------- | --------------------------------------- | ------------------ |
| Surface    | `surface-0` … `surface-3`               | `_surfaces.scss`   |
| Geometry   | `card`, `modal`, `chip`                 | `_geometries.scss` |
| Layout     | `layout-stack`, `layout-row--between` … | `_layouts.scss`    |
| Inset      | `inset-none` … `inset-lg`               | `_spacing.scss`    |
| Space      | `space-none` … `space-lg`               | `_spacing.scss`    |
| Density    | `density-sm` … `density-lg`             | `_spacing.scss`    |
| Typography | `text-title`, `text-body` …             | `_texts.scss`      |

## Components

- [Card](./components/card.md)
