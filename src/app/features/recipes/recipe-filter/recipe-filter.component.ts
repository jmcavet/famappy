import {
  Component,
  computed,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { RecipeWithId } from '../components/recipe-card/recipe.model';
import {
  CuisineDocInBackend,
  MealCategoryDocInBackend,
  RecipeCategoryDocInBackend,
} from '../../../models/cuisine.model';
import { RecipeStateService } from '../../../services/state/recipe.service';
import { Router } from '@angular/router';
import { FilterSectionComponent } from './components/filter-section/filter-section.component';
import { Difficulty, Frequency, Season } from '../../../models/recipe.model';
import { FilterGroupDefaultComponent } from './components/filter-group-default/filter-group-default.component';
import { RecipeBackendService } from '../../../services/backend/recipe.service';
import {
  IngredientCategoryDocInBackend,
  IngredientDocInBackend,
} from '../../../models/ingredient.model';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ChipComponent } from '../../../shared/ui/chip/chip.component';
import { SegmentedControlComponent } from '../../../shared/ui/segmented-control/segmented-control.component';
import { ToggleBtnWithIconComponent } from '../../../shared/ui/toggle-btn-with-icon/toggle-btn-with-icon.component';
import { Location } from '@angular/common';

type AllowedStringArrayKeys = 'mealCategoryId' | 'recipeCategoryIds';

interface PropertyTag {
  name: Difficulty;
  selected: boolean;
}

interface FrequencyTag {
  name: Frequency;
  selected: boolean;
}

interface SeasonTag {
  name: Season;
  selected: boolean;
}

@Component({
  selector: 'app-recipe-filter',
  imports: [
    FilterSectionComponent,
    FilterGroupDefaultComponent,
    ButtonComponent,
    ChipComponent,
    ToggleBtnWithIconComponent,
  ],
  templateUrl: './recipe-filter.component.html',
  styleUrl: './recipe-filter.component.css',
})
export class RecipeFilterComponent {
  private router = inject(Router);
  private location = inject(Location);

  private recipeStateService = inject(RecipeStateService);
  private recipeBackendService = inject(RecipeBackendService);

  readonly dbRecipes: Signal<RecipeWithId[]> =
    this.recipeBackendService.recipes;

  filteredRecipes = signal<RecipeWithId[]>(history.state.filteredRecipes ?? []);
  mealCategories = signal<MealCategoryDocInBackend[]>(
    history.state.mealCategories ?? [],
  );
  cuisines = signal<CuisineDocInBackend[]>(history.state.cuisines ?? []);
  recipeCategories = signal<RecipeCategoryDocInBackend[]>(
    history.state.recipeCategories ?? [],
  );
  ingredients = signal<IngredientDocInBackend[]>(
    history.state.ingredients ?? [],
  );
  ingredientCategories = signal<IngredientCategoryDocInBackend[]>(
    history.state.ingredientCategories ?? [],
  );

  /** Declaration of local signals */
  recipeState = this.recipeStateService.recipeState;
  stateFilterDifficulties = this.recipeState().filter.difficulties;
  stateFilterPrices = this.recipeState().filter.prices;
  stateFilterFrequencies = this.recipeState().filter.frequencies;
  stateFilterSeasons = this.recipeState().filter.seasons;
  ingredientFilterMode = computed(
    () => this.recipeState().filter.ingredientFilterMode,
  );

  ingredientIds = computed(() => this.recipeState().filter.ingredientIds);

  ingredientsFiltered = computed(() => {
    const ingredientsFiltered = this.ingredients().filter((ingredient) => {
      return this.ingredientIds().includes(ingredient.id);
    });

    return ingredientsFiltered;
  });

  mealCategoriesSelected = signal<string[]>(
    this.recipeState().filter.mealCategories,
  );

  cuisinesSelected = signal<string[]>(this.recipeState().filter.cuisines);

  recipeCategoriesSelected = signal<string[]>(
    this.recipeState().filter.recipeCategories,
  );

  ingredientCategoriesSelected = signal<string[]>(
    this.recipeState().filter.ingredientCategories,
  );

