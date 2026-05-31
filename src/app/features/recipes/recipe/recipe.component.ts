import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { RecipeWithId } from '../components/recipe-card/recipe.model';
import { IngredientQuantityPipe } from '../../../shared/pipes/measure.pipe';
import { RecipeStateService } from '../../../services/state/recipe.service';
import { MealCategoryBackendService } from '../../../services/backend/meal-category.service';
import { RecipeBackendService } from '../../../services/backend/recipe.service';
import { CuisineBackendService } from '../../../services/backend/cuisine.service';
import { ToastService } from '../../../services/toast.service';
import {
  CuisineDocInBackend,
  MealCategoryDocInBackend,
} from '../../../models/cuisine.model';
import { RecipeCategoryBackendService } from '../../../services/backend/recipe-category.service';
import { CommonModule, Location } from '@angular/common';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { MinToHourPipe } from '../../../shared/pipes/mintohour.pipe';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import { TabsComponent } from '../../new-recipe/components/tabs/tabs.component';
import { TabComponent } from '../../new-recipe/components/tab/tab.component';
import { HeaderShellComponent } from '../../../shared/layout/shell/header-shell.component';
import { SectionComponent } from '../../../shared/layout/primitives/section.component';
import { InlineComponent } from '../../../shared/layout/primitives/inline.component';
import { StackComponent } from '../../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../../shared/layout/primitives/row.component';
import { ServingsControlComponent } from '../../../shared/ui/servings-control/servings-control.component';
import { ChipComponent } from '../../../shared/ui/chip/chip.component';
import { PageLayoutComponent } from '../../../shared/layout/primitives/page-layout.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { FooterComponent } from '../../../shared/layout/shell/footer/footer.component';
import { ModalService } from '../../../shared/layout/overlays/modal/modal.service';
import { ModalConfirmComponent } from '../../../shared/layout/overlays/modal/modal-confirm/modal-confirm.component';
import { LoadingComponent } from '../../../shared/layout/overlays/loading/loading.component';

@Component({
  selector: 'app-recipe',
  imports: [
    MinToHourPipe,
    LoadingComponent,
    IngredientQuantityPipe,
    TabsComponent,
    TabComponent,
    CommonModule,
    ButtonComponent,
    CapitalizePipe,
    PageLayoutComponent,
    ChipComponent,
    RowComponent,
    ServingsControlComponent,
    InlineComponent,
    ButtonComponent,
    TagComponent,
    HeaderShellComponent,
    SectionComponent,
    StackComponent,
    FooterComponent,
  ],
  templateUrl: './recipe.component.html',
  styleUrl: './recipe.component.css',
})
export class RecipeComponent {
  private router = inject(Router);
  private modalService = inject(ModalService);

  /** Services */
  private recipeStateService = inject(RecipeStateService);
  private mealCategoryService = inject(MealCategoryBackendService);
  private recipeService = inject(RecipeBackendService);
  private recipeCategoryBackendService = inject(RecipeCategoryBackendService);
  private cuisineService = inject(CuisineBackendService);
  private toastService = inject(ToastService);
  private location = inject(Location);

  /** Declaration of signals communicating with firestore */
  readonly dbCuisines: Signal<CuisineDocInBackend[]> =
    this.cuisineService.cuisines;

  readonly dbRecipes: Signal<RecipeWithId[]> = this.recipeService.recipes;

  readonly dbMealCategories: Signal<MealCategoryDocInBackend[]> =
    this.mealCategoryService.mealCategories;

  readonly dbRecipeCategories: Signal<MealCategoryDocInBackend[]> =
    this.recipeCategoryBackendService.recipeCategories;

  readonly cuisinesAreLoading = this.cuisineService.loading;
  readonly mealCategoriesAreLoading = this.mealCategoryService.loading;
  readonly recipesAreLoading = this.recipeService.loading;
  readonly recipeIsBeingDeleted = this.recipeService.deleting;

  /** Declaration of local signals */
  servings = signal<number>(0);

  // 'recipeId' is the exact parameter passed in the url: /recipes/:recipeId
  recipeId = input.required<string>();

  constructor() {
    effect(() => {
      this.servings.set(this.recipe().servings);
    });
  }

  goBack() {
    this.location.back();
  }

  readonly totalTime = computed(() => {
    const recipe = this.recipe();
    if (!recipe) return 0;

    return Number(recipe.preparationTime) + Number(recipe.cookingTime);
  });

  readonly pageIsLoading = computed(
    () =>
      this.recipesAreLoading() ||
      this.mealCategoriesAreLoading() ||
      this.cuisinesAreLoading(),
  );

  readonly originalServings: Signal<number> = computed(() => {
    return this.recipe().servings;
  });

