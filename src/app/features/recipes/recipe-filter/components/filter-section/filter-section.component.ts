import {
  Component,
  computed,
  Input,
  Signal,
  WritableSignal,
} from '@angular/core';

@Component({
  selector: 'app-filter-section',
  imports: [],
  templateUrl: './filter-section.component.html',
  styleUrl: './filter-section.component.css',
})
export class FilterSectionComponent {
  @Input() sectionTitle!: string;
  @Input() icon!: string;
  // @Input() tags!: Signal<{ id: string; name: string }[]>;
  @Input() tags!: Signal<any[]>;
  @Input() selectedIds!: WritableSignal<string[]>;

  labelToggleSelectAll = computed(() =>
    this.selectedIds().length === this.tags().length
      ? 'Deselect all'
      : 'Select all'
  );

  selectDeselectAll() {
    if (this.selectedIds().length === this.tags().length) {
      this.selectedIds.set([]);
    } else {
      const allIds = this.tags().map((tag) => tag.id);
      this.selectedIds.set(allIds);
    }
  }

  toggleTag(id: string) {
    const current = this.selectedIds();
    console.log('current: ', current);
    this.selectedIds.set(
      current.includes(id)
        ? current.filter((el) => el !== id)
        : [...current, id]
    );
  }
}