  ingredientsSelected = signal<string[]>(
    this.recipeState().filter.ingredientIds,
  );

  mealCategoryTags = computed(() => {
    const mealCategoryIds = this.filteredRecipes().map(
      (recipe) => recipe.mealCategoryId,
    );
    const uniqueNonEmpty = [
      ...new Set(mealCategoryIds.filter((str) => str.trim() !== '')),
    ];

    return this.mealCategories()
      .filter((cat) => uniqueNonEmpty.includes(cat.id))
      .map((obj) => {
        return { id: obj.id, name: obj.name, disabled: false };
      });
  });

  cuisineTags = computed(() => {
    const cuisineIds = this.filteredRecipes().map((recipe) => recipe.cuisineId);
    const uniqueNonEmpty = [
      ...new Set(cuisineIds.filter((str) => str.trim() !== '')),
    ];

    return this.cuisines()
      .filter((cuisine) => uniqueNonEmpty.includes(cuisine.id))
      .map((obj) => {
        return { id: obj.id, name: obj.name, disabled: false };
      });
  });

  recipeCategoryTags = computed(() => {
    const recipeCategoryIds = this.filteredRecipes().map(
      (recipe) => recipe.recipeCategoryIds,
    );
    const uniqueNonEmpty = [
      ...new Set(recipeCategoryIds.flat().filter((str) => str.trim() !== '')),
    ];

    return this.recipeCategories()
      .filter((cat) => uniqueNonEmpty.includes(cat.id))
      .map((obj) => {
        return { id: obj.id, name: obj.name, disabled: false };
      });
  });

  /** USE THIS SIGNAL WHENEVER I WANT TO START FILTER BY INGREDIENTS... */
  ingredientTags = computed(() => {
    const recipeIngredients = this.filteredRecipes().map(
      (recipe) => recipe.ingredients,
    );

    const recipeIngredientIds = recipeIngredients
      .flat()
      .map((ingredient) => ingredient.id);

    const uniqueRecipeIngredientIds = [
      ...new Set(recipeIngredientIds.flat().filter((str) => str.trim() !== '')),
    ];

    return this.ingredients()
      .filter((ingredient) => uniqueRecipeIngredientIds.includes(ingredient.id))
      .map((obj) => {
        return { id: obj.id, name: obj.name, disabled: false };
      });
  });

  ingredientCategoryTags = computed(() => {
    const recipeIngredients = this.filteredRecipes().map(
      (recipe) => recipe.ingredients,
    );

    const recipeIngredientIds = recipeIngredients
      .flat()
      .map((ingredient) => ingredient.id);

    const uniqueRecipeIngredientIds = [
      ...new Set(recipeIngredientIds.flat().filter((str) => str.trim() !== '')),
    ];

    const ingredientCategoryIds = this.ingredients()
      .filter((ingredient) => uniqueRecipeIngredientIds.includes(ingredient.id))
      .map((obj) => obj.categoryId);

    const uniqueIngredientCategoryIds = [
      ...new Set(ingredientCategoryIds.filter((str) => str?.trim() !== '')),
    ];

    return this.ingredientCategories().filter((cat) =>
      uniqueIngredientCategoryIds.includes(cat.id),
    );
  });

  difficultyOptionTags = signal<PropertyTag[]>([
    { name: 'low', selected: this.stateFilterDifficulties.includes('low') },
    {
      name: 'normal',
      selected: this.stateFilterDifficulties.includes('normal'),
    },
    { name: 'high', selected: this.stateFilterDifficulties.includes('high') },
  ]);

  priceOptionTags = signal<PropertyTag[]>([
    { name: 'low', selected: this.stateFilterPrices.includes('low') },
    { name: 'normal', selected: this.stateFilterPrices.includes('normal') },
    { name: 'high', selected: this.stateFilterPrices.includes('high') },
  ]);

  frequencyOptionTags = signal<FrequencyTag[]>([
    {
      name: 'weekly',
      selected: this.stateFilterFrequencies.includes('weekly'),
    },
    {
      name: 'monthly',
      selected: this.stateFilterFrequencies.includes('monthly'),
    },
    {
      name: 'yearly',
      selected: this.stateFilterFrequencies.includes('yearly'),
    },
  ]);

