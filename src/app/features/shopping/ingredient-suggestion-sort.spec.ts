import { sortIngredientSuggestions } from './ingredient-suggestion-sort';

describe('sortIngredientSuggestions', () => {
  const ingredients = [
    { id: '1', name: 'Apple', category: 'Fruit' },
    { id: '2', name: 'Banana', category: 'Fruit' },
    { id: '3', name: 'Carrot', category: 'Vegetable' },
  ];

  it('sorts names in ascending and descending order', () => {
    expect(
      sortIngredientSuggestions(ingredients, 'name', true).map(
        (ingredient) => ingredient.name,
      ),
    ).toEqual(['Apple', 'Banana', 'Carrot']);

    expect(
      sortIngredientSuggestions(ingredients, 'name', false).map(
        (ingredient) => ingredient.name,
      ),
    ).toEqual(['Carrot', 'Banana', 'Apple']);
  });

  it('sorts categories in either direction and breaks ties by name', () => {
    expect(
      sortIngredientSuggestions(ingredients, 'category', false).map(
        (ingredient) => ingredient.name,
      ),
    ).toEqual(['Carrot', 'Apple', 'Banana']);
  });

  it('keeps rows without an ingredient ID last in either category direction', () => {
    const mixedItems = [
      { name: 'Quick item', category: 'A category', ingredientId: null },
      { name: 'Zucchini', category: 'Vegetable', ingredientId: '4' },
      { name: 'Apple', category: 'Fruit', ingredientId: '1' },
    ];

    expect(
      sortIngredientSuggestions(mixedItems, 'category', true).map(
        (item) => item.name,
      ),
    ).toEqual(['Apple', 'Zucchini', 'Quick item']);

    expect(
      sortIngredientSuggestions(mixedItems, 'category', false).map(
        (item) => item.name,
      ),
    ).toEqual(['Zucchini', 'Apple', 'Quick item']);
  });

  it('sorts dates chronologically and leaves missing dates last', () => {
    const datedIngredients = [
      { name: 'New ingredient', dateCreated: '2025-03-01T00:00:00.000Z' },
      { name: 'No date' },
      { name: 'Old ingredient', dateCreated: '2024-01-01T00:00:00.000Z' },
    ];

    expect(
      sortIngredientSuggestions(datedIngredients, 'dateCreated', true).map(
        (ingredient) => ingredient.name,
      ),
    ).toEqual(['Old ingredient', 'New ingredient', 'No date']);
    expect(
      sortIngredientSuggestions(datedIngredients, 'dateCreated', false).map(
        (ingredient) => ingredient.name,
      ),
    ).toEqual(['New ingredient', 'Old ingredient', 'No date']);
  });
});
