import {
  Component,
  computed,
  inject,
  Input,
  Signal,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ModalInputComponent } from '../../../../shared/components/modal-input/modal-input.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { RecipeBackendService } from '../../../../services/backend/recipe.service';
import { CuisineBackendService } from '../../../../services/backend/cuisine.service';
import { RecipeCategoryBackendService } from '../../../../services/backend/recipe-category.service';
import { FirestoreService } from '../../../../services/backend/generic.service';
import { MealCategoryBackendService } from '../../../../services/backend/meal-category.service';
import {
  MealCategoryDocInBackend,
  RecipeCategoryDocInBackend,
} from '../../../../models/cuisine.model';
import { RecipeStateService } from '../../../../services/state/recipe.service';
import {
  Difficulty,
  Frequency,
  Price,
  Season,
} from '../../../../models/recipe.model';
import { RecipeWithId } from '../../../recipes/components/recipe-card/recipe.model';

@Component({
  selector: 'app-tab-definition',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CapitalizePipe,
    ButtonComponent,
    ModalInputComponent,
    NgClass,
    LoadingComponent,
  ],
  templateUrl: './tab-definition.component.html',
  styleUrl: './tab-definition.component.css',
})
export class TabDefinitionComponent {
  private router = inject(Router);
  private _formBuilder = inject(FormBuilder);

  /** Services */
  private stateRecipeService = inject(RecipeStateService);
  private recipeService = inject(RecipeBackendService);
  private cuisineService = inject(CuisineBackendService);
  private recipeCategoryService = inject(RecipeCategoryBackendService);
  private firestoreService = inject(FirestoreService);
  private mealCategoryService = inject(MealCategoryBackendService);

  difficultyOptions: Difficulty[] = ['low', 'normal', 'high'];
  priceOptions: Price[] = ['low', 'normal', 'high'];
  frequencyOptions: Frequency[] = ['weekly', 'monthly', 'yearly'];
  seasonOptions: Season[] = ['spring', 'summer', 'autumn', 'winter'];

  /** Declaration of signals communicating with firestore */
  readonly dbMealCategories: Signal<MealCategoryDocInBackend[]> =
    this.mealCategoryService.mealCategories;
  readonly dbRecipeCategories: Signal<MealCategoryDocInBackend[]> =
    this.recipeCategoryService.recipeCategories;
  readonly dbRecipes: Signal<RecipeWithId[]> = this.recipeService.recipes;

  /** Declaration of local signals */
  recipeState = this.stateRecipeService.recipeState;
  imageUrl = this.recipeState().imageUrl;
  titleIsUnique = signal<boolean>(true);
  showModalInput = signal<boolean>(false);
  isLoadingRecipeCategories = signal<boolean>(false);

  /** Declaration of recipe state signals */
  readonly price = computed(() => this.recipeState().price);
  readonly frequency = computed(() => this.recipeState().frequency);
  readonly difficulty = computed(() => this.recipeState().difficulty);
  readonly seasonsSelected = computed(() => this.recipeState().seasonsSelected);
  readonly imageFile = computed(() => this.stateRecipeService.imageFile());

  @Input() buttonType: string = '';

  form: FormGroup = this._formBuilder.group({});

  readonly selectedCategoryIds = computed<Set<string>>(() => {
    return new Set(this.recipeState().recipeCategoryIds);
  });

  /** When the cuisines (retrieved from firestore) signal changes, find the one that matches the cuisineId from the state */
  readonly cuisineName = computed(() => {
    const cuisines = this.cuisineService.cuisines();
    const cuisineSearched = cuisines.find(
      (cuisine) => cuisine.id === this.recipeState().cuisineId
    );
    return cuisineSearched?.name ?? 'none';
  });

  readonly mealCategoryName = computed(() => {
    const mealCategorySearched = this.dbMealCategories().find(
      (mealCategory) => mealCategory.id === this.recipeState().mealCategoryId
    );
    return mealCategorySearched?.name ?? 'none';
  });

