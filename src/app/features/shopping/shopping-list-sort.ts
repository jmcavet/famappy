export type ShoppingListSortField = 'name' | 'category';

export interface ShoppingListSortable {
  name: string;
  category?: string;
}

export function sortShoppingListElements<T extends ShoppingListSortable>(
  elements: readonly T[],
  sortBy: ShoppingListSortField,
  ascending: boolean,
): T[] {
  const collator = new Intl.Collator(undefined, {
    sensitivity: 'base',
    numeric: true,
  });

  return [...elements].sort((left, right) => {
    const comparison = collator.compare(
      left[sortBy] ?? '',
      right[sortBy] ?? '',
    );

    if (comparison !== 0) return ascending ? comparison : -comparison;
    if (sortBy === 'category') return collator.compare(left.name, right.name);
    return 0;
  });
}
