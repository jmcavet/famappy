import { RecipeState, toRecipeDocInBackend } from './recipe.model';

describe('toRecipeDocInBackend', () => {
  it('maps only persisted recipe fields and copies mutable collections', () => {
    const state: RecipeState = {
      title: 'Soup',
      preparationTime: 10,
      cookingTime: 20,
      servings: 4,
      difficulty: 'easy',
      price: 'low',
      frequency: 'monthly',
      seasonsSelected: ['winter'],
      difficultiesSelected: ['easy'],
      frequenciesSelected: ['monthly'],
      cuisinesSelected: [{ id: 'cuisine-1' }],
      recipeCategoryIds: ['category-1'],
      mealCategoryId: 'meal-category-1',
      cuisineId: 'cuisine-1',
      source: '',
      comment: '',
      ingredients: [
        { id: 'ingredient-1', name: 'Carrot', measure: 2, unit: 'pcs' },
      ],
      ingredient: 'Carrot',
      ingredientId: 'ingredient-1',
      selectedTabTitle: 'ingredients',
      instructions: ['Chop the carrots.'],
      filter: {
        mealCategories: [],
        cuisines: [],
        recipeCategories: [],
        ingredientCategories: [],
        ingredientIds: [],
        difficulties: [],
        prices: [],
        frequencies: [],
        seasons: [],
        ingredientFilterMode: 0,
      },
      nbFilters: 0,
      imageUrl: null,
      thumbnailUrl: '',
    };

    const payload = toRecipeDocInBackend(state);

    expect(Object.keys(payload).sort()).toEqual(
      [
        'title',
        'preparationTime',
        'cookingTime',
        'servings',
        'difficulty',
        'price',
        'frequency',
        'seasonsSelected',
        'recipeCategoryIds',
        'mealCategoryId',
        'cuisineId',
        'source',
        'comment',
        'ingredients',
        'instructions',
        'imageUrl',
        'thumbnailUrl',
      ].sort(),
    );
    expect('filter' in payload).toBe(false);
    expect('selectedTabTitle' in payload).toBe(false);
    expect('ingredientId' in payload).toBe(false);
    expect('difficultiesSelected' in payload).toBe(false);
    expect(payload.ingredients).not.toBe(state.ingredients);
    expect(payload.ingredients[0]).not.toBe(state.ingredients[0]);
    expect(payload.instructions).not.toBe(state.instructions);
  });
});
