import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { ModalService } from '../../../../shared/modal/modal.service';
import { RecipeDomainFacade } from '../../../../domain-facades/recipe.facade';
import { RecipeCategoryDomainFacade } from '../../../../domain-facades/recipeCategory.facade';
import { RecipeCategoryBackendService } from '../../../../services/backend/recipe-category.service';
import { ModalInputComponent } from '../../../../shared/components/modal-input/modal-input.component';
import { RecipeStateService } from '../../../../services/state/recipe.service';
import {
  Difficulty,
  Frequency,
  Price,
  Season,
} from '../../../../models/recipe.model';
import { RecipeCategoryDocInBackend } from '../../../../models/cuisine.model';
import { Router } from '@angular/router';
import { MealCategoryDomainFacade } from '../../../../domain-facades/mealCategory.facade';
import { CuisineDomainFacade } from '../../../../domain-facades/cuisine.facade';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface TabDefinitionContext {
  buttonType: Signal<string>;
}

/** This UI facade may inject domain facades. However, domain facades must NEVER inject UI facades!! */
@Injectable()
export class TabDefinitionFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */
  /** Domain access (business state & actions) */
  private MealCategoryDomainFacade = inject(MealCategoryDomainFacade);
  private cuisineDomainFacade = inject(CuisineDomainFacade);
  private recipeDomainFacade = inject(RecipeDomainFacade);
  private recipeCategoryDomainFacade = inject(RecipeCategoryDomainFacade);
  private recipeCategoryService = inject(RecipeCategoryBackendService);

  private modalService = inject(ModalService);

  private router = inject(Router);
  private _formBuilder = inject(FormBuilder);

  /** Transitional state */
  private recipeService = inject(RecipeStateService);

  /* ================================
   * Domain-derived state
   * ================================ */
  readonly dbMealCategories = this.MealCategoryDomainFacade.dbMealCategories;
  readonly dbRecipes = this.recipeDomainFacade.dbRecipes;
  readonly dbCuisines = this.cuisineDomainFacade.dbCuisines;

  readonly dbRecipeCategories =
    this.recipeCategoryDomainFacade.dbRecipeCategories;
  readonly recipeCategoriesSaving =
    this.recipeCategoryDomainFacade.recipeCategoriesSaving;
  readonly recipeCategoriesDeleting =
    this.recipeCategoryDomainFacade.recipeCategoriesDeleting;
  readonly recipeCategoriesUpdating =
    this.recipeCategoryDomainFacade.recipeCategoriesUpdating;

  difficultyOptions: Difficulty[] = ['low', 'normal', 'high'];
  priceOptions: Price[] = ['low', 'normal', 'high'];
  frequencyOptions: Frequency[] = ['weekly', 'monthly', 'yearly'];
  seasonOptions: Season[] = ['spring', 'summer', 'autumn', 'winter'];

  // imageUrl = this.recipeService.recipeState().imageUrl;
  readonly imageUrl = computed(() => this.recipeService.recipeState().imageUrl);

  titleIsUnique = signal<boolean>(true);

  form: FormGroup = this._formBuilder.group({
    title: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(36)],
    ],
    preparationTime: [
      '',
      [Validators.required, Validators.pattern(/^[0-9]*$/)],
    ],
    cookingTime: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    servings: [null],
    difficulty: [null],
    price: [null],
    frequency: ['', [Validators.required]],
    cuisine: [null],
    mealCategory: [null],
    source: [
      '',
      [Validators.pattern(/^(https?:\/\/|www\.)[^\s$.?#].[^\s]*$/i)],
    ],
    comment: [''],
  });

  /* ================================
   * Component context (set via connect())
   * ================================ */
  /** Private signals */
  private _ctx!: TabDefinitionContext;
  public connect(ctx: TabDefinitionContext) {
    this._ctx = ctx;
  }

  /* ================================
   * Computed signals
   * ================================ */
  readonly dataLoading = computed(() => {
    return (
      this.recipeCategoriesSaving() ||
      this.recipeCategoriesDeleting() ||
      this.recipeCategoriesUpdating()
    );
  });

  readonly price = computed(() => this.recipeService.recipeState().price);
  readonly frequency = computed(
    () => this.recipeService.recipeState().frequency,
  );
  readonly difficulty = computed(
    () => this.recipeService.recipeState().difficulty,
  );
  readonly seasonsSelected = computed(
    () => this.recipeService.recipeState().seasonsSelected,
  );
  readonly imageFile = computed(() => this.recipeService.imageFile());

  readonly selectedCategoryIds = computed<Set<string>>(() => {
    return new Set(this.recipeService.recipeState().recipeCategoryIds);
  });

  /** When the cuisines (retrieved from firestore) signal changes, find the one that matches the cuisineId from the state */
  readonly cuisineName = computed(() => {
    const cuisineSearched = this.dbCuisines().find(
      (cuisine) => cuisine.id === this.recipeService.recipeState().cuisineId,
    );
    return cuisineSearched?.name ?? 'none';
  });

  readonly mealCategoryName = computed(() => {
    const mealCategorySearched = this.dbMealCategories().find(
      (mealCategory) =>
        mealCategory.id === this.recipeService.recipeState().mealCategoryId,
    );
    return mealCategorySearched?.name ?? 'none';
  });

  readonly messageUniqueTitle = computed(() => {
    if (this._ctx.buttonType() === 'Update') {
      return '';
    }

    return this.titleIsUnique() ? '' : 'Title already exists in database.';
  });

  readonly messageServings = computed(() => {
    return `${this.recipeService.recipeState().servings} ${
      this.recipeService.recipeState().servings === 1 ? 'person' : 'people'
    }`;
  });

  /* ================================
   * Methods
   * ================================ */

  /** Public UI methods */
  public initializeForm() {
    if (!this.recipeService.mustPreserveState()) {
      this.recipeService.resetRecipeState();
    } else {
      this.recipeService.mustPreserveState.set(false);
    }

    const state = this.recipeService.recipeState();
    this.form.patchValue({
      title: state.title,
      preparationTime: state.preparationTime,
      cookingTime: state.cookingTime,
      servings: state.servings,
      difficulty: state.difficulty,
      price: state.price,
      frequency: state.frequency,
      cuisine: state.cuisineId,
      mealCategory: state.mealCategoryId,
      source: state.source,
      comment: state.comment,
    });

    /** Subscribe to any changes in the status of the form (whether it is valid or not)*/
    this.form.statusChanges.subscribe(() => {
      let formIsValid;
      if (this._ctx.buttonType() === 'Save') {
        formIsValid = this.form.valid && this.titleIsUnique();
      } else {
        formIsValid = this.form.valid && this.titleIsUnique();
      }
      this.recipeService.setFormValidity(formIsValid);
    });

    this.form.get('title')?.valueChanges.subscribe((value: string) => {
      const titleExists = this.dbRecipes().some((item) => item.title === value);
      this.titleIsUnique.set(!titleExists);

      let formIsValid;
      if (this._ctx.buttonType() === 'Save') {
        formIsValid = this.form.valid && this.titleIsUnique();
      } else {
        formIsValid = this.form.valid && this.titleIsUnique();
      }
      this.recipeService.setFormValidity(formIsValid);
    });

    /** Subscribe to the 'title' input field value changes */
    this.form.get('title')?.valueChanges.subscribe((value) => {
      this.recipeService.updateProperty('title', value);
    });

    /** Subscribe to the 'preparationTime' input field value changes */
    this.form.get('preparationTime')?.valueChanges.subscribe((value) => {
      this.recipeService.updateProperty('preparationTime', value);
    });

    /** Subscribe to the 'cookingTime' input field value changes */
    this.form.get('cookingTime')?.valueChanges.subscribe((value) => {
      this.recipeService.updateProperty('cookingTime', value);
    });

    /** Subscribe to the 'source' input field value changes */
    this.form.get('source')?.valueChanges.subscribe((value) => {
      this.recipeService.updateProperty('source', value);
    });

    /** Subscribe to the 'comment' text area value changes */
    this.form.get('comment')?.valueChanges.subscribe((value) => {
      this.recipeService.updateProperty('comment', value);
    });
  }

  resetRecipeState() {
    this.recipeService.resetRecipeState();
    this.form.patchValue({
      title: this.recipeService.initialRecipeState.title,
      preparationTime: this.recipeService.initialRecipeState.preparationTime,
      cookingTime: this.recipeService.initialRecipeState.cookingTime,
      source: this.recipeService.initialRecipeState.source,
      comment: this.recipeService.initialRecipeState.comment,
      imageFile: this.recipeService.imageFile,
    });
  }

  scrollBackToCuisineButton() {
    // Once the page is viewed, scroll back to the cuisine button.
    const idCuisine = sessionStorage.getItem('scrollTargetCuisine');
    if (idCuisine) {
      const el = document.getElementById(idCuisine);
      if (el) {
        el.scrollIntoView({ behavior: 'auto' });
      }
      sessionStorage.removeItem('scrollTargetCuisine');
    }

    // Once the page is viewed, scroll back to the meal-category button.
    const idMealCategory = sessionStorage.getItem('scrollTargetMealCategory');
    if (idMealCategory) {
      const el = document.getElementById(idMealCategory);
      if (el) {
        el.scrollIntoView({ behavior: 'auto' });
      }
      sessionStorage.removeItem('scrollTargetMealCategory');
    }
  }

  public openAddRecipeCategoryInputModal(event: MouseEvent) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Enter new recipe category',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.dbRecipeCategories(),
      },
      {
        onConfirm: (name: string) => {
          (async () => {
            await this.addRecipeCategory(name);
          })();
        },
      },
    );
  }

  public onTitleChange(value: string) {
    const existingRecipeTitles = this.dbRecipes().find(
      (item) => item.title === value,
    );
    this.titleIsUnique.set(existingRecipeTitles === undefined);
  }

  public decreaseServings() {
    this.recipeService.decreaseServings();
  }

  public increaseServings() {
    this.recipeService.increaseServings();
  }

  public setDifficulty(difficultySelected: Difficulty) {
    this.recipeService.updateProperty('difficulty', difficultySelected);
  }

  public setPrice(priceSelected: Price) {
    this.recipeService.updateProperty('price', priceSelected);
  }

  public setFrequency(frequencySelected: Frequency) {
    this.recipeService.updateProperty('frequency', frequencySelected);
  }

  public setSeason(seasonSelected: Season) {
    this.recipeService.setSeason(seasonSelected);
  }

  public setRecipeCategory(recipeCategorySelected: RecipeCategoryDocInBackend) {
    this.recipeService.setRecipeCategory(recipeCategorySelected);
  }

  public navigateToCuisinePage() {
    // Store the actual target (button) so that when going back from the /cuisine page to the /new-recipe page,
    // the view scrolls back automatically to the button itself and not the top of the page (default).
    sessionStorage.setItem('scrollTargetCuisine', 'btn-cuisine');
    sessionStorage.removeItem('scrollTargetMealCategory');
    this.router.navigate(['/cuisine']);
  }

  public navigateToMealCategoryPage() {
    // Store the actual target (button) so that when going back from the /meal-category page to the /new-recipe page,
    // the view scrolls back automatically to the button itself and not the top of the page (default).
    sessionStorage.setItem('scrollTargetMealCategory', 'btn-meal-category');
    sessionStorage.removeItem('scrollTargetCuisine');
    this.router.navigate(['/meal-category']);
  }

  public async onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (!file) return;

    this.recipeService.imageFile.set(file);

    // Revoke previous URL if it exists
    const currentUrl = this.imageUrl();
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    // this.imageUrl = URL.createObjectURL(file);
    this.recipeService.updateProperty('imageUrl', URL.createObjectURL(file));
  }

  /** Private methods */
  private async addRecipeCategory(recipeCategoryName: string) {
    this.recipeCategoryService.saveRecipeCategoryIntoStore(recipeCategoryName);
  }

  public removeImage() {
    this.recipeService.updateProperty('imageUrl', '');

    this.recipeService.imageFile.set(null);
  }
}
