import { RecipeDocInBackend } from '../../models/recipe.model';
import { RecipeStateService } from './recipe.service';

describe('RecipeStateService', () => {
  it('hydrates editor-only state when loading a persisted recipe', () => {
    const service = new RecipeStateService();
    const recipe: RecipeDocInBackend = {
      title: 'Soup',
      preparationTime: 10,
      cookingTime: 20,
      servings: 4,
      difficulty: 'easy',
      price: 'low',
      frequency: 'monthly',
      seasonsSelected: ['winter'],
      recipeCategoryIds: ['category-1'],
      mealCategoryId: 'meal-category-1',
      cuisineId: 'cuisine-1',
      source: '',
      comment: '',
      ingredients: [
        { id: 'ingredient-1', name: 'Carrot', measure: 2, unit: 'pcs' },
      ],
      instructions: ['Chop the carrots.'],
      imageUrl: '',
      thumbnailUrl: '',
    };

    service.updateRecipeState(recipe, 'recipe-1');

    expect(service.recipeState().title).toBe('Soup');
    expect(service.recipeState().mealCategoryId).toBe('meal-category-1');
    expect(service.recipeState().cuisineId).toBe('cuisine-1');
    expect(service.recipeState().ingredients).toEqual(recipe.ingredients);
    expect(service.recipeState().instructions).toEqual(recipe.instructions);
    expect(service.recipeState().filter).toEqual(
      service.initialRecipeState.filter,
    );
    expect(service.recipeState().ingredientId).toBe('none');
    expect(service.recipeState().selectedTabTitle).toBe('definition');
    expect(service.editingRecipeId()).toBe('recipe-1');
    expect(service.recipeHasChanges()).toBe(false);

    service.updateProperty('title', 'Updated soup');
    expect(service.recipeHasChanges()).toBe(true);

    service.updateProperty('title', 'Soup');
    expect(service.recipeHasChanges()).toBe(false);

    service.deleteIngredient(0);
    expect(service.recipeHasChanges()).toBe(true);
  });
});
