import { Component, computed, inject, signal, Signal } from '@angular/core';
import { MealStateService } from '../../../services/state/meal.service';
import { RecipeCardComponent } from '../../recipes/components/recipe-card/recipe-card.component';
import {
  MealCategoryDocInBackend,
  RecipeCategoryDocInBackend,
} from '../../../models/cuisine.model';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IngredientCategoryBackendService } from '../../../services/backend/ingredient-category.service';
import {
  IngredientCategoryDocInBackend,
  IngredientDocInBackend,
} from '../../../models/ingredient.model';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';
import { RecipeBackendService } from '../../../services/backend/recipe.service';
import { IngredientBackendService } from '../../../services/backend/ingredient.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { CuisineBackendService } from '../../../services/backend/cuisine.service';

@Component({
  selector: 'app-meals-selection',
  imports: [
    ReactiveFormsModule,
    RecipeCardComponent,
    RouterLink,
    CapitalizePipe,
    LoadingComponent,
  ],
  templateUrl: './meals-selection.component.html',
  styleUrl: './meals-selection.component.css',
})
export class MealsSelectionComponent {
  methods = ['Random', 'Newest first', 'Oldest first'];
  defaultMethod = new FormControl(this.methods[0]);
  ingredientCategoryOptions: IngredientCategoryDocInBackend[] = [];

  ngOnInit() {
    this.defaultMethod.valueChanges.subscribe((value) => {
      this.selectedMethod.set(value || '');
    });
  }

  constructor() {
    // Activate the first meal category tag
    this.setMealCategory(this.mealCategories()[0]);
  }

