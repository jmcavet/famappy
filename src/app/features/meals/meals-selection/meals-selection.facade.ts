import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { MealSelectionStateService } from '../state/mealSelection.service';
import { MealCategoryDocInBackend } from '../../../models/cuisine.model';
import { IngredientCategoryDocInBackend } from '../../../models/ingredient.model';
import { MealFilterStateService } from '../state/mealFilter.service';
import { RecipeWithId } from '../../recipes/components/recipe-card/recipe.model';
import { MealDefinitionStateService } from '../state/mealDefinition.service';
import { FormControl } from '@angular/forms';
import { MealCartStateService } from '../state/mealCart.service';
import { CuisineDomainFacade } from '../../../domain-facades/cuisine.facade';
import { IngredientDomainFacade } from '../../../domain-facades/ingredient.facade';
import { IngredientCategoryDomainFacade } from '../../../domain-facades/ingredientCategory.facade';
import { SelectionViewMode } from '../state/mealSelection.model';

export enum RecipeMethod {
  Random = 'Random',
  Newest = 'Newest first',
  Oldest = 'Oldest first',
}

@Injectable({ providedIn: 'root' })
export class MealSelectionFacade {
  recipeMethods = Object.values(RecipeMethod);

  /* ════════════════════════════════
   * Public API (UI actions)
   * ════════════════════════════════ */

  public initializeMealCategory() {
    const firstCategory = this.mealCategories()[0];
    if (firstCategory) {
      this.selectionService.setMealCategory(firstCategory);
    }
  }

  public setMealCategory(cat: MealCategoryDocInBackend) {
    this.selectionService.setMealCategory(cat);
  }
  public getMealCategory() {
    this.selectionService.state().mealCategoryIdSelected;
  }

  public setIngredientCategory(
    ingredientCategory: IngredientCategoryDocInBackend,
  ) {
    this.selectionService.setIngredientCategory(ingredientCategory);

    this.filterService.computeRecipesFiltered(this.recipesFiltered());
  }

  public decreaseRatio() {
    this.selectionService.updateRatio('decrease');
  }

  public increaseRatio() {
    this.selectionService.updateRatio('increase');
  }

  public toggleView(viewMode: SelectionViewMode) {
    this.selectionService.toggleView(viewMode);
  }

  public getCuisineName(cuisineId: string): string {
    const cuisine = this.cuisines().find((c) => c.id === cuisineId);
    return cuisine?.name ?? 'None';
  }

  public toggleShowIngredientCategories() {
    this.showIngredientCategories.update(
      () => !this.showIngredientCategories(),
    );
  }

  public toggleRecipe(recipe: RecipeWithId) {
    const selected = this.selectedRecipes();
    const exists = selected.some((r) => r.id === recipe.id);

    this.selectedRecipes.set(
      exists
        ? selected.filter((r) => r.id !== recipe.id)
        : [...selected, recipe],
    );
  }

  public toggleMealCategory(mealCategoryName: string) {
    const mealCategory = this.mealCategories().find(
      (cat) => cat.name === mealCategoryName,
    );
    if (mealCategory) {
      this.selectionService.setMealCategory(mealCategory);
    }
  }

  public mealCategoryNameSelected = computed(() => {
    const toto = this.mealCategories().find(
      (cat) => cat.id === this.selectionService.state().mealCategoryIdSelected,
    );

    if (toto) {
      return toto.name;
    }

    return 'NOTHING!!';
  });

  public resetSelectedRecipes() {
    this.selectedRecipes.set([]);
  }

  public addRecipesToCart() {
    const recipes = this.selectedRecipes();
    this.cartService.addRecipesToCart(recipes);

    // Reset the list of selected recipes
    this.resetSelectedRecipes();
  }

  /* ════════════════════════════════
   * Dependencies (injected)
   * ════════════════════════════════*/

  /** Domain access (business state & actions) */
  private cuisineDomainFacade = inject(CuisineDomainFacade);
  private ingredientDomainFacade = inject(IngredientDomainFacade);
  private ingredientCategoryDomainFacade = inject(
    IngredientCategoryDomainFacade,
  );

  /** Transitional state (shared by several ui) */
  private defService = inject(MealDefinitionStateService);
  private filterService = inject(MealFilterStateService);
  private selectionService = inject(MealSelectionStateService);
  private cartService = inject(MealCartStateService);

  /* ════════════════════════════════
   * Local UI state (owned by this facade)
   * ════════════════════════════════ */
  /** Public signals */
  readonly selectedRecipes = signal<RecipeWithId[]>([]);
  readonly showIngredientCategories = signal<boolean>(false);

  /** Private signals */
  private selectedMethod = signal<RecipeMethod>(RecipeMethod.Random);

  /* ════════════════════════════════
   * Domain Data Access (proxies)
   * ════════════════════════════════ */
  /** Private signals*/
  private cuisines = this.cuisineDomainFacade.dbCuisines;
  private cuisinesLoading = this.cuisineDomainFacade.cuisinesLoading;
  private ingredients = this.ingredientDomainFacade.dbIngredients;
  private ingredientsLoading = this.ingredientDomainFacade.ingredientsLoading;
  private ingredientCategories =
    this.ingredientCategoryDomainFacade.dbIngredientCategories;
  private ingredientCategoriesLoading =
    this.ingredientCategoryDomainFacade.ingredientCategoriesLoading;

  readonly methodControl = new FormControl(RecipeMethod.Random);

  constructor() {
    // Activate the first meal category once it gets rendered
    effect(() => {
      const categories = this.mealCategories();
      const selected = this.mealCategoryIdSelected();

      if (!selected && categories.length > 0) {
        this.selectionService.setMealCategory(categories[0]);
      }
    });

    this.methodControl.valueChanges.subscribe((value) => {
      this.selectedMethod.set(value ?? RecipeMethod.Random);
    });
  }

