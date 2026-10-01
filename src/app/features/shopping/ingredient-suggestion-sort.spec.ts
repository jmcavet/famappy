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
});
