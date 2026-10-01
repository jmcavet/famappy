import { sortShoppingListElements } from './shopping-list-sort';

describe('sortShoppingListElements', () => {
  const elements = [
    { name: 'Banana', category: 'Fruit' },
    { name: 'Carrot', category: 'Vegetable' },
    { name: 'Apple', category: 'Fruit' },
    { name: 'Bread', category: '' },
  ];

  it('sorts names in ascending and descending order', () => {
    expect(
      sortShoppingListElements(elements, 'name', true).map((item) => item.name),
    ).toEqual(['Apple', 'Banana', 'Bread', 'Carrot']);
    expect(
      sortShoppingListElements(elements, 'name', false).map(
        (item) => item.name,
      ),
    ).toEqual(['Carrot', 'Bread', 'Banana', 'Apple']);
  });

  it('sorts categories in both directions and alphabetizes names within a category', () => {
    expect(
      sortShoppingListElements(elements, 'category', true).map(
        (item) => item.name,
      ),
    ).toEqual(['Bread', 'Apple', 'Banana', 'Carrot']);
    expect(
      sortShoppingListElements(elements, 'category', false).map(
        (item) => item.name,
      ),
    ).toEqual(['Carrot', 'Apple', 'Banana', 'Bread']);
  });
});
