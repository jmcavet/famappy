import { Component, Input } from '@angular/core';
import { IngredientType } from '../../../models/ingredient-type.model';
import {
  IngredientWithTypeName,
  IsAcending,
} from '../../../models/ingredient.model';

@Component({
  selector: 'app-ingredient-filter',
  imports: [],
  templateUrl: './ingredient-filter.component.html',
  styleUrl: './ingredient-filter.component.css',
})
export class IngredientFilterComponent {
  @Input() ingredientType: IngredientType | undefined = undefined;
  @Input() ingredientsFiltered: IngredientWithTypeName[] = [];

  filterSelected: string = 'dateCreated';
  isAscending: IsAcending = { date: false, type: false, name: false };
  showEmojiPicker = false;

  selectFilter(filter: string) {
    this.filterSelected = filter;

    switch (filter) {
      case 'dateCreated':
        this.isAscending.date = !this.isAscending.date;
        break;
      case 'type':
        this.isAscending.type = !this.isAscending.type;
        break;
      case 'name':
        this.isAscending.name = !this.isAscending.name;
        break;
      default:
        console.warn(`Unhandled filter: ${filter}`);
    }

    this.sortIngredientsByDate();
  }

  sortIngredientsByDate() {
    this.ingredientsFiltered.sort((a, b) => {
      if (this.filterSelected === 'name') {
        return this.isAscending.name
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (this.filterSelected === 'type') {
        const nameA = this.stripEmoji(a.typeName!).toLowerCase() ?? '';
        const nameB = this.stripEmoji(b.typeName!).toLowerCase() ?? '';
        return this.isAscending.type
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else {
        const dateA = this.toDate(a.dateCreated);
        const dateB = this.toDate(b.dateCreated);
        return this.isAscending.date
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      }
    });
    console.log('ingredientsFiltered: ', this.ingredientsFiltered);
  }

  stripEmoji(text: string): string {
    // Removes most common emoji characters
    return text
      .replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\u200D|\uFE0F)/g,
        ''
      )
      .trim();
  }

  private toDate(value: any): Date {
    if (value instanceof Date) return value;
    if (value?.toDate instanceof Function) return value.toDate(); // Firestore Timestamp
    return new Date(value); // Try parsing string or fallback
  }

  onEmojiSelect(event: any) {
    // this.ingredient.emoji = event.emoji.native;
    this.showEmojiPicker = false;
  }
}
