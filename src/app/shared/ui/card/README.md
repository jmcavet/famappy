# Card component

## Architecture

```
app-card                        shell: geometry + surface + padding
  app-stack                     layout: direction, gap, alignment
    any element
```

## Components

### `app-card`

The outer shell. Defines geometry, surface (background color), and padding.

| Input     | Type                       | Default | Description            |
| --------- | -------------------------- | ------- | ---------------------- |
| `surface` | `'0' \| '1' \| '2' \| '3'` | `'1'`   | Visual elevation level |

### `app-stack`

The content container. Defines layout direction, gap, and alignment.
See the StackComponent.

## Usage

### Standard card with uniform padding

```html
<app-card surface="1">
  <app-stack>
    <h2 class="text-title">Title</h2>
    <p class="text-body">Content</p>
  </app-stack>
</app-card>
```

### Recipe card with bleeding image

```html
<app-card surface="1">
  <app-stack>
    <figure>
      <img [src]="thumbnailUrl" [alt]="title" />
      <figcaption>{{ category }}</figcaption>
    </figure>

    <h2 class="text-card-title">{{ title }}</h2>

    <time>{{ totalTime | mintohour }}</time>
    <span>{{ difficulty }}</span>
  </app-stack>
</app-card>
```
