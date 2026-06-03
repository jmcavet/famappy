import {
  Component,
  computed,
  inject,
  linkedSignal,
  model,
  Signal,
  signal,
} from '@angular/core';
import { RecipeBackendService } from '../../services/backend/recipe.service';
import { RecipeWithId } from '../recipes/components/recipe-card/recipe.model';
import { FormsModule } from '@angular/forms';
import { IngredientItemComponent } from './components/ingredient-item/ingredient-item.component';
import { IngredientBackendService } from '../../services/backend/ingredient.service';
import { IngredientCategoryBackendService } from '../../services/backend/ingredient-category.service';
import { IngredientDocInBackend } from '../../models/ingredient.model';
import { IngredientTypeWithDate } from '../../models/ingredient-type.model';
import { RecipeStateService } from '../../services/state/recipe.service';
import { Location } from '@angular/common';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { SegmentedControlComponent } from '../../shared/ui/segmented-control/segmented-control.component';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';

@Component({
  selector: 'app-filter-ingredients',
  imports: [
    FormsModule,
    IngredientItemComponent,
    ButtonComponent,
    PageLayoutComponent,
    HeaderShellComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    SectionComponent,
    SegmentedControlComponent,
    LoadingComponent,
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
    const availableRecipesIngredientIds = [
      ...new Set(
        this.dbRecipes().flatMap((recipe) =>
          recipe.ingredients.flatMap((ing) => ing.id),
        ),
      ),
    ];

    const ingredients = this.ingredients().filter((ingr) =>
      availableRecipesIngredientIds.includes(ingr.id),
    );

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

  readonly sortedIngredients = computed(() => {
    return this.ingredientsFiltered()
      .filter(
        (ingr) => ingr.categoryName === this.ingredientCategoryNameSelected(),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly availableCategories = computed(() => {
    const availableRecipesIngredientIds = [
      ...new Set(
        this.dbRecipes().flatMap((recipe) =>
          recipe.ingredients.flatMap((ing) => ing.id),
        ),
      ),
    ];

    const availableIngredients = this.ingredients().filter((ingr) =>
      availableRecipesIngredientIds.includes(ingr.id),
    );

    const availableCategoriesIds = availableIngredients.flatMap(
      (ingr) => ingr.categoryId,
    );

    return this.ingredientCategories().filter((cat) =>
      availableCategoriesIds.includes(cat.id),
    );
  });

  readonly availableCategoriesNames = computed(() => {
    const availableCategoriesNames = this.availableCategories().map(
      (cat) => cat.name,
    );

    availableCategoriesNames.sort((a, b) => a.localeCompare(b));

    return availableCategoriesNames;
  });

  readonly ingredientCategoryNameSelected = linkedSignal(() => {
    return this.availableCategoriesNames()
      ? this.availableCategoriesNames()[0]
      : 'none';
  });

  public toggleIngredientCategory(ingredientCategoryName: string) {
    this.ingredientCategoryNameSelected.set(ingredientCategoryName);
  }

  public toggleIngredient(ingredientId: string) {
    this.selectedIngredientIds.update((current) => {
      if (current.includes(ingredientId)) {
        return current.filter((id) => id !== ingredientId);
      } else {
        return [...current, ingredientId];
      }
    });
  }

  resetIngredientsSelected() {
    this.selectedIngredientIds.update(() => []);
  }

  badgeValues = computed(() => {
    const sortedAvailableCategories = this.availableCategories().sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    const count = sortedAvailableCategories.map((cat) => {
      const selectedIngredients = this.ingredients().filter((ingr) =>
        this.selectedIngredientIds().includes(ingr.id),
      );
      const selectedCategoriesIds = selectedIngredients.map(
        (ingr) => ingr.categoryId,
      );

      return selectedCategoriesIds.filter((id) => cat.id === id).length;
    });

    return count;
  });

  pageLoading = computed(
    () => this.ingredientsAreLoading() || this.ingredientCategoriesAreLoading(),
  );

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
    this.recipeStateService.saveFilterIngredientIds(
      this.selectedIngredientIds(),
    );

    this.goBack();
  }

  cancel() {
    this.goBack();
  }

  goBack() {
    this.location.back();
  }
}
