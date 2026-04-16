import {
  Component,
  computed,
  inject,
  model,
  Signal,
  signal,
} from '@angular/core';
import { RecipeBackendService } from '../../services/backend/recipe.service';
import { RecipeWithId } from '../recipes/components/recipe-card/recipe.model';
import { FormsModule } from '@angular/forms';
import { IngredientCategoriesSelectionComponent } from './components/ingredient-categories-selection/ingredient-categories-selection.component';
import { IngredientItemComponent } from './components/ingredient-item/ingredient-item.component';
import { IngredientBackendService } from '../../services/backend/ingredient.service';
import { IngredientCategoryBackendService } from '../../services/backend/ingredient-category.service';
import { IngredientDocInBackend } from '../../models/ingredient.model';
import { IngredientTypeWithDate } from '../../models/ingredient-type.model';
import { RecipeStateService } from '../../services/state/recipe.service';
import { Location } from '@angular/common';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-filter-ingredients',
  imports: [
    FormsModule,
    IngredientCategoriesSelectionComponent,
    IngredientItemComponent,
    ButtonComponent,
  ],
  templateUrl: './filter-ingredients.component.html',
  styleUrl: './filter-ingredients.component.css',
})
export class FilterIngredientsComponent {
  /** Services */
  private ingredientService = inject(IngredientBackendService);
  private ingredientCategoryService = inject(IngredientCategoryBackendService);
  private recipeBackendService = inject(RecipeBackendService);
  private recipeStateService = inject(RecipeStateService);

  private location = inject(Location);

  /** Declaration of signals communicating with firestore */
  readonly ingredients: Signal<IngredientDocInBackend[]> =
    this.ingredientService.ingredients;
  readonly ingredientCategories: Signal<IngredientTypeWithDate[]> =
    this.ingredientCategoryService.ingredientCategories;
  readonly ingredientCategoriesAreLoading =
    this.ingredientCategoryService.loading;

  readonly ingredientsAreLoading = this.ingredientService.loading;

  /** Declaration of signals communicating with firestore */
  readonly dbRecipes: Signal<RecipeWithId[]> =
    this.recipeBackendService.recipes;

  // Initialize the ingredients IDs (eventually) previously selected by the user
  selectedIngredientIds = signal<string[]>(
    this.recipeStateService.recipeState().filter.ingredientIds,
  );

  filter = model.required();

  onResetFilterText() {
    this.filter.set('');
  }

  /** Compute the ingredients filtered, whenever the following signals change:
   * ingredients, ingredientCategories, ingredientCategorySelected, filterSelected, isAscending */
  ingredientsFiltered = computed(() => {
    const ingredients = this.ingredients();
    const categories = this.ingredientCategories();
    const categorySelected =
      this.ingredientCategoryService.ingredientCategorySelected();

    if (!ingredients.length || !categories.length) return [];

    const ingredientsWithCategoryName = ingredients.map((ingredient) => {
      const categoryName =
        categories.find((t) => t.id === ingredient.categoryId)?.name ?? '';
      return { ...ingredient, categoryName };
    });

    let filtered = categorySelected
      ? ingredientsWithCategoryName.filter(
          (ingredient) => ingredient.categoryId === categorySelected.id,
        )
      : ingredientsWithCategoryName;

    return filtered;
  });

  toggleItem(ingredientId: string) {
    this.selectedIngredientIds.update((current) => {
      if (current.includes(ingredientId)) {
        return current.filter((id) => id !== ingredientId);
      } else {
        return [...current, ingredientId];
      }
    });
  }

  nbIngredientsFiltered = computed(() => {
    return this.selectedIngredientIds().length;
  });

  btnText = computed(() => {
    const nbIngredientsSelected = this.nbIngredientsFiltered();

    return nbIngredientsSelected > 0
      ? 'Filter ' + nbIngredientsSelected + ' ingredients'
      : 'Filter';
  });

  applyFilter() {
    console.log('Applying filter...');
    this.recipeStateService.saveFilterIngredientIds(
      this.selectedIngredientIds(),
    );

    this.location.back();
  }
}
