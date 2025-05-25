import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { RecipeService } from '../../../../services/recipe.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/widgets/button/button.component';
import { ModalInputComponent } from '../../../../shared/modal-input/modal-input.component';
import { RecipeCategoryWithIdAndDate } from '../../../../models/cuisine.model';
import { Difficulty } from '../../../../models/recipe.model';
import { Frequency, Price, Season } from '../../../../models/recipe.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-tab-definition',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CapitalizePipe,
    ButtonComponent,
    ModalInputComponent,
    NgClass,
  ],
  templateUrl: './tab-definition.component.html',
  styleUrl: './tab-definition.component.css',
})
export class TabDefinitionComponent {
  private recipeService = inject(RecipeService);
  private router = inject(Router);
  private _formBuilder = inject(FormBuilder);

  difficultyOptions: Difficulty[] = ['low', 'normal', 'high'];
  priceOptions: Price[] = ['low', 'normal', 'high'];
  frequencyOptions: Frequency[] = ['weekly', 'monthly', 'yearly'];
  seasonOptions: Season[] = ['spring', 'summer', 'autumn', 'winter'];

  showModalInput: boolean = false;
  isLoadingRecipeCategories: boolean = false;

  recipeCategories: RecipeCategoryWithIdAndDate[] = [];

  form: FormGroup = this._formBuilder.group({});

  get state() {
    return this.recipeService.recipeState;
  }

  ngOnInit() {
    if (!this.recipeService.mustPreserveState) {
      this.recipeService.resetRecipeState();
    } else {
      this.recipeService.mustPreserveState = false;
    }

    this.form = this._formBuilder.group({
      title: [
        this.state.title,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(36),
        ],
      ],
      preparationTime: [
        this.state.preparationTime,
        [Validators.required, Validators.pattern(/^[0-9]*$/)],
      ],
      cookingTime: [
        this.state.cookingTime,
        [Validators.required, Validators.pattern(/^[0-9]*$/)],
      ],
      servings: [this.state.servings],
      difficulty: [this.state.difficulty],
      price: [this.state.price],
      frequency: [this.state.frequency, [Validators.required]],
      cuisine: [this.state.cuisine],
      mealCategory: [this.state.mealCategory],
      source: this.state.source,
    });

    /** Subscribe to any changes in the status of the form (whether it is valid or not)*/
    this.form.statusChanges.subscribe(() => {
      this.recipeService.setFormValidity(this.form.valid);
    });

    /** Subscribe to the 'title' input field value changes */
    this.form.get('title')?.valueChanges.subscribe((value) => {
      this.recipeService.updateRecipeState('title', value);
    });

    /** Subscribe to the 'preparationTime' input field value changes */
    this.form.get('preparationTime')?.valueChanges.subscribe((value) => {
      this.recipeService.updateRecipeState('preparationTime', value);
    });

    /** Subscribe to the 'cookingTime' input field value changes */
    this.form.get('cookingTime')?.valueChanges.subscribe((value) => {
      this.recipeService.updateRecipeState('cookingTime', value);
    });

    /** Subscribe to the 'source' input field value changes */
    this.form.get('source')?.valueChanges.subscribe((value) => {
      this.recipeService.updateRecipeState('source', value);
    });

    /** Once the recipeCategories from firestore are retrieved, store them in the state */
    this.recipeService.recipeCategories$.subscribe((recipeCategories) => {
      this.recipeCategories = recipeCategories;
    });
  }

  resetRecipeState() {
    this.recipeService.resetRecipeState();
    this.form.patchValue({
      title: this.recipeService.initialRecipeState.title,
      preparationTime: this.recipeService.initialRecipeState.preparationTime,
      cookingTime: this.recipeService.initialRecipeState.cookingTime,
      source: this.recipeService.initialRecipeState.source,
    });
  }

  decreaseServings() {
    if (this.state.servings > 1) {
      this.recipeService.updateRecipeState('servings', this.state.servings - 1);
    }
  }

  increaseServings() {
    this.recipeService.updateRecipeState('servings', this.state.servings + 1);
  }

  messageServings() {
    return `${this.state.servings} ${
      this.state.servings === 1 ? 'person' : 'people'
    }`;
  }

  setDifficulty(difficultySelected: Difficulty) {
    this.recipeService.updateRecipeState('difficulty', difficultySelected);
  }

  setPrice(priceSelected: Price) {
    this.recipeService.updateRecipeState('price', priceSelected);
  }

  setFrequency(frequencySelected: Frequency) {
    this.recipeService.updateRecipeState('frequency', frequencySelected);
  }

  setSeason(seasonSelected: Season) {
    let seasonsUpdated;

    if (this.state.seasonsSelected.includes(seasonSelected)) {
      const index = this.state.seasonsSelected.indexOf(seasonSelected);
      seasonsUpdated = this.state.seasonsSelected.filter((_, i) => i !== index);
    } else {
      seasonsUpdated = [...this.state.seasonsSelected, seasonSelected];
    }
    this.recipeService.updateRecipeState('seasonsSelected', seasonsUpdated);
  }

  setRecipeCategory(recipeCategorySelected: RecipeCategoryWithIdAndDate) {
    let updatedRecipeCategories;

    if (this.selectedCategoryIds.has(recipeCategorySelected.id)) {
      const index = this.state.recipeCategoriesSelected.indexOf(
        recipeCategorySelected
      );
      updatedRecipeCategories = this.state.recipeCategoriesSelected.filter(
        (_, i) => i !== index
      );
    } else {
      updatedRecipeCategories = [
        ...this.state.recipeCategoriesSelected,
        recipeCategorySelected,
      ];
    }
    this.recipeService.updateRecipeState(
      'recipeCategoriesSelected',
      updatedRecipeCategories
    );
  }

  setFavorite() {
    this.recipeService.updateRecipeState('favorite', !this.state.favorite);
  }

  get selectedCategoryIds(): Set<string> {
    return new Set(this.state.recipeCategoriesSelected.map((cat) => cat.id));
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
    this.showModalInput = true;
  }

  onConfirmModalAction(event: { confirmed: boolean; name: string }) {
    // Close the Cancel/Confirm modal
    this.showModalInput = false;

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.addRecipeCategory(event.name);
    }
  }

  async addRecipeCategory(recipeCategoryName: string) {
    this.isLoadingRecipeCategories = true;

    const newRecipeCategory = {
      name: recipeCategoryName,
    };

    try {
      const docId = await this.recipeService.saveDocIntoFirestore(
        'recipe-categories',
        newRecipeCategory
      );
      console.log('New recipe category document ID: ', docId);
    } catch (error) {
      console.error('Error saving recipe category: ', error);
    }
    this.isLoadingRecipeCategories = false;
  }
}