  seasonOptionTags = signal<SeasonTag[]>([
    { name: 'spring', selected: this.stateFilterSeasons.includes('spring') },
    { name: 'summer', selected: this.stateFilterSeasons.includes('summer') },
    { name: 'autumn', selected: this.stateFilterSeasons.includes('autumn') },
    { name: 'winter', selected: this.stateFilterSeasons.includes('winter') },
  ]);

  recipeCategoryNames = computed(() => {
    const recipeCategoryIds = this.filteredRecipes().map(
      (recipe) => recipe.recipeCategoryIds,
    );

    const uniqueNonEmpty = [
      ...new Set(recipeCategoryIds.flat().filter((str) => str.trim() !== '')),
    ];

    const recipeCategoryNames = this.recipeCategories()
      .filter((cat) => uniqueNonEmpty.includes(cat.id))
      .map((obj) => {
        return { id: obj.id, name: obj.name, disabled: false };
      });

    return recipeCategoryNames;
  });

  selectDeselectAllItems(
    selectedItemsSignal: WritableSignal<string[]>,
    allTagsSignal: Signal<{ id: string; name: string }[]>,
  ) {
    const allTags = allTagsSignal().map((tag) => tag.id);

    if (selectedItemsSignal().length === allTagsSignal().length) {
      selectedItemsSignal.update((curr) => []);
    } else {
      selectedItemsSignal.update((curr) => allTags);
    }
  }

  selectTag<T>(selectedItemsSignal: WritableSignal<T[]>, tagId: T) {
    if (!selectedItemsSignal().includes(tagId)) {
      selectedItemsSignal.update((curr) => [...curr, tagId]);
    } else {
      selectedItemsSignal.update((curr) => curr.filter((el) => el !== tagId));
    }
  }

  createToggleSelectAll<T>(
    selectedItemsSignal: Signal<string[]>, // E.g. this.cuisinesSelected signal: ['111'] if only 1 is being selected by user
    itemTags: Signal<{ id: string; name: string }[]>, // e.g. [{id: '111', name: 'italian' }, {id: '222', name: 'french' }] for the cuisine tags
  ) {
    return computed(() => {
      return selectedItemsSignal().length === itemTags().length
        ? 'Deselect all'
        : 'Select all';
    });
  }

  titi(
    recipesFilteredByTagSelected: any[],
    tags: WritableSignal<any[]>,
    propertySignal: WritableSignal<any[]>,
    key: AllowedStringArrayKeys,
  ) {
    /** If 2 recipes are filtered and the first one has ['id1'] and the second one ['id1', 'id2'],
     * then the category ids for these 2 selected recipes are: ['id1', 'id2']
     */
    const selectedBlablaIds = [
      ...new Set(recipesFilteredByTagSelected.flatMap((obj) => obj[key])),
    ];

    const propertyIds = [
      ...new Set(
        this.filteredRecipes()
          .map((obj) => obj[key])
          .flat()
          .filter((str) => str.trim() !== ''),
      ),
    ];

    const _tags = propertySignal()
      .filter((cat) => propertyIds.includes(cat.id))
      .map((obj) => {
        return {
          id: obj.id,
          name: obj.name,
          disabled:
            selectedBlablaIds.length === 0
              ? false
              : !selectedBlablaIds.includes(obj.id),
        };
      });

    console.log('_tags: ', _tags);
    tags.set(_tags);
  }

  toto(
    recipesFilteredByTagSelected: any[],
    tags: WritableSignal<any[]>,
    key: any,
  ) {
    const correspondingProperties = [
      ...new Set(recipesFilteredByTagSelected.map((obj) => obj[key])),
    ];

    tags.update((curr) =>
      curr.map((item) => {
        return {
          ...item,
          disabled:
            correspondingProperties.length === 0
              ? false
              : !correspondingProperties.includes(item.name),
        };
      }),
    );
  }

