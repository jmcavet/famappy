import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import { RecipeDomainFacade } from '../../../../domain-facades/recipe.facade';
import { RecipeCategoryDomainFacade } from '../../../../domain-facades/recipeCategory.facade';
import { RecipeCategoryBackendService } from '../../../../services/backend/recipe-category.service';
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
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { ModalInputComponent } from '../../../../shared/layout/overlays/modal/modal-input/modal-input.component';

export interface TabDefinitionContext {
  buttonType: Signal<string>;
  recipeId: Signal<string>;
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

  difficultyOptions: Difficulty[] = ['easy', 'medium', 'hard'];
  priceOptions: Price[] = ['low', 'normal', 'high'];
  frequencyOptions: Frequency[] = ['weekly', 'monthly', 'yearly'];
  seasonOptions: Season[] = ['spring', 'summer', 'autumn', 'winter'];

  // imageUrl = this.recipeService.recipeState().imageUrl;
  readonly imageUrl = computed(() => this.recipeService.recipeState().imageUrl);

  private readonly _titleValue = signal('');
  readonly titleIsUnique = computed(() => {
    const normalizedTitle = this.normalizeTitle(this._titleValue());
    if (!normalizedTitle) return true;

    const editingRecipeId = this._ctx.recipeId();
    return !this.dbRecipes().some(
      (recipe) =>
        recipe.id !== editingRecipeId &&
        this.normalizeTitle(recipe.title) === normalizedTitle,
    );
  });

  form: FormGroup = this._formBuilder.group({
    title: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.minLength(3),
        Validators.maxLength(36),
      ],
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
  private readonly _contextConnected = signal(false);

  private readonly _titleValidityEffect = effect(() => {
    if (!this._contextConnected()) return;
    this.updateFormValidity();
  });

  public connect(ctx: TabDefinitionContext) {
    this._ctx = ctx;
    this._contextConnected.set(true);
    this.updateFormValidity();
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
    return this.titleIsUnique() ? '' : 'Title already exists in database.';
  });

