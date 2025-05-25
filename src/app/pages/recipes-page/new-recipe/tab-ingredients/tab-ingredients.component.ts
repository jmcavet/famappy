import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { RecipeService } from '../../../../services/recipe.service';
import { Ingredient } from '../../../../models/ingredient.model';
import { numberValidator } from '../../../../shared/validators/form-validators';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-tab-ingredients',
  imports: [FormsModule, ReactiveFormsModule, CapitalizePipe, NgClass],
  templateUrl: './tab-ingredients.component.html',
  styleUrl: './tab-ingredients.component.css',
})
export class TabIngredientsComponent {
  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);
  public recipeService = inject(RecipeService);

  form: FormGroup = this._formBuilder.group({});

  ingredientSelected: string = 'select ingredient';
  units: string[] = ['cl', 'l', 'g', 'Kg'];
  unit: string = '';
  selectedUnit = 'none'; // Default value is 'none'

  constructor() {
    // Initialize the form group
    this.form = this._formBuilder.group({
      measure: [1, [Validators.required, numberValidator]],
      ingredient: [
        this.ingredient,
        [Validators.minLength(2), Validators.maxLength(36)],
      ],
    });
  }

  selectUnit(unit: string, atLeastOneUnitSelected: boolean) {
    this.unit = atLeastOneUnitSelected ? '' : unit;
  }

  get ingredients() {
    return this.recipeService.recipeState.ingredients;
  }

  get ingredient() {
    return this.recipeService.recipeState.ingredient;
  }

  addIngredientToRecipe() {
    /** Update the list of ingredients */
    const newIngredient: Ingredient = {
      name: this.recipeService.recipeState.ingredient,
      measure: this.form.get('measure')?.value,
      unit: this.unit,
    };

    const updatedIngredients = [...this.ingredients, newIngredient];
    this.recipeService.updateRecipeState('ingredients', updatedIngredients);

    // /** Reset the ingredient selected */
    this.recipeService.updateRecipeState('ingredient', 'none');
  }

  onDeleteIngredient(index: number) {
    const updatedIngredients = this.ingredients.filter((_, i) => i !== index);
    this.recipeService.updateRecipeState('ingredients', updatedIngredients);
  }

  navigateToIngredientsPage() {
    // Store the actual target (button) so that when going back from the /meal-category page to the /new-recipe page,
    // the view scrolls back automatically to the button itself and not the top of the page (default).
    this.router.navigate(['/ingredients']);
  }
}
