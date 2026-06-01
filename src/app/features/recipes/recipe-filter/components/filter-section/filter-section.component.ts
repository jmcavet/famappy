import {
  Component,
  computed,
  input,
  Input,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ChipComponent } from '../../../../../shared/ui/chip/chip.component';
import { RowComponent } from '../../../../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../../../../shared/layout/primitives/inline.component';
import { StackComponent } from '../../../../../shared/layout/primitives/stack.component';

@Component({
  selector: 'app-filter-section',
  imports: [
    ButtonComponent,
    ChipComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
  ],
  templateUrl: './filter-section.component.html',
  styleUrl: './filter-section.component.css',
})
export class FilterSectionComponent {
  @Input() sectionTitle!: string;
  @Input() icon!: string;
  @Input() tags!: Signal<any[]>;
  @Input() selectedIds!: WritableSignal<string[]>;
  canSelectAll = input<boolean>(true);

  labelToggleSelectAll = computed(() =>
    this.selectedIds().length === this.tags().length
      ? 'Deselect all'
      : 'Select all',
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
    this.selectedIds.set(
      current.includes(id)
        ? current.filter((el) => el !== id)
        : [...current, id],
    );
  }
}
