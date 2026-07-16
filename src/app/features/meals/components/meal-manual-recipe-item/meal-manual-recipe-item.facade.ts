import { inject, Injectable, Signal } from '@angular/core';
import { ToastService } from '../../../../services/toast.service';
import { MealDomainFacade } from '../../../../domain-facades/meal.facade';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { ManualEntryViewComponent } from '../manual-entry-view/manual-entry-view.component';
import { ModalConfirmComponent } from '../../../../shared/layout/overlays/modal/modal-confirm/modal-confirm.component';
import { MealWithId } from '../../state/mealCart.model';

/** This UI facade may inject domain facades. However, domain facades must NEVER inject UI facades!! */
@Injectable({ providedIn: 'root' })
export class MealManualRecipeItemFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */
  private toastService = inject(ToastService);

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
  private _meal!: Signal<MealWithId>;
  private modalService!: ModalService;

  /* ================================
   * Domain-derived state
   * ================================ */
  // Here: none! Could be dbMeals or dbRecipes signals for instance

  /** Called by the component */
  connect(meal: Signal<MealWithId>, modalService: ModalService) {
    this._meal = meal;
    this.modalService = modalService;
  }

  /* ================================
   * Computed signals
   * ================================ */

  /* ================================
   * Methods
   * ================================ */

  /** Public UI methods */
  public viewMeal() {
    const meal = this._meal();

    if (meal.manualRecipe) {
      const { name, ingredients, instructions } = meal.manualRecipe;

      this.modalService.open(ManualEntryViewComponent, {
        name,
        ingredients,
        instructions,
      });
    }
  }

  onConfirm() {
    this.modalService.confirm();
  }

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
        onConfirm: () => {
          // this.removeMealFromSummary();
          this.removeManualMealFromStore();
        },
        onCancel: () => console.log('Cancel: exit modal...'), // OPTIONAL
      },
    );
  }

  private async removeManualMealFromStore() {
    const meal = this._meal();

    const mealId = meal.id;
    try {
      await this.mealDomainFacade.deleteMealById(mealId);
      this.toastService.show('Manual meal removed from database', 'success');
    } catch (error) {
      this.toastService.show(
        'Manual meal could not be removed from database',
        'error',
      );
    } finally {
      console.log('FINALLY remove manual meal from store');
      this.modalService.cancel();
    }
  }
}