  ngOnInit() {
    if (!this.stateRecipeService.mustPreserveState()) {
      this.stateRecipeService.resetRecipeState();
    } else {
      this.stateRecipeService.mustPreserveState.set(false);
    }

    this.form = this._formBuilder.group({
      title: [
        this.recipeState().title,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(36),
        ],
      ],
      preparationTime: [
        this.recipeState().preparationTime,
        [Validators.required, Validators.pattern(/^[0-9]*$/)],
      ],
      cookingTime: [
        this.recipeState().cookingTime,
        [Validators.required, Validators.pattern(/^[0-9]*$/)],
      ],
      servings: [this.recipeState().servings],
      difficulty: [this.recipeState().difficulty],
      price: [this.recipeState().price],
      frequency: [this.recipeState().frequency, [Validators.required]],
      cuisine: [this.recipeState().cuisineId],
      mealCategory: [this.recipeState().mealCategoryId],
      source: [
        this.recipeState().source,
        [Validators.pattern(/^(https?:\/\/|www\.)[^\s$.?#].[^\s]*$/i)],
      ],
      comment: this.recipeState().comment,
    });

    /** Subscribe to any changes in the status of the form (whether it is valid or not)*/
    this.form.statusChanges.subscribe(() => {
      let formIsValid;
      if (this.buttonType === 'Save') {
        formIsValid = this.form.valid && this.titleIsUnique();
      } else {
        formIsValid = this.form.valid;
      }
      this.stateRecipeService.setFormValidity(formIsValid);
    });

    this.form.get('title')?.valueChanges.subscribe((value: string) => {
      const titleExists = this.dbRecipes().some((item) => item.title === value);
      this.titleIsUnique.set(!titleExists);

      let formIsValid;
      if (this.buttonType === 'Save') {
        formIsValid = this.form.valid && this.titleIsUnique();
      } else {
        formIsValid = this.form.valid;
      }
      this.stateRecipeService.setFormValidity(formIsValid);
    });

    /** Subscribe to the 'title' input field value changes */
    this.form.get('title')?.valueChanges.subscribe((value) => {
      this.stateRecipeService.updateProperty('title', value);
    });

    /** Subscribe to the 'preparationTime' input field value changes */
    this.form.get('preparationTime')?.valueChanges.subscribe((value) => {
      this.stateRecipeService.updateProperty('preparationTime', value);
    });

    /** Subscribe to the 'cookingTime' input field value changes */
    this.form.get('cookingTime')?.valueChanges.subscribe((value) => {
      this.stateRecipeService.updateProperty('cookingTime', value);
    });

    /** Subscribe to the 'source' input field value changes */
    this.form.get('source')?.valueChanges.subscribe((value) => {
      this.stateRecipeService.updateProperty('source', value);
    });

    /** Subscribe to the 'comment' text area value changes */
    this.form.get('comment')?.valueChanges.subscribe((value) => {
      this.stateRecipeService.updateProperty('comment', value);
    });
  }

  resetRecipeState() {
    this.stateRecipeService.resetRecipeState();
    this.form.patchValue({
      title: this.stateRecipeService.initialRecipeState.title,
      preparationTime:
        this.stateRecipeService.initialRecipeState.preparationTime,
      cookingTime: this.stateRecipeService.initialRecipeState.cookingTime,
      source: this.stateRecipeService.initialRecipeState.source,
      comment: this.stateRecipeService.initialRecipeState.comment,
      imageFile: this.stateRecipeService.imageFile,
    });
  }

  onTitleChange(value: string) {
    const existingRecipeTitles = this.dbRecipes().find(
      (item) => item.title === value
    );
    this.titleIsUnique.set(existingRecipeTitles === undefined);
  }

  readonly messageUniqueTitle: Signal<string> = computed(() => {
    if (this.buttonType === 'Update') {
      return '';
    }

    return this.titleIsUnique() ? '' : 'Title already exists in database.';
  });

  decreaseServings() {
    this.stateRecipeService.decreaseServings();
  }

  increaseServings() {
    this.stateRecipeService.increaseServings();
  }

  messageServings() {
    return `${this.recipeState().servings} ${
      this.recipeState().servings === 1 ? 'person' : 'people'
    }`;
  }

  setDifficulty(difficultySelected: Difficulty) {
    this.stateRecipeService.updateProperty('difficulty', difficultySelected);
  }

  setPrice(priceSelected: Price) {
    this.stateRecipeService.updateProperty('price', priceSelected);
  }

  setFrequency(frequencySelected: Frequency) {
    this.stateRecipeService.updateProperty('frequency', frequencySelected);
  }

  setSeason(seasonSelected: Season) {
    this.stateRecipeService.setSeason(seasonSelected);
  }

  setRecipeCategory(recipeCategorySelected: RecipeCategoryDocInBackend) {
    this.stateRecipeService.setRecipeCategory(recipeCategorySelected);
  }

  navigateToCuisinePage() {
    // Store the actual target (button) so that when going back from the /cuisine page to the /new-recipe page,
    // the view scrolls back automatically to the button itself and not the top of the page (default).
    sessionStorage.setItem('scrollTargetCuisine', 'btn-cuisine');
    sessionStorage.removeItem('scrollTargetMealCategory');
    this.router.navigate(['/cuisine']);
  }

  navigateToMealCategoryPage() {
    // Store the actual target (button) so that when going back from the /meal-category page to the /new-recipe page,
    // the view scrolls back automatically to the button itself and not the top of the page (default).
    sessionStorage.setItem('scrollTargetMealCategory', 'btn-meal-category');
    sessionStorage.removeItem('scrollTargetCuisine');
    this.router.navigate(['/meal-category']);
  }

  ngAfterViewInit(): void {
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

  openModalInput() {
    this.showModalInput.set(true);
  }

  onConfirmModalAction(event: { confirmed: boolean; name: string }) {
    // Close the Cancel/Confirm modal
    this.showModalInput.set(false);

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.addRecipeCategory(event.name);
    }
  }

  async addRecipeCategory(recipeCategoryName: string) {
    this.isLoadingRecipeCategories.set(true);

    const newRecipeCategory = {
      name: recipeCategoryName,
    };

    try {
      const docId = await this.firestoreService.saveDocumentIntoStore(
        'recipe-categories',
        newRecipeCategory
      );
      console.log('New recipe category document ID: ', docId);
    } catch (error) {
      console.error('Error saving recipe category: ', error);
    }
    this.isLoadingRecipeCategories.set(false);
  }

  canShowTemplate = computed(() => {
    // return this.dbRecipeCategories().length > 0;
    return true;
  });

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.stateRecipeService.imageFile.set(file);

    // Revoke previous URL if it exists
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
    }

    this.imageUrl = URL.createObjectURL(file);
  }

  removeImage() {
    this.imageUrl = null;

    this.stateRecipeService.imageFile.set(null);
  }
}