  nbFilters = computed(() => {
    const mealCategoriesFilterActivated =
      this.mealCategoriesSelected().length > 0 ? 1 : 0;
    const cuisinesFilterActivated = this.cuisinesSelected().length > 0 ? 1 : 0;
    const recipeCategoriesFilterActivated =
      this.recipeCategoriesSelected().length > 0 ? 1 : 0;

    const ingredientCategoriesFilterActivated =
      this.ingredientCategoriesSelected().length > 0 ? 1 : 0;

    const difficultyFilterActivated =
      this.difficultyOptionTags().filter((tag) => tag.selected).length > 0
        ? 1
        : 0;

    const priceFilterActivated =
      this.priceOptionTags().filter((tag) => tag.selected).length > 0 ? 1 : 0;

    const frequencyFilterActivated =
      this.frequencyOptionTags().filter((tag) => tag.selected).length > 0
        ? 1
        : 0;

    const seasonFilterActivated =
      this.seasonOptionTags().filter((tag) => tag.selected).length > 0 ? 1 : 0;

    const ingredientsFilterActivated =
      this.ingredientsFiltered().length > 0 ? 1 : 0;

    return (
      mealCategoriesFilterActivated +
      cuisinesFilterActivated +
      recipeCategoriesFilterActivated +
      ingredientCategoriesFilterActivated +
      difficultyFilterActivated +
      priceFilterActivated +
      frequencyFilterActivated +
      seasonFilterActivated +
      ingredientsFilterActivated
    );
  });

  readonly nbRecipesFiltered = computed(() => {
    const selectedDifficultyTags = this.difficultyOptionTags().filter(
      (tag) => tag.selected,
    );

    const selectedPriceTags = this.priceOptionTags().filter(
      (tag) => tag.selected,
    );

    const selectedFrequencyTags = this.frequencyOptionTags().filter(
      (tag) => tag.selected,
    );

    const selectedSeasonTags = this.seasonOptionTags().filter(
      (tag) => tag.selected,
    );

    console.log('ingredientsSelected: ', this.ingredientsSelected());
    // Condition: NONE of the chips are selected (= all are activated per default)
    if (
      this.mealCategoriesSelected().length === 0 &&
      this.cuisinesSelected().length === 0 &&
      this.recipeCategoriesSelected().length === 0 &&
      this.ingredientCategoriesSelected().length === 0 &&
      this.ingredientsSelected().length === 0 &&
      selectedDifficultyTags.length === 0 &&
      selectedPriceTags.length === 0 &&
      selectedFrequencyTags.length === 0 &&
      selectedSeasonTags.length === 0 &&
      this.ingredientsFiltered().length === 0
    ) {
      return this.filteredRecipes().length;
    }

    return this.filteredRecipes().filter((obj) => {
      const cond1 =
        this.mealCategoriesSelected().length === 0
          ? true
          : this.mealCategoriesSelected().includes(obj.mealCategoryId);

      const cond2 =
        this.cuisinesSelected().length === 0
          ? true
          : this.cuisinesSelected().includes(obj.cuisineId);

      const cond3 =
        this.recipeCategoriesSelected().length === 0
          ? true
          : obj.recipeCategoryIds.some((id) =>
              this.recipeCategoriesSelected().includes(id),
            );

      const cond4 =
        selectedDifficultyTags.length === 0
          ? true
          : selectedDifficultyTags
              .map((tag) => tag.name)
              .includes(obj.difficulty);

      const cond5 =
        selectedPriceTags.length === 0
          ? true
          : selectedPriceTags.map((tag) => tag.name).includes(obj.price);

      const cond6 =
        selectedFrequencyTags.length === 0
          ? true
          : selectedFrequencyTags
              .map((tag) => tag.name)
              .includes(obj.frequency);

      const cond7 =
        selectedSeasonTags.length === 0
          ? true
          : obj.seasonsSelected.some((season) =>
              selectedSeasonTags.map((tag) => tag.name).includes(season),
            );

      let cond8 = true;
      if (this.ingredientCategoriesSelected().length > 0) {
        // Each object has potentially multiple ingredients. Get their ids in a list
        const ingredientIds = obj.ingredients.map(
          (ingredient) => ingredient.id,
        );

        // Get the ingredients (among all from the database) which id can be found in the ingredientIds.
        // Then return a list of their categoryId property.
        const recipeIngredientCategoryIds = this.ingredients()
          .filter((ingredient) => ingredientIds.includes(ingredient.id))
          .map((ingredient) => ingredient.categoryId);

        // Get a unique set of the 'recipeIngredientCategories' list
        const uniqueRecipeIngredientCategoryIds = [
          ...new Set(
            recipeIngredientCategoryIds.filter((str) => str.trim() !== ''),
          ),
        ];

        // The condition is true if at least one of the recipe ingredient category ids is included
        // in the list of ingredient category tag selected by the user
        cond8 = this.ingredientCategoriesSelected().some((item) =>
          uniqueRecipeIngredientCategoryIds.includes(item),
        );
      }

      let cond9 = true;
      if (this.ingredientFilterMode() === 0) {
        cond9 =
          this.ingredientsSelected().length === 0
            ? true
            : obj.ingredients.some((ingredient) =>
                this.ingredientsSelected().includes(ingredient.id),
              );
      } else {
        cond9 =
          this.ingredientsSelected().length === 0
            ? true
            : this.ingredientsSelected().every((el) =>
                obj.ingredients.map((item) => item.id).includes(el),
              );
      }

      const cond10 = obj.ingredients.some((ingredient) =>
        this.ingredientsFiltered().map((ingredientFiltered) =>
          ingredientFiltered.id.includes(ingredient.id),
        ),
      );

      return (
        cond1 &&
        cond2 &&
        cond3 &&
        cond4 &&
        cond5 &&
        cond6 &&
        cond7 &&
        cond8 &&
        cond9 &&
        cond10
      );
    }).length;
  });

