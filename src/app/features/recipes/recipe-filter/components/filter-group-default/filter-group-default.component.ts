import {
  Component,
  computed,
  effect,
  Input,
  Signal,
  WritableSignal,
} from '@angular/core';

@Component({
  selector: 'app-filter-group-default',
  imports: [],
  templateUrl: './filter-group-default.component.html',
  styleUrl: './filter-group-default.component.css',
})
export class FilterGroupDefaultComponent {
  @Input() sectionTitle!: string;
  @Input() icon!: string;
  @Input() tags!: WritableSignal<any[]>; // e,g, for difficult: [{name: 'low', disabled: false}, {name: 'normal', disabled: true}, {...}]

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
      }))
    );
  }

  toggleTag(tagName: string) {
    this.tags.update((tags) =>
      tags.map((tag) =>
        tag.name === tagName ? { ...tag, selected: !tag.selected } : tag
      )
    );

    console.log('tags: ', this.tags());
  }
}
