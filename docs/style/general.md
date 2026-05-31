# General style

In flex and grid layouts, gap already handles spacing between children — making margin largely unnecessary inside components.
The preferred pattern is to let the parent container own the spacing between its children via gap.

The `space-*` class should almost always accompany the `layout-*` class.
Indeed, for instance for flex box and grid, we almost always need some gap. The only exception
might be when we need no gaps at all because we want to use some divider. A good practice is still to
(almost) always add the `space-*` class to a `layout-*` class.
