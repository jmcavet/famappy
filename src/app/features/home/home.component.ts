import {
  Component,
  computed,
  inject,
  linkedSignal,
  Signal,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/backend/auth.service';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { GridResponsiveComponent } from '../../shared/layout/primitives/grid-responsive.component';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';
import { currentDate, getWeekDays } from '../../shared/utils/calendar';
import { MealBackendService } from '../../services/backend/meal.service';
import { MealDocWithIdInBackend } from '../meals/state/mealCart.model';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { MemberDomainFacade } from '../../domain-facades/member.facade';
import { RecipeDomainFacade } from '../../domain-facades/recipe.facade';
import { GridComponent } from '../../shared/layout/primitives/grid.component';
import { ShoppingListDomainFacade } from '../../domain-facades/shopping-list.facade';
import { RecipeCardComponent } from '../recipes/components/recipe-card/recipe-card.component';
import { ModalService } from '../../shared/layout/overlays/modal/modal.service';
import { ManualEntryViewComponent } from '../meals/components/manual-entry-view/manual-entry-view.component';
import { ShoppingFacade } from '../shopping/shopping.facade';
import { ShoppingStateService } from '../shopping/state/shopping.service';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    HeaderShellComponent,
    PageLayoutComponent,
    RowComponent,
    ButtonComponent,
    StackComponent,
    GridResponsiveComponent,
    GridComponent,
    SectionComponent,
    InlineComponent,
    CardComponent,
    RecipeCardComponent,
    LoadingComponent,
    CapitalizePipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  /* ════════════════════════════════
   * Dependencies (injected)
   * ════════════════════════════════*/

  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  /** Domain access (business state & actions) */
  private memberDomainFacade = inject(MemberDomainFacade);
  private recipeDomainFacade = inject(RecipeDomainFacade);
  private shoppingListDomainFacade = inject(ShoppingListDomainFacade);

  private mealBackendService = inject(MealBackendService);

  /* ════════════════════════════════
   * Domain Data Access (proxies)
   * ════════════════════════════════ */
  readonly mealsLoading: Signal<boolean> = this.mealBackendService.loading;
  readonly membersLoading = this.memberDomainFacade.membersLoading;
  readonly recipesLoading = this.recipeDomainFacade.recipesLoading;
  readonly shoppingListsLoading =
    this.shoppingListDomainFacade.shoppingListsLoading;

  readonly dbMeals: Signal<MealDocWithIdInBackend[]> =
    this.mealBackendService.meals;
  private parents = this.memberDomainFacade.parents;
  readonly dbRecipes = this.recipeDomainFacade.dbRecipes;
  readonly dbShoppingListsNames =
    this.shoppingListDomainFacade.dbShoppingListsNames;

  private shoppingFacade = inject(ShoppingFacade);
  private shoppingService = inject(ShoppingStateService);

  /** Declaration of local signals */
  readonly userName = this.authService.userName;

  weekDays = getWeekDays();
  currentDate = currentDate();

  user = signal<User | null>(null);

  dataIsLoading = computed(
    () =>
      this.authService.userLoading() ||
      this.mealsLoading() ||
      this.membersLoading() ||
      this.recipesLoading() ||
      this.shoppingListsLoading(),
  );

  ngOnInit(): void {
    const auth = getAuth(); // Get Firebase Auth instance

    // Listen for changes in the authentication state
    onAuthStateChanged(auth, (user) => {
      this.user.set(user ? user : null);
    });
  }

  readonly dayMeals = computed(() => {
    // A meal from the backend represents only 1 recipe!
    // Transform the meals so that we get the recipe object itself instead of its id

    // Wait until the recipes and mealCategories have been loaded from the database
    if (this.dataIsLoading()) return;

    const { dayOfMonth, year } = this.weekDays[0];
    const meals = this.dbMeals().filter((meal) => {
      const weekDay = meal.weekDay;
      return weekDay.dayOfMonth === dayOfMonth && weekDay.year === year;
    });

    const dayMeals = meals?.map((meal) => {
      let mealName;

      if (meal.manualRecipe) mealName = meal.manualRecipe.name;
      else if (meal.recipeId) mealName = this.getRecipeNamebyId(meal.recipeId);

      return {
        id: meal.id,
        mealType: meal.mealType,
        cookId: meal.cookId,
        mealName,
        recipeId: meal.recipeId,
        manualRecipe: meal.manualRecipe,
      };
    });

    // Sort the day meals by meal type (lunch first, then dinner)
    const dayMealsSorted = dayMeals.sort((a, b) =>
      b.mealType.localeCompare(a.mealType),
    );

    return dayMealsSorted;
  });

  private getRecipeNamebyId(recipeId: string) {
    return this.dbRecipes().find((recipe) => recipe.id === recipeId)?.title;
  }

  public getCookNameById(cookId: string | null) {
    return this.parents().find((parent) => parent.id === cookId)?.name ?? '?';
  }

  public getCookPosition(cookId: string | null) {
    const cookIndex = this.parents().findIndex(
      (parent) => parent.id === cookId,
    );

    if (!cookId) {
      return 'none';
    }

    if (cookIndex === 0) {
      return 'first';
    }
    return 'second';
  }

  randomRecipes = linkedSignal(() => {
    const nbRandomRecipes = 6;

    const shuffleRecipes = [...this.dbRecipes()]
      .sort(() => Math.random() - 0.5)
      .slice(0, nbRandomRecipes);

    return shuffleRecipes;
  });

  shuffleReipes() {
    const nbRandomRecipes = 6;

    const shuffleRecipes = [...this.dbRecipes()]
      .sort(() => Math.random() - 0.5)
      .slice(0, nbRandomRecipes);

    this.randomRecipes.set(shuffleRecipes);
  }

  public viewManualRecipe(manualRecipe: {
    name: string;
    ingredients: string[];
    instructions: string[];
  }) {
    const { name, ingredients, instructions } = manualRecipe;
    this.modalService.open(ManualEntryViewComponent, {
      name,
      ingredients,
      instructions,
    });
  }

  navigateToShoppingPage(shoppingListName: string) {
    this.shoppingService.saveShoppingListSelection(shoppingListName);

    this.router.navigate(['/shopping']);
  }
}