  /** Services */
  private stateMealService = inject(MealStateService);
  private ingredientCategoryBackendService = inject(
    IngredientCategoryBackendService
  );
  private recipeBackendService = inject(RecipeBackendService);
  private ingredientService = inject(IngredientBackendService);
  private cuisineService = inject(CuisineBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbIngredientCategories: Signal<IngredientCategoryDocInBackend[]> =
    this.ingredientCategoryBackendService.ingredientCategories;
  readonly ingredientCategoriesAreLoading =
    this.ingredientCategoryBackendService.loading;
  readonly dbRecipes: Signal<RecipeWithId[]> =
    this.recipeBackendService.recipes;
  readonly dbIngredients: Signal<IngredientDocInBackend[]> =
    this.ingredientService.ingredients;

  /** Declaration of local signals */
  mealState = this.stateMealService.mealState;
  // ratio = signal<number>(1);
  selectedMethod = signal<string>(this.methods[0]);
  selectedRecipes = signal<RecipeWithId[]>([]);

  readonly recipesDisplayedViaCards = computed(
    () => this.mealState().recipesDisplayedViaCards
  );

  readonly ratio = computed(() => this.mealState().ratio);

  readonly ingredientCategoriesSelected = computed(
    () => this.mealState().ingredientCategoriesSelected
  );

  readonly ingredientsSelected = computed(
    () => this.mealState().ingredientsSelected
  );

  readonly mealCategoriesSelected = computed<RecipeCategoryDocInBackend[]>(
    () => {
      return this.mealState().mealCategoriesSelected;
    }
  );

  readonly mealCategoryIdSelected = computed<string>(() => {
    return this.mealState().mealCategoryIdSelected;
  });

  readonly recipesFiltered = computed<RecipeWithId[]>(() => {
    return this.mealState().recipesFiltered;
  });

  readonly cart = computed<RecipeWithId[]>(() => {
    return this.mealState().cart;
  });

  getCuisineName(cuisineId: string): string {
    const cuisines = this.cuisineService.cuisines();
    const cuisine = cuisines.find((c) => c.id === cuisineId);
    return cuisine?.name ?? 'None';
  }

  /** Declaration of meal state signals */
  // Ingredient categories based on the meal category selected by users and recipes filtered previously
  readonly ingredientCategoriesByMealCategory = computed(() => {
    const recipesIngredientsByMealCategory = this.recipesFiltered().filter(
      (item) => item.mealCategoryId === this.mealCategoryIdSelected()
    );

    // All ingredients of previously filtered recipes
    const flatFilteredRecipesIngredients =
      recipesIngredientsByMealCategory.flatMap((el) => el.ingredients);

    const filteredRecipesIngredients = [
      ...new Map(
        flatFilteredRecipesIngredients.map((item) => [item.id, item])
      ).values(),
    ];

    // All ingredients ids of previously filtered recipes
    const filteredRecipesIngredientsIds = filteredRecipesIngredients.map(
      (el) => el.id
    );

    const filteredIngredients = this.dbIngredients().filter((item) =>
      filteredRecipesIngredientsIds.includes(item.id)
    );

    const ingredientCategoriesIdsByMealCategory = [
      ...new Map(
        filteredIngredients.map((item) => [item.categoryId, item])
      ).values(),
    ].map((item) => item.categoryId);

    const finalArray = this.dbIngredientCategories().filter((item) =>
      ingredientCategoriesIdsByMealCategory.includes(item.id)
    );

    return finalArray;
  });

  readonly recipesFilteredByCategory = computed(() => {
    const ingredientsIdsSelected = this.ingredientsSelected().flatMap(
      (obj) => obj.id
    );

    const ingredientCategoriesIdsSelected =
      this.ingredientCategoriesSelected().map((item) => item.id);

    // Use case: user activates 1 meal category (e.g. dessert). Corresponding recipes are displayed.
    // User activates an ingredient category (e.g. vegetable) and the recipes are being filtered (only those that contain vegetables).
    // User then activates another meal category (e.g. main course), for which the 'vegetable' category might not exist (no displayed recipes contain
    // this category). Since 1 ingredient category (vegetable) is activated but no recipes for the second meal category have this ingredient category,
    // our 'conditionIngredients' condition will be false and our ingredient categories corresponding to the second activated meal category will no be displayed!
    // Therefore, we need the following check
    const recipesPerMealCategoryHaveSomeOfSelectedIngredients =
      this.ingredientCategoriesByMealCategory()
        .map((item) => item.id)
        .some((id) => ingredientCategoriesIdsSelected.includes(id));

    const dbIngredientsByIngredientCategory = this.dbIngredients().filter(
      (item) => ingredientCategoriesIdsSelected.includes(item.categoryId)
    );

    const arrayBeforeMethod = this.recipesFiltered().filter((recipe) => {
      const recipeIngredientsIds = recipe.ingredients.map((item) => item.id);

      const conditionIngredients =
        ingredientCategoriesIdsSelected.length === 0 ||
        !recipesPerMealCategoryHaveSomeOfSelectedIngredients
          ? true
          : dbIngredientsByIngredientCategory.some((item) =>
              recipeIngredientsIds.includes(item.id)
            );

      return (
        recipe.mealCategoryId === this.mealCategoryIdSelected() &&
        ingredientsIdsSelected.length === 0 &&
        conditionIngredients
      );
    });

    let finalArray = arrayBeforeMethod;
    if (this.selectedMethod() === this.methods[0]) {
      const shuffled = [...arrayBeforeMethod].sort(() => Math.random() - 0.5);
      const rangeValue = this.mealState().nbPlannedMeals * this.ratio();
      finalArray = shuffled.slice(0, rangeValue);
    }

    const titi = finalArray.filter(
      (item) =>
        !this.cart()
          .map((item) => item.id)
          .includes(item.id)
    );
    console.log('Titi: ', titi);
    return titi;
  });

  // Filter only categories previously selected by users and which exist within the
  // list of recipes filtered in the previous page (meals/filter)
  readonly mealCategories = computed(() => {
    const mealCategoriesIdsByFilteredRecipes = this.recipesFiltered().map(
      (recipe) => recipe.mealCategoryId
    );

    return this.mealCategoriesSelected().filter((cat) =>
      mealCategoriesIdsByFilteredRecipes.includes(cat.id)
    );
  });

  setMealCategory(mealCategorySelected: MealCategoryDocInBackend) {
    this.stateMealService.setMealCategory(mealCategorySelected);
  }

  setIngredientCategory(ingredientCategory: IngredientCategoryDocInBackend) {
    this.stateMealService.setIngredientCategory(ingredientCategory);

    this.stateMealService.filterRecipesTest(this.recipesFiltered());
  }

  decreaseRatio() {
    this.stateMealService.updateRatio('decrease');
  }

  increaseRatio() {
    this.stateMealService.updateRatio('increase');
  }

  toggleRecipe(recipe: RecipeWithId) {
    const current = this.selectedRecipes();

    const isSelected = current.some((r) => r.id === recipe.id);

    if (isSelected) {
      // Remove recipe
      this.selectedRecipes.set(current.filter((r) => r.id !== recipe.id));
    } else {
      // Add recipe
      this.selectedRecipes.set([...current, recipe]);
    }
  }

  readonly isLoading = computed(() => {
    return this.ingredientCategoriesAreLoading();
  });

  toggleRecipeView() {
    this.stateMealService.toggleRecipeView();
  }

  addRecipesToCart() {
    this.stateMealService.addRecipesToCart(this.selectedRecipes());

    // Reset the list of selected recipes
    this.selectedRecipes.set([]);
  }
}
