import { Component, inject, input, Signal } from '@angular/core';
import { MinToHourPipe } from '../../../../shared/pipes/mintohour.pipe';
import { MealRecipeItemFacade } from './meal-recipe-item.facade';

export interface MealRecipeContext {
  recipe: Signal<any>;
  canDeleteMeal: Signal<boolean>;
  canViewRecipe: Signal<boolean>;
}

@Component({
  selector: 'app-meal-recipe-item',
  imports: [MinToHourPipe],
  providers: [MealRecipeItemFacade],
  templateUrl: './meal-recipe-item.component.html',
  styleUrl: './meal-recipe-item.component.css',
})
export class MealRecipeItemComponent {
  /** Inputs */
  recipe = input.required<any>();
  canDeleteMeal = input.required<boolean>();
  canViewRecipe = input.required<boolean>();
  showImage = input<boolean>(true);

  /** UI Facade */
  private facade = inject(MealRecipeItemFacade);

  private ctx: MealRecipeContext = {
    recipe: this.recipe,
    canDeleteMeal: this.canDeleteMeal,
    canViewRecipe: this.canViewRecipe,
  };

  /** Rendered on UI */
  readonly totalTime = this.facade.totalTime;
  readonly recipeTitle = this.facade.recipeTitle;
  readonly thumbnailUrl = this.facade.thumbnailUrl;
  readonly mealCategoryName = this.facade.mealCategoryName;

  ngOnInit(): void {
    this.facade.connect(this.ctx);
  }

  openDeleteModal(event: MouseEvent) {
    this.facade.openDeleteModal(event);
  }

  viewRecipe() {
    this.facade.viewRecipe();
  }
}
