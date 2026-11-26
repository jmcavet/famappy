import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RecipeCategoryDocInBackend } from '../../../models/cuisine.model';
import { MealCategoryDomainFacade } from '../../../domain-facades/mealCategory.facade';
import { RecipeDomainFacade } from '../../../domain-facades/recipe.facade';
import { MealDefinitionFacade } from './meals-definition.facade';

describe('MealDefinitionFacade', () => {
  let facade: MealDefinitionFacade;
  let mealCategories: WritableSignal<RecipeCategoryDocInBackend[]>;
  let recipes: WritableSignal<{ mealCategoryId: string }[]>;
  const categories: RecipeCategoryDocInBackend[] = [
    { id: 'category-1', name: 'Breakfast', dateCreated: '' },
    { id: 'category-2', name: 'Dinner', dateCreated: '' },
  ];

  beforeEach(() => {
    mealCategories = signal<RecipeCategoryDocInBackend[]>([]);
    recipes = signal<{ mealCategoryId: string }[]>([]);

    TestBed.configureTestingModule({
      providers: [
        MealDefinitionFacade,
        {
          provide: MealCategoryDomainFacade,
          useValue: {
            mealCategoriesLoading: signal(false),
            dbMealCategories: mealCategories,
          },
        },
        {
          provide: RecipeDomainFacade,
          useValue: {
            dbRecipes: recipes,
          },
        },
      ],
    });

    facade = TestBed.inject(MealDefinitionFacade);
  });

  it('selects and deselects all displayed categories', () => {
    mealCategories.set(categories);
    recipes.set([
      { mealCategoryId: 'category-1' },
      { mealCategoryId: 'category-2' },
    ]);
    TestBed.flushEffects();

    expect(facade.allCategoriesSelected()).toBeTrue();
    expect(facade.selectedCategories()).toEqual(categories);

    facade.toggleAllCategories();

    expect(facade.allCategoriesSelected()).toBeFalse();
    expect(facade.someCategoriesSelected()).toBeFalse();

    facade.toggleSelection(categories[0]);

    expect(facade.allCategoriesSelected()).toBeFalse();
    expect(facade.someCategoriesSelected()).toBeTrue();

    facade.toggleAllCategories();

    expect(facade.allCategoriesSelected()).toBeTrue();
    expect(facade.someCategoriesSelected()).toBeFalse();
    expect(facade.selectedCategories()).toEqual(categories);

    facade.toggleAllCategories();

    expect(facade.allCategoriesSelected()).toBeFalse();
    expect(facade.someCategoriesSelected()).toBeFalse();
    expect(facade.selectedCategories()).toEqual([]);
  });
});
