import { Component, inject, input, Signal } from '@angular/core';
import { SectionComponent } from '../../../../shared/layout/primitives/section.component';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ModalUpdateShoppingCategoryItemsFacade } from './modal-update-shopping-category-items.facade';
import { ShoppingCategoryItem } from '../../shopping.facade';

export interface ModalUpdateShoppingCategoryItemsContext {
  title: Signal<string>;
  category: Signal<string>;
  existingItems: Signal<ShoppingCategoryItem[]>;
}

@Component({
  selector: 'app-modal-update-shopping-category-items',
  imports: [SectionComponent, StackComponent, RowComponent, ButtonComponent],
  templateUrl: './modal-update-shopping-category-items.component.html',
  styleUrl: './modal-update-shopping-category-items.component.css',
})
export class ModalUpdateShoppingCategoryItemsComponent {
  title = input.required<string>();
  category = input.required<string>();
  existingItems = input.required<ShoppingCategoryItem[]>();

  private facade = inject(ModalUpdateShoppingCategoryItemsFacade);

  private ctx: ModalUpdateShoppingCategoryItemsContext = {
    title: this.title,
    category: this.category,
    existingItems: this.existingItems,
  };

  ngOnInit(): void {
    this.facade.connect(this.ctx);
  }

  originalItemsHaveChanged = this.facade.originalItemsHaveChanged;
  itemValues = this.facade.itemValues;

  onCancel() {
    this.facade.cancel();
  }

  onConfirm() {
    this.facade.confirm();
  }

  deleteItem(item: ShoppingCategoryItem) {
    this.facade.deleteItem(item);
  }

  updateItem(index: number, name: string) {
    this.facade.updateItem(index, name);
  }
}