  validateFilters() {
    this.recipeStateService.saveNumberFilters(this.nbFilters());

    this.recipeStateService.saveFilter(
      this.mealCategoriesSelected(),
      this.cuisinesSelected(),
      this.recipeCategoriesSelected(),
      this.ingredientCategoriesSelected(),
      this.ingredientsFiltered().map((obj) => obj.id),
      this.difficultyOptionTags()
        .filter((tag) => tag.selected)
        .map((tag) => tag.name),
      this.priceOptionTags()
        .filter((tag) => tag.selected)
        .map((tag) => tag.name),
      this.frequencyOptionTags()
        .filter((tag) => tag.selected)
        .map((tag) => tag.name),
      this.seasonOptionTags()
        .filter((tag) => tag.selected)
        .map((tag) => tag.name),
      this.ingredientFilterMode(),
    );

    // this.router.navigate(['/recipes']);
    this.location.back();
  }

  cancel() {
    // this.router.navigate(['/recipes']);
    this.location.back();
  }

  navigateToFilterIngredients() {
    this.router.navigate(['/filter-ingredients']);
  }

  onClearFilter() {
    this.mealCategoriesSelected.update((curr) => []);
    this.cuisinesSelected.update((curr) => []);
    this.recipeCategoriesSelected.update((curr) => []);
    this.ingredientCategoriesSelected.update((curr) => []);
    this.difficultyOptionTags.update((tags) =>
      tags.map((tag) => ({
        ...tag,
        selected: false,
      })),
    );
    this.priceOptionTags.update((tags) =>
      tags.map((tag) => ({
        ...tag,
        selected: false,
      })),
    );
    this.frequencyOptionTags.update((tags) =>
      tags.map((tag) => ({
        ...tag,
        selected: false,
      })),
    );
    this.seasonOptionTags.update((tags) =>
      tags.map((tag) => ({
        ...tag,
        selected: false,
      })),
    );
  }

  resetFilterIngredientIds() {
    this.recipeStateService.resetFilterIngredientIds();

    this.ingredientsSelected.update(() => []);
  }

  toggleIngredientFilterMode(position: number) {
    this.recipeState.update((state) => ({
      ...state,
      filter: {
        ...state.filter,
        ingredientFilterMode: position,
      },
    }));
  }

  toggleTag(id: string) {
    const current = this.ingredientsSelected();
    this.ingredientsSelected.set(
      current.includes(id)
        ? current.filter((el) => el !== id)
        : [...current, id],
    );
  }
}
