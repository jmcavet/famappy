import { computed, inject, Injectable } from '@angular/core';
import { MealDocInBackend } from '../../../features/meals/state/mealCart.model';
import { MealCartStateService } from '../../../features/meals/state/mealCart.service';
import { MemberDomainFacade } from '../../../domain-facades/member.facade';
import { MealDomainFacade } from '../../../domain-facades/meal.facade';
import { ToastService } from '../../../services/toast.service';
import { ContextMenuService } from '../context-menu-host/context-menu.service';
import { CookMenuContext } from './context-menu-cooks.component';

@Injectable()
export class ContextMenuCooksFacade {
  /* ════════════════════════════════
   * Dependencies (injected)
   * ════════════════════════════════*/
  /** Domain access (business state & actions) */
  private mealDomainFacade = inject(MealDomainFacade);
  private memberDomainFacade = inject(MemberDomainFacade);

  /** Transitional state (shared by several ui) */
  private cartService = inject(MealCartStateService);

  /** Other dependencies */
  private toast = inject(ToastService);
  private contextMenuService = inject(ContextMenuService);

  /* ================================
   * Component context (set via connect())
   * ================================ */
  /** Private signals */
  private _ctx!: CookMenuContext;
  public connect(ctx: CookMenuContext) {
    this._ctx = ctx;
  }

  /* ════════════════════════════════
   * Domain Data Access (proxies)
   * ════════════════════════════════ */
  /** Public signals */
  readonly membersLoading = this.memberDomainFacade.membersLoading;
  readonly mealsLoading = this.mealDomainFacade.mealsLoading;
  readonly parents = this.memberDomainFacade.parents;

  /* ════════════════════════════════
   * Public API (UI actions)
   * ════════════════════════════════ */
  public assignCook(cookId: string) {
    // First, close the context menu window
    this.contextMenuService.close();

    const meals = this._ctx.dailyMealPerMealType();

    if (meals.length > 0) {
      // Update cook property of meal document in firestore
      const mealIdsToUpdate = meals.map((meal) => meal.id);

      this.updateMealFromStore(mealIdsToUpdate, {
        cookId,
      });
    } else {
      this._assignCook(
        this._ctx.selectedDay().dayName,
        this._ctx.mealType(),
        cookId,
      );
    }
  }

  /* ════════════════════════════════
   * View Model (UI logic / presentation state)
   * ════════════════════════════════ */
  readonly dataIsLoading = computed(() => {
    return this.membersLoading() || this.mealsLoading();
  });

  /* ════════════════════════════════
   * Private Helpers
   * ════════════════════════════════ */
  private _assignCook(weekDayName: string, mealType: string, cookId: string) {
    this.cartService.assignCook(mealType, weekDayName, cookId);
  }

  private async updateMealFromStore(
    mealIdsToUpdate: string[],
    propertiesToUpdate: Partial<MealDocInBackend>,
  ) {
    try {
      await this.mealDomainFacade.updateMealsInStore(
        mealIdsToUpdate,
        propertiesToUpdate,
      );
    } catch (error) {
      this.toast.show('Meal could not be updated in database', 'error');
    }
  }
}