  /* ════════════════════════════════
   * State Projections (expose internal state)
   * ════════════════════════════════ */
  // States from the Definition page
  readonly plannedMealsCount = computed(
    () => this.defService.state().plannedMealsCount,
  );

  // States from the Selection page
  readonly mealCategoryIdSelected = computed(
    () => this.selectionService.state().mealCategoryIdSelected,
  );

  readonly viewMode = computed(() => this.selectionService.state().viewMode);

  readonly ingredientCategoriesSelected = computed(
    () => this.selectionService.state().ingredientCategoriesSelected,
  );
  readonly mealRatio = computed(() => this.selectionService.state().ratio);

  // States from the Cart page
  readonly cartItems = computed(() => this.cartService.state().cart);

  readonly btnValidateCartText = computed(() =>
    this.cartItems().length === 0
      ? 'Validate meals'
      : `Validate ${this.cartItems().length} meals`,
  );

  /* ════════════════════════════════
   * View Model (UI logic / presentation state)
   * ════════════════════════════════ */
  readonly dataIsLoading = computed(() => {
    return (
      this.cuisinesLoading() ||
      this.ingredientsLoading() ||
      this.ingredientCategoriesLoading()
    );
  });

  /* ════════════════════════════════
   * Domain Projections (business logic)
   * ════════════════════════════════ */
  // Filter only categories previously selected by users and which exist within the
  // list of recipes filtered in the previous page (meals/filter)
  readonly mealCategories = computed(() => {
    const mealCategoriesIdsByFilteredRecipes = this.recipesFiltered().map(
      (recipe) => recipe.mealCategoryId,
    );

    return this.mealCategoriesSelected().filter((cat) =>
      mealCategoriesIdsByFilteredRecipes.includes(cat.id),
    );
  });

  readonly categoriesNames = computed(() =>
    this.mealCategories().map((cat) => cat.name),
  );

  // Ingredient categories based on the meal category selected by users and recipes filtered previously
  readonly ingredientCategoriesByMealCategory = computed(() => {
    const selectedMealCategoryId = this.mealCategoryIdSelected();
    const recipes = this.recipesFiltered();
    const ingredients = this.ingredients();
    const ingredientCategories = this.ingredientCategories();

    // 1. Filter recipes for the selected meal category
    const relevantRecipes = recipes.filter(
      (r) => r.mealCategoryId === selectedMealCategoryId,
    );

    // 2. Collect unique ingredient IDs contained in those recipes
    const ingredientIds = Array.from(
      new Set(relevantRecipes.flatMap((r) => r.ingredients.map((i) => i.id))),
    );

    // 3. From the backend ingredients, keep only those appearing in these recipes
    const usedIngredients = ingredients.filter((i) =>
      ingredientIds.includes(i.id),
    );

    // 4. Collect unique ingredient category IDs
    const categoryIds = Array.from(
      new Set(usedIngredients.map((ing) => ing.categoryId)),
    );

    // 5. Return final filtered ingredient category objects
    return ingredientCategories.filter((cat) => categoryIds.includes(cat.id));
  });

  // Recipes filtered depending on the following user's selection:
  // meal category (e.g. main course, side dish), method, ratio, or ingredient category (e.g. vegetable, fruit)
  readonly recipesFilteredByCategory = computed(() => {
    const plannedMealsCount = this.plannedMealsCount();
    const recipes = this.recipesFiltered();

    console.log('MY RECIPES: ', recipes);
    const mealRatio = this.mealRatio();
    const selectedMealCategoryId = this.mealCategoryIdSelected();

    const ingredientsIdsSelected = this.ingredientsSelected().map((i) => i.id);

    const ingredientCategoriesIdsSelected =
      this.ingredientCategoriesSelected().map((c) => c.id);

    const cartRecipeIds = this.cartItems().map((c) => c.id);

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

    const ingredientsByIngredientCategory = this.ingredients().filter((item) =>
      ingredientCategoriesIdsSelected.includes(item.categoryId),
    );

    const arrayBeforeMethod = recipes.filter((recipe) => {
      const recipeIngredientsIds = recipe.ingredients.map((item) => item.id);

      const conditionIngredients =
        ingredientCategoriesIdsSelected.length === 0 ||
        !recipesPerMealCategoryHaveSomeOfSelectedIngredients
          ? true
          : ingredientsByIngredientCategory.some((item) =>
              recipeIngredientsIds.includes(item.id),
            );

      return (
        recipe.mealCategoryId === selectedMealCategoryId &&
        ingredientsIdsSelected.length === 0 &&
        conditionIngredients
      );
    });

    console.log('arrayBeforeMethod: ', arrayBeforeMethod);
    let finalArray = arrayBeforeMethod;
    if (this.selectedMethod() === RecipeMethod.Random) {
      const shuffled = [...arrayBeforeMethod].sort(() => Math.random() - 0.5);
      const rangeValue = plannedMealsCount * mealRatio;
      finalArray = shuffled.slice(0, rangeValue);
    }

    return finalArray.filter((item) => !cartRecipeIds.includes(item.id));
  });

  /* ════════════════════════════════
   * Private Helpers
   * ════════════════════════════════ */
  private mealCategoriesSelected = computed(
    () => this.defService.state().mealCategoriesSelected,
  );

  private recipesFiltered = computed(
    () => this.filterService.state().recipesFiltered,
  );

  private ingredientsSelected = computed(
    () => this.selectionService.state().ingredientsSelected,
  );
}
