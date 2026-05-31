# Layout system rules - Core primitives

| Component | Usage                 | Owns                                       |
| --------- | --------------------- | ------------------------------------------ |
| Main      | Page insets & scroll  | py-\*, scrolling (overflow-y-auto)         |
| Container | Horizontal constraint | max-width, px-\*, centering                |
| Section   | Content block         | px-\*, background color, geometry (radius) |
| Stack     | Vertical flow         | flex-col, gap-\*                           |
| Row       | Horizontal flow       | justify-\*, items-\*                       |
| Inline    | Horizontal Grouping   | flex-row, gap-\*, groups small items       |

| Type                  | Example                              | Usage                                | Purpose                                                                                                                                         |
| --------------------- | ------------------------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout primitives     | Stack, Row, Inline                   | Skeleton: how are elements arranged? | Arrange elements (distribution type, gap), hence defining relationships between children. Do not own content, nor define boundaries             |
| Structural components | Section, Container, Page/MainContent | boxes: where does content sit?       | Wrap content, define padding, define background & shape. They define a content boundary/surface. They can contain layout primitives as children |
| Surface components    | Section, Card, Panel                 | styling: how does it look?           | Wrap content, define padding, define background & shape. They define a content boundary/surface. They can contain layout primitives as children |

```html
<main class="py-6">
  <app-container>
    <app-stack variant="page">
      <app-section>
        <app-stack variant="section">
          <h2>Title</h2>
          <p>Text</p>
        </app-stack>
      </app-section>

      <app-section [surface]="2">
        <app-row justify="between">
          <span>Left</span>
          <button>Action</button>
        </app-row>
      </app-section>
    </app-stack>
  </app-container>
</main>
```

## Container component

The _ContainerComponent_ is responsible for horizontal concerns — max-width, centering, x-inset. Its contract is deliberately one-dimensional. There is no vertical padding (py-\*) since it would mix axes and this component would be harder to reuse elsewhere (e.g. inside a Card where no top padding is needed).

## Stack component

It owns spacing between its vertical children.

## Section component

A section is a layout group. It visually separates a named chunk of the page. It may or may not have a background. Its job is organisation.

For sections on mobile, the most common Tailwind gaps are:

| Usage                       | Typical Tailwind spacing |
| --------------------------- | ------------------------ |
| Very tight grouping         | `gap-2`                  |
| Standard content spacing    | `gap-4`                  |
| Between major cards/blocks  | `gap-6`                  |
| Between large page sections | `gap-8` or `gap-10`      |

Example of nested elements inside a section:

```html
<app-stack variant="page">
  <app-section>
    <app-stack variant="section">
      <span class="bg-fuchsia-100">Test 2a</span>
      <span class="bg-fuchsia-100">Test 2b</span>
      <app-section [surface]="2">
        <app-stack variant="default">
          <span class="surface-1">Test 2b 1</span>
          <span class="surface-1">Test 2b 2</span>
          <span class="surface-1">Test 2b 3</span>
        </app-stack>
      </app-section>
    </app-stack>
  </app-section>
</app-stack>
```