  readonly servings = computed(() => {
    return this.recipeService.recipeState().servings;
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

    this._titleValue.set(this.form.get('title')?.value ?? '');

    /** Subscribe to any changes in the status of the form (whether it is valid or not)*/
    this.form.statusChanges.subscribe(() => {
      this.updateFormValidity();
    });

    this.form.get('title')?.valueChanges.subscribe((value: string) => {
      this._titleValue.set(value ?? '');
      this.updateFormValidity();
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

    this.updateFormValidity();
  }

  private updateFormValidity() {
    if (!this._contextConnected()) return;
    this.recipeService.setFormValidity(this.form.valid && this.titleIsUnique());
  }

  private normalizeTitle(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
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

  changeServings(servings: number) {
    this.recipeService.changeServings(servings);
  }

  scrollBackToCuisineButton() {
    const savedTargetTop = sessionStorage.getItem('newRecipeTargetTop');
    const targets = [
      ['scrollTargetCuisine', sessionStorage.getItem('scrollTargetCuisine')],
      [
        'scrollTargetMealCategory',
        sessionStorage.getItem('scrollTargetMealCategory'),
      ],
    ] as const;

    for (const [storageKey, targetId] of targets) {
      if (!targetId) continue;

      let attempts = 0;
      const scrollWhenRendered = () => {
        const target = document.getElementById(targetId);
        if (target) {
          let restoreFrames = 0;
          const restoreTargetPosition = () => {
            const desiredTop = Number(savedTargetTop);
            const currentTop = target.getBoundingClientRect().top;

            if (savedTargetTop !== null && Number.isFinite(desiredTop)) {
              const scrollDelta = currentTop - desiredTop;
              const scrollContainer = this.findScrollableAncestor(target);

              if (scrollContainer === document.scrollingElement) {
                window.scrollBy(0, scrollDelta);
              } else if (scrollContainer) {
                scrollContainer.scrollTop += scrollDelta;
              }
            } else if (restoreFrames === 0) {
              target.scrollIntoView({ behavior: 'auto', block: 'center' });
            }

            restoreFrames += 1;
            if (restoreFrames < 8) {
              requestAnimationFrame(restoreTargetPosition);
            } else {
              sessionStorage.removeItem('newRecipeTargetTop');
              sessionStorage.removeItem(storageKey);
            }
          };

          requestAnimationFrame(restoreTargetPosition);
          return;
        }

        attempts += 1;
        if (attempts < 10) requestAnimationFrame(scrollWhenRendered);
      };

      requestAnimationFrame(scrollWhenRendered);
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
    this.saveTargetViewportPosition('btn-cuisine');
    // Store the actual target (button) so that when going back from the /cuisine page to the /new-recipe page,
    // the view scrolls back automatically to the button itself and not the top of the page (default).
    sessionStorage.setItem('scrollTargetCuisine', 'btn-cuisine');
    sessionStorage.removeItem('scrollTargetMealCategory');
    this.router.navigate(['/cuisine']);
  }

  public navigateToMealCategoryPage() {
    this.saveTargetViewportPosition('btn-meal-category');
    // Store the actual target (button) so that when going back from the /meal-category page to the /new-recipe page,
    // the view scrolls back automatically to the button itself and not the top of the page (default).
    sessionStorage.setItem('scrollTargetMealCategory', 'btn-meal-category');
    sessionStorage.removeItem('scrollTargetCuisine');
    this.router.navigate(['/meal-category']);
  }

  private saveTargetViewportPosition(targetId: string) {
    const target = document.getElementById(targetId);
    if (!target) return;

    sessionStorage.setItem(
      'newRecipeTargetTop',
      String(target.getBoundingClientRect().top),
    );
  }

  private findScrollableAncestor(target: HTMLElement): HTMLElement | null {
    let ancestor = target.parentElement;

    while (ancestor && ancestor !== document.body) {
      const overflowY = getComputedStyle(ancestor).overflowY;
      if (
        (overflowY === 'auto' ||
          overflowY === 'scroll' ||
          overflowY === 'overlay') &&
        ancestor.scrollHeight > ancestor.clientHeight
      ) {
        return ancestor;
      }
      ancestor = ancestor.parentElement;
    }

    return document.scrollingElement as HTMLElement | null;
  }

  public onFileSelected(file: File) {
    this.recipeService.imageFile.set(file);
    this.recipeService.imageCropPending.set(true);
    this.recipeService.imageChange.set('replaced');

    // Revoke previous URL if it exists
    const currentUrl = this.imageUrl();
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    this.recipeService.updateProperty('imageUrl', URL.createObjectURL(file));
  }

  public applyImageCrop(croppedImage: Blob) {
    const currentFile = this.recipeService.imageFile();
    if (!currentFile) return;

    const croppedFile = new File([croppedImage], currentFile.name, {
      type: croppedImage.type || currentFile.type || 'image/jpeg',
      lastModified: Date.now(),
    });

    const currentUrl = this.imageUrl();
    if (currentUrl) URL.revokeObjectURL(currentUrl);

    this.recipeService.imageFile.set(croppedFile);
    this.recipeService.imageCropPending.set(false);
    this.recipeService.updateProperty(
      'imageUrl',
      URL.createObjectURL(croppedFile),
    );
  }

  public useOriginalImage() {
    this.recipeService.imageCropPending.set(false);
  }

  /** Private methods */
  private async addRecipeCategory(recipeCategoryName: string) {
    this.recipeCategoryService.saveRecipeCategoryIntoStore(recipeCategoryName);
  }

  public removeImage() {
    this.recipeService.updateProperty('imageUrl', '');

    this.recipeService.imageFile.set(null);
    this.recipeService.imageCropPending.set(false);
    this.recipeService.imageChange.set('removed');
  }
}
