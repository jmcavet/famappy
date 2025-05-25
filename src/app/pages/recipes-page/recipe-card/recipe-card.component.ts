import { Component, Input } from '@angular/core';
import { Recipe } from './recipe.model';
import { DatePipe } from '@angular/common';
import { RecipeState } from '../../../models/recipe.model';
import { MinToHourPipe } from '../../../shared/pipes/mintohour.pipe';

@Component({
  selector: 'app-recipe-card',
  imports: [MinToHourPipe],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.css',
})
export class RecipeCardComponent {
  @Input() recipe?: RecipeState;

  get totalTime() {
    const totalTime =
      Number(this.recipe?.preparationTime ?? 0) +
      Number(this.recipe?.cookingTime ?? 0);

    return totalTime;
  }
}
