import { inject, Injectable, Signal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../../services/toast.service';
import { MealDomainFacade } from '../../../../domain-facades/meal.facade';
import { ModalService } from '../../../../shared/modal/modal.service';

/** This UI facade may inject domain facades. However, domain facades must NEVER inject UI facades!! */
@Injectable({ providedIn: 'root' })
export class MealManualRecipeItemFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */
  private router = inject(Router);
  private toast = inject(ToastService);

  /** Domain access (business state & actions) */
  private mealDomainFacade = inject(MealDomainFacade);

  /** Transitional state */

  /* ================================
   * UI state (owned by this facade)
   * ================================ */

  /** Public signals (used/rendered on UI) */

  /* ================================
   * Component inputs (UI context)
   * ================================ */
  private _meal!: Signal<any>;
  private _modalService!: ModalService;

  /* ================================
   * Domain-derived state
   * ================================ */
  // Here: none! Could be dbMeals or dbRecipes signals for instance

  /** Called by the component */
  connect(meal: Signal<any>, modalService: ModalService) {
    this._meal = meal;
    this._modalService = modalService;
  }

  /* ================================
   * Computed signals
   * ================================ */

  /* ================================
   * Methods
   * ================================ */

  /** Public UI methods */
  public viewMeal() {
    // Navigate to the recipe selected
    // if (this.canViewRecipe()) {
    //   this.router.navigate(['/recipes/', this.recipe().id]);
    // }
    console.log('View meal..: ', this._meal());
  }

  public async removeManualMealFromStore() {
    const mealId = this._meal().id;
    console.log('mealId: ', mealId);
    try {
      await this.mealDomainFacade.deleteMealById(mealId);
      this.toast.show('Meal removed from database', 'success');
    } catch (error) {
      this.toast.show('Meal could not be removed from database', 'error');
    } finally {
      console.log('FINALLY remove manual meal from store');
      this._modalService.cancel();
    }
  }
}
