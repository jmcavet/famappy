export type IngredientSuggestionSortKey = 'name' | 'category';

export interface IngredientSuggestionSortItem {
  name: string;
  category: string;
}

export function sortIngredientSuggestions<
  T extends IngredientSuggestionSortItem,
>(
  items: readonly T[],
  sortBy: IngredientSuggestionSortKey,
  ascending: boolean,
): T[] {
  return [...items].sort((left, right) => {
    const leftValue = left[sortBy];
    const rightValue = right[sortBy];
    const comparison = leftValue.localeCompare(rightValue, undefined, {
      sensitivity: 'base',
    });

    if (comparison !== 0) return ascending ? comparison : -comparison;
    if (sortBy === 'category') {
      return left.name.localeCompare(right.name, undefined, {
        sensitivity: 'base',
      });
    }
    return 0;
  });
}
