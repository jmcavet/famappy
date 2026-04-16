import { computed, inject, Injectable } from '@angular/core';
import { RecipeWithId } from '../../../recipes/components/recipe-card/recipe.model';
import { Router } from '@angular/router';
import { ToastService } from '../../../../services/toast.service';
import { MealCartStateService } from '../../state/mealCart.service';
import { MealDomainFacade } from '../../../../domain-facades/meal.facade';
import { RecipeDomainFacade } from '../../../../domain-facades/recipe.facade';
import { MealRecipeContext } from './meal-recipe-item.component';
import { ModalService } from '../../../../shared/modal/modal.service';
import { ModalConfirmComponent } from '../../../../shared/components/modal-confirm/modal-confirm.component';

/** This UI facade may inject domain facades. However, domain facades must NEVER inject UI facades!! */
@Injectable()
export class MealRecipeItemFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */
  private router = inject(Router);
  private toast = inject(ToastService);
  private modalService = inject(ModalService);

  /** Domain access (business state & actions) */
  private mealDomainFacade = inject(MealDomainFacade);
  private recipeDomainFacade = inject(RecipeDomainFacade);

  /** Transitional state */
  private cartState = inject(MealCartStateService);

  /* ================================
   * UI state (owned by this facade)
   * ================================ */

  /** Public signals (used/rendered on UI) */

  /* ================================
   * Domain-derived state
   * ================================ */
  // Here: none! Could be dbMeals or dbRecipes signals for instance

  /* ================================
   * Component context (set via connect())
   * ================================ */
  /** Private signals */
  private _ctx!: MealRecipeContext;
  public connect(ctx: MealRecipeContext) {
    this._ctx = ctx;
  }

  /* ================================
   * Computed signals
   * ================================ */

  readonly totalTime = computed(() => {
    const recipe = this._ctx.recipe();
    if (!recipe) return 0;

    return Number(recipe.preparationTime) + Number(recipe.cookingTime);
  });

  readonly recipeTitle = computed(() => {
    return this._ctx.recipe()?.title;
  });

  readonly thumbnailUrl = computed(() => {
    return this._ctx.recipe()?.thumbnailUrl;
  });

  readonly mealCategoryName = computed(() => {
    return this._ctx.recipe()?.mealCategoryName;
  });

  /* ================================
   * Methods
   * ================================ */

  /** Public UI methods */
  public openDeleteModal(event: MouseEvent) {
    event.stopPropagation();

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message: 'Do you really want to remove this meal ?',
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        // onConfirm: () => this.facade.removeManualMealFromStore(),
        // TODO: for the 'onConfirm' method, use the one that remove the manual meal from store
        onConfirm: () => {
          this.removeMealFromSummary();
          this.removeMealFromStore();
        },
        onCancel: () => console.log('Cancel: exit modal...'), // OPTIONAL
      },
    );
  }

  public viewRecipe() {
    // Navigate to the recipe selected
    if (this._ctx.canViewRecipe()) {
      this.router.navigate(['/recipes/', this._ctx.recipe().id]);
    }
  }

  /** Private methods */
  private async removeMealFromStore() {
    const recipeId = this._ctx.recipe().id;

    try {
      await this.mealDomainFacade.deleteMealByRecipeId(recipeId);

      this.toast.show('Meal removed from database', 'success');
    } catch (error) {
      this.toast.show('Meal could not be removed from database', 'error');
    }
  }

  private removeMealFromSummary() {
    const currentRecipeId = this._ctx.recipe().id;

    const recipeSelected =
      this.recipeDomainFacade.getRecipeById(currentRecipeId);

    if (!recipeSelected) return;

    this.addRecipesToCart([recipeSelected]);
    this.removeRecipeFromWeekDay(recipeSelected);
  }

  private addRecipesToCart(recipes: RecipeWithId[]) {
    this.cartState.addRecipesToCart(recipes);

    // TODO: Reset the list of selected recipes!!
    // this.uiSelectedRecipes.set([]);
  }

  private removeRecipeFromWeekDay(recipe: RecipeWithId) {
    this.cartState.removeRecipeFromWeekDay(recipe);
  }
}