  readonly recipe: Signal<RecipeWithId> = computed(() => {
    /** Get the 'recipe' object from the navigation state (if passed) */
    const recipeFromHistory = history.state.recipe;

    /** If the recipe has been provided by the history state, use it, otherwise
     * find it by comparing the id of all recipes to the one provided in the url
     */
    const recipe = recipeFromHistory
      ? recipeFromHistory
      : this.dbRecipes().find((recipe) => recipe.id === this.recipeId());

    console.log('RECIPE: ', recipe);
    return recipe;
  });

  imageLoadedMap: WritableSignal<{ [recipeId: string]: boolean }> = signal({});

  onImageLoad(recipeId: string): void {
    const current = this.imageLoadedMap();
    this.imageLoadedMap.set({ ...current, [recipeId]: true });
  }

  onServingsChange(value: number) {
    this.servings.set(value);
  }

  /** When the cuisines (retrieved from firestore) signal changes, find the one that matches the cuisineId from the state */
  readonly cuisineSearchedName: Signal<string> = computed(() => {
    // If the user has not specified any cuisine for the recipe
    if (this.recipe().cuisineId === 'none') {
      return 'none';
    }
    const cuisineSearched = this.dbCuisines().find(
      (cuisine) => cuisine.id === this.recipe().cuisineId,
    );

    return cuisineSearched?.name ?? 'none';
  });

  readonly mealCategorySearchedName: Signal<string> = computed(() => {
    // If the user has not specified any meal category for the recipe
    if (this.recipe().mealCategoryId === 'none') {
      return 'none';
    }

    const mealCategorySearched = this.dbMealCategories().find(
      (mealCategory) => mealCategory.id === this.recipe().mealCategoryId,
    );
    return mealCategorySearched?.name ?? 'none';
  });

  readonly computedMeasureRatio: Signal<number> = computed(() => {
    return this.servings() / this.originalServings();
  });

  readonly recipeCategoryNames = computed(() => {
    const recipeCategoryIds = this.recipe().recipeCategoryIds;

    return this.dbRecipeCategories()
      .filter((cat) => recipeCategoryIds?.includes(cat.id))
      .map((item) => item.name);
  });

  difficultyScale = computed(() =>
    this.recipe().difficulty === 'easy'
      ? 'scaleHigh'
      : this.recipe().difficulty === 'medium'
        ? 'scaleMedium'
        : 'scaleLow',
  );

  priceScale = computed(() =>
    this.recipe().price === 'low'
      ? 'scaleHigh'
      : this.recipe().price === 'normal'
        ? 'scaleMedium'
        : 'scaleLow',
  );

  priceClass = computed(() => {
    const price =
      this.recipe().price === 'high'
        ? 'high'
        : this.recipe().price === 'normal'
          ? 'medium'
          : 'low';

    return `text-scale-${price} dark:text-scaleDark-${price}`;
  });

  canShowTemplate: Signal<boolean> = computed(() => {
    if (
      this.recipe().mealCategoryId === 'none' &&
      this.recipe().cuisineId === 'none'
    ) {
      return true;
    } else if (
      this.recipe().mealCategoryId === 'none' &&
      this.recipe().cuisineId !== 'none'
    ) {
      return this.dbCuisines().length > 0;
      // return !this.cuisinesAreLoading();
    } else if (
      this.recipe().mealCategoryId !== 'none' &&
      this.recipe().cuisineId === 'none'
    ) {
      return this.dbMealCategories().length > 0;
      // return !this.mealCategoriesAreLoading();
    } else {
      return this.dbCuisines().length > 0 && this.dbMealCategories().length > 0;
      // return !(this.cuisinesAreLoading() && this.mealCategoriesAreLoading());
    }
  });

  decreaseServings() {
    if (this.servings() > 1) {
      this.servings.update((current) => current - 1);
    }
  }

  increaseServings() {
    this.servings.update((current) => current + 1);
  }

  onEditRecipe() {
    if (!this.recipe()) return;

    this.recipeStateService.updateRecipeState(this.recipe());

    this.router.navigate(['new-recipe'], {
      state: { recipe: this.recipe(), id: this.recipeId() },
    });
  }

  openDeleteModal(event: MouseEvent, recipeId: string) {
    event.stopPropagation();

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message: this.modalDeleteMessage(),
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        onConfirm: () => this.deleteRecipe(recipeId),
      },
    );
  }

  readonly modalDeleteMessage = computed(() => {
    return `Do you really want to remove '${this.recipe().title}'?`;
  });

  async deleteRecipe(recipeId: string) {
    try {
      await this.recipeService.removeRecipeFromStore(recipeId);

      this.toastService.show('Recipe removed from database', 'success');

      this.router.navigate(['recipes']);
    } catch (error) {
      this.toastService.show(
        'Recipe could not be removed from database',
        'error',
      );
    }
  }

  sanitizeUrl(url: string): string {
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url;
    }
    return url;
  }

  sortedIngredients = computed(() =>
    this.recipe().ingredients.sort((a, b) => a.name.localeCompare(b.name)),
  );

  commentLines = computed(() => {
    const lines = this.recipe()
      .comment?.split('\n')
      .map((line) => line.trim());

    return lines;
  });
}
