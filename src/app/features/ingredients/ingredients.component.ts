import { NgFor, NgIf, Location } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { IngredientBackendService } from '../../services/backend/ingredient.service';
import { IngredientCategoryBackendService } from '../../services/backend/ingredient-category.service';
import { RecipeStateService } from '../../services/state/recipe.service';
import { IngredientDocInBackend } from '../../models/ingredient.model';
import { IngredientTypeWithDate } from '../../models/ingredient-type.model';

@Component({
  selector: 'app-ingredients',
  imports: [FormsModule, NgFor, LoadingComponent, RouterLink],
  templateUrl: './ingredients.component.html',
  styleUrl: './ingredients.component.css',
})
export class IngredientsComponent {
  private location = inject(Location);

  /** Services */
  private ingredientService = inject(IngredientBackendService);
  private ingredientCategoryService = inject(IngredientCategoryBackendService);
  private recipeService = inject(RecipeStateService);

  /** Declaration of signals communicating with firestore */
  readonly dbIngredients: Signal<IngredientDocInBackend[]> =
    this.ingredientService.ingredients;
  readonly isLoadingIngredients = this.ingredientService.loading;

  readonly dbIngredientCategories: Signal<IngredientTypeWithDate[]> =
    this.ingredientCategoryService.ingredientCategories;
  readonly isLoadingIngredientCategories =
    this.ingredientCategoryService.loading;

  /** Declaration of local signals */
  recipeState = this.recipeService.recipeState;
  inputText = signal<string>('');

  @ViewChild('ingredientInput') ingredientInput!: ElementRef<HTMLInputElement>;

  /** Define the ingredients filtered by the text entered by user */
  readonly ingredientsFiltered = computed(() => {
    const ingredients = this.dbIngredients().map((ingredient) => {
      const typeName =
        this.dbIngredientCategories().find(
          (t) => t.id === ingredient.categoryId
        )?.name || '';
      return { ...ingredient, typeName };
    });

    const ingredientsFilteredBySearch = ingredients.filter((ingredient) => {
      return ingredient.name
        .toLowerCase()
        .includes(this.inputText().toLowerCase());
    });

    return ingredientsFilteredBySearch;
  });

  constructor() {
    /** Whenever users click on the back button (left arrow in header), they want to go back
     * to the 'ingredients' tab (and not back to the 'definition' tab). We must preserve the state once
     * the component has been initialized.
     */
    this.recipeService.preserveState(true);
  }

  /** Access the input field and focus it on view initialization */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.ingredientInput.nativeElement.focus();
    });
  }

  onResetInput() {
    this.inputText.set('');
  }

  selectIngredient(ingredientId: string) {
    this.recipeService.selectIngredient(ingredientId);
    this.recipeService.mustPreserveState.set(true);
    // queueMicrotask(() => this.location.back());
    this.location.back();
  }
}
