import { Component, inject, ViewChild } from '@angular/core';

import { TabComponent } from './tab/tab.component';
import { TabsComponent } from './tabs/tabs.component';
import { TabDefinitionComponent } from './tab-definition/tab-definition.component';
import { TabIngredientsComponent } from './tab-ingredients/tab-ingredients.component';
import { TabInstructionsComponent } from './tab-instructions/tab-instructions.component';
import { RecipeService } from '../../../services/recipe.service';
import { RecipesService } from '../../../services/recipes.service';
import { RecipeState } from '../../../models/recipe.model';
import { NgClass } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-new-recipe',
  imports: [
    TabsComponent,
    TabComponent,
    TabDefinitionComponent,
    TabIngredientsComponent,
    TabInstructionsComponent,
    NgClass,
  ],
  templateUrl: './new-recipe.component.html',
  styleUrl: './new-recipe.component.css',
})
export class NewRecipeComponent {
  private recipesService = inject(RecipesService);
  private recipeService = inject(RecipeService);
  private toastService = inject(ToastService);

  @ViewChild(TabDefinitionComponent) childComponent!: TabDefinitionComponent;

  formIsValid = false;

  ngOnInit() {
    this.recipeService.isFormValid$.subscribe((valid) => {
      this.formIsValid = valid;
    });
  }

  async onAddRecipe() {
    const recipe: any = {
      title: this.recipeService.recipeState.title,
      preparationTime: this.recipeService.recipeState.preparationTime,
      cookingTime: this.recipeService.recipeState.cookingTime,
      servings: this.recipeService.recipeState.servings,
      difficulty: this.recipeService.recipeState.difficulty,
      price: this.recipeService.recipeState.price,
      frequency: this.recipeService.recipeState.frequency,
      seasonsSelected: this.recipeService.recipeState.seasonsSelected,
      recipeCategoriesSelected:
        this.recipeService.recipeState.recipeCategoriesSelected,
      mealCategory: this.recipeService.recipeState.mealCategory,
      cuisine: this.recipeService.recipeState.cuisine,
      source: this.recipeService.recipeState.source,
      ingredients: this.recipeService.recipeState.ingredients,
      ingredient: this.recipeService.recipeState.ingredient,
      instructions: this.recipeService.recipeState.instructions,
      // tags: ['Enfants'],
    };

    try {
      await this.recipesService.saveRecipeIntoStore(recipe);

      this.childComponent.resetRecipeState();

      this.toastService.show('New recipe saved in database', 'success');
    } catch (error) {
      this.toastService.show('Recipe could not be saved in database', 'error');
    }

    this.recipeService.resetRecipeState();
  }
}
