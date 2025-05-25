import { NgFor, NgIf, Location } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../shared/widgets/loading/loading.component';
import { IngredientService } from '../../services/ingredient.service';
import { IngredientTypeService } from '../../services/ingredient-type.service';
import { combineLatest } from 'rxjs';
import { IngredientType } from '../../models/ingredient-type.model';
import { IngredientWithTypeName } from '../../models/ingredient.model';
import { RecipeService } from '../../services/recipe.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ingredients-page',
  imports: [FormsModule, NgFor, NgIf, LoadingComponent, RouterLink],
  templateUrl: './ingredients-page.component.html',
  styleUrl: './ingredients-page.component.css',
})
export class IngredientsPageComponent {
  private ingredientService = inject(IngredientService);
  private ingredientTypeService = inject(IngredientTypeService);
  private recipeService = inject(RecipeService);
  private location = inject(Location);

  @ViewChild('ingredientInput') ingredientInput!: ElementRef<HTMLInputElement>;

  inputText: string = '';
  ingredientType: IngredientType | undefined = undefined;
  ingredients: IngredientWithTypeName[] = [];
  ingredientsFiltered: IngredientWithTypeName[] = [];
  isLoading: boolean = false;

  ngOnInit() {
    /** Whenever users click on the back button (left arrow in header), they want to go back
     * to the 'ingredients' tab (and not back to the 'definition' tab). We must preserve the state once
     * the component has been initialized.
     */
    this.recipeService.mustPreserveState = true;

    this.isLoading = true;

    // We are loading both ingredients and ingredientTypes from Firestore, but ingredientTypes isn’t guaranteed
    // to be ready when we map the ingredients. That is why we can combine the two streams instead of calling the
    // ingredientTypes$ one and then the ingredients$.
    // Therefore, we wait for both collections to load before processing them.
    combineLatest([
      this.ingredientTypeService.ingredientTypes$,
      this.ingredientService.ingredients$,
    ]).subscribe(([ingredientTypes, ingredients]) => {
      if (ingredientTypes.length > 0) {
        this.isLoading = false;
      }

      if (ingredients.length > 0) {
        this.ingredientsFiltered = ingredients.map((ingredient) => {
          const typeName =
            ingredientTypes.find((t) => t.id === ingredient.typeId)?.name || '';
          return { ...ingredient, typeName };
        });
      }

      // Save the original list (not filtered) of ingredients in 'this.ingredients'
      this.ingredients = this.ingredientsFiltered;
    });
  }

  /** Access the input field and focus it on view initialization */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.ingredientInput.nativeElement.focus();
    });
  }

  onInputChange(value: string) {
    this.ingredientsFiltered = this.ingredients.filter((ingredient) => {
      return ingredient.name.toLowerCase().includes(value.toLowerCase());
    });
  }

  onResetInput() {
    this.inputText = '';
    this.ingredientsFiltered = this.ingredients;
  }

  selectIngredient(ingredient: string) {
    this.recipeService.updateRecipeState('ingredient', ingredient);
    this.recipeService.mustPreserveState = true;
    this.location.back();
  }
}
