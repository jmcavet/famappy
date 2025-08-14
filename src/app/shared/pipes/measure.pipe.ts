import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ingredientQuantity',
})
export class IngredientQuantityPipe implements PipeTransform {
  transform(value: number): number {
    if (!value) return 0;
    return Number(value.toFixed(2));
  }
}
