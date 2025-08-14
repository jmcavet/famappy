import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-ingredient-item',
  imports: [NgClass],
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
