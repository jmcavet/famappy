import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';

@Component({
  selector: 'app-ingredient-item',
  imports: [RowComponent, InlineComponent, NgClass],
  templateUrl: './ingredient-item.component.html',
  styleUrl: './ingredient-item.component.css',
})
export class IngredientItemComponent {
  ingredient = input.required<any>();
  selectedIngredientIds = input.required<string[]>();
  toggleItem = output<string>();

  isSelected(): boolean {
    return this.selectedIngredientIds().includes(this.ingredient().id);
  }

  selectItem() {
    this.toggleItem.emit(this.ingredient().id);
  }
}
