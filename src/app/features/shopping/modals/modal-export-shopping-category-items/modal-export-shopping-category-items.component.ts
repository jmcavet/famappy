import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { SectionComponent } from '../../../../shared/layout/primitives/section.component';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-modal-shopping-category-items',
  imports: [
    ButtonComponent,
    FormsModule,
    SectionComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    NgClass,
  ],
  templateUrl: './modal-export-shopping-category-items.component.html',
  styleUrl: './modal-export-shopping-category-items.component.css',
})
export class ModalExportShoppingCategoryItemsComponent {
  title = input.required<string>();
  category = input.required<string>();
  existingItems =
    input.required<{ id: string; name: string; selected: boolean }[]>();

  readonly itemsAlreadyDisplayedOnPage = linkedSignal<string[]>(() => {
    return this.existingItems()
      .filter((item) => item.selected)
      .map((item) => item.name);
  });

  readonly selectedItems = signal<string[]>([]);

  private modalService = inject(ModalService);

  exportMessage = computed(() => {
    let message = 'Export';
    if (this.selectedItems().length === 1) {
      message = 'Export 1 item';
    }
    if (this.selectedItems().length > 1) {
      message = `Export ${this.selectedItems().length} items`;
    }

    return message;
  });

  public onCancel() {
    this.modalService.cancel();
  }

  public onConfirm() {
    // Pass the value provided by the user to the onConfirm method of the modal service config.
    this.modalService.confirm({
      items: this.selectedItems(),
    });
  }

  public toggleCategoryItem(categoryItem: string) {
    const selectedItems = this.selectedItems();
    const exists = selectedItems.some((item) => item === categoryItem);

    this.selectedItems.set(
      exists
        ? selectedItems.filter((item) => item !== categoryItem)
        : [...selectedItems, categoryItem],
    );
  }
}
