export type IngredientSuggestionSortKey = 'name' | 'category' | 'dateCreated';

export interface IngredientSuggestionSortItem {
  name: string;
  category?: string;
  dateCreated?: string | Date | null;
}

export function sortIngredientSuggestions<
  T extends IngredientSuggestionSortItem,
>(
  items: readonly T[],
  sortBy: IngredientSuggestionSortKey,
  ascending: boolean,
): T[] {
  console.log('ITEMS', items);
  return [...items].sort((left, right) => {
    if (sortBy === 'dateCreated') {
      const leftDate = toTimestamp(left.dateCreated);
      const rightDate = toTimestamp(right.dateCreated);

      if (leftDate === null || rightDate === null) {
        if (leftDate !== rightDate) return leftDate === null ? 1 : -1;
        return compareValues(left.name, right.name);
      }

      const dateComparison = leftDate - rightDate;
      return dateComparison !== 0
        ? ascending
          ? dateComparison
          : -dateComparison
        : compareValues(left.name, right.name);
    }

    const leftValue = left[sortBy];
    const rightValue = right[sortBy];
    const comparison = compareValues(leftValue ?? '', rightValue ?? '');

    if (comparison !== 0) return ascending ? comparison : -comparison;
    if (sortBy === 'category') return compareValues(left.name, right.name);
    return 0;
  });
}

function toTimestamp(value: string | Date | null | undefined): number | null {
  if (value == null || value === '') return null;
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function compareValues(left: string, right: string): number {
  return left.localeCompare(right, undefined, {
    sensitivity: 'base',
    numeric: true,
  });
}
