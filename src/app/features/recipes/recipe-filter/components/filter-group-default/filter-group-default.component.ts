import { Component, computed, Input, WritableSignal } from '@angular/core';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ChipComponent } from '../../../../../shared/ui/chip/chip.component';
import { StackComponent } from '../../../../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../../../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../../../../shared/layout/primitives/inline.component';

@Component({
  selector: 'app-filter-group-default',
  imports: [
    ButtonComponent,
    ChipComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
  ],
  templateUrl: './filter-group-default.component.html',
  styleUrl: './filter-group-default.component.css',
})
export class FilterGroupDefaultComponent {
  @Input() sectionTitle!: string;
  @Input() icon!: string;
  @Input() tags!: WritableSignal<any[]>; // e.g. for difficult: [{name: 'easy', disabled: false}, {name: 'medium', disabled: true}, {...}]

  labelToggleSelectAll = computed(() => {
    const allTagsAreActivated =
      this.tags().filter((tag) => tag.selected).length === this.tags().length;

    return allTagsAreActivated ? 'Deselect all' : 'Select all';
  });

  selectDeselectAll() {
    const allTagsAreSelected =
      this.tags().filter((tag) => tag.selected).length === this.tags().length;

    this.tags.update((tags) =>
      tags.map((tag) => ({
        ...tag,
        selected: allTagsAreSelected ? false : true,
      })),
    );
  }

  toggleTag(tagName: string) {
    this.tags.update((tags) =>
      tags.map((tag) =>
        tag.name === tagName ? { ...tag, selected: !tag.selected } : tag,
      ),
    );
  }
}
