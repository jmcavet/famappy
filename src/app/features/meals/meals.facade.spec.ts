import { TestBed } from '@angular/core/testing';
import { MealFacade } from './meals.facade';
import { MealBackendService } from '../../services/backend/meal.service';
import { MealWithId } from './state/mealCart.model';

/* ---------------------------------------------------
   MOCKS
--------------------------------------------------- */

class MealBackendServiceMock {
  deleteMealFromStore = jasmine.createSpy('deleteMealFromStore');
}

/* ---------------------------------------------------
   HELPERS
--------------------------------------------------- */

function createMeal(
  id: string,
  year: number,
  monthName: string,
  dayName: string,
  dayOfMonth: number,
): MealWithId {
  return {
    id,
    weekDay: {
      dayName,
      year,
      monthName,
      dayOfMonth,
    },
    mealType: 'lunch',
    servings: 2,
    cook: null,
    recipe: {
      id: 'recipe-id',
      title: 'Test recipe',
      preparationTime: 10,
      cookingTime: 20,
      servings: 2,
      difficulty: 'low',
      price: 'low',
      frequency: 'weekly',
      seasonsSelected: [],
      difficultiesSelected: [],
      frequenciesSelected: [],
      cuisinesSelected: [],
      recipeCategoryIds: [],
      mealCategoryId: 'cat-1',
      cuisineId: 'cuisine-1',
      source: '',
      comment: '',
      ingredients: [],
      ingredient: '',
      ingredientId: '',
      selectedTabTitle: '',
      instructions: [],
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
      },
      nbFilters: 0,
      imageUrl: null,
      thumbnailUrl: '',
    },
  };
}

/* ---------------------------------------------------
   TEST SUITE
--------------------------------------------------- */

describe('MealFacade', () => {
  let facade: MealFacade;
  let mealBackendService: MealBackendServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MealFacade,
        { provide: MealBackendService, useClass: MealBackendServiceMock },
      ],
    });

    facade = TestBed.inject(MealFacade);
    mealBackendService = TestBed.inject(
      MealBackendService,
    ) as unknown as MealBackendServiceMock;
  });

  /* ---------------------------------------------------
     BASIC
  --------------------------------------------------- */

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  /* ---------------------------------------------------
     cleanOldMeals()
  --------------------------------------------------- */

  it('should do nothing when meal list is empty', () => {
    facade.cleanOldMeals([]);

    expect(mealBackendService.deleteMealFromStore).not.toHaveBeenCalled();
  });

  it('should not delete meals in the future', () => {
    const futureYear = new Date().getFullYear() + 1;

    const meals = [
      createMeal('future-meal', futureYear, 'January', 'monday', 10),
    ];

    facade.cleanOldMeals(meals);

    expect(mealBackendService.deleteMealFromStore).not.toHaveBeenCalled();
  });

  it('should delete meals older than today', () => {
    const pastYear = new Date().getFullYear() - 1;

    const meals = [createMeal('old-meal', pastYear, 'January', 'tuesday', 1)];

    facade.cleanOldMeals(meals);

    expect(mealBackendService.deleteMealFromStore).toHaveBeenCalledOnceWith(
      'old-meal',
    );
  });

  it('should delete only old meals when list is mixed', () => {
    const pastYear = new Date().getFullYear() - 1;
    const futureYear = new Date().getFullYear() + 1;

    const meals = [
      createMeal('old-meal', pastYear, 'January', 'thursday', 1),
      createMeal('future-meal', futureYear, 'January', 'friday', 1),
    ];

    facade.cleanOldMeals(meals);

    expect(mealBackendService.deleteMealFromStore).toHaveBeenCalledTimes(1);
    expect(mealBackendService.deleteMealFromStore).toHaveBeenCalledWith(
      'old-meal',
    );
  });
});
