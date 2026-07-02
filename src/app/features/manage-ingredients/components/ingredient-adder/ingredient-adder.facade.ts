import { computed, inject, Injectable, signal } from '@angular/core';
import { IngredientCategoryBackendService } from '../../../../services/backend/ingredient-category.service';
import { IngredientDomainFacade } from '../../../../domain-facades/ingredient.facade';
import { IngredientAdderContext } from './ingredient-adder.component';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { ModalAddIngredientComponent } from '../../../../shared/layout/overlays/modal/modal-add-ingredient/modal-add-ingredient.component';

@Injectable()
export class IngredientAdderFacade {
  /* ================================
   * Dependencies
   * ================================ */
  private modalService = inject(ModalService);

  /** Domain access (business state & actions) */
  private ingredientDomainFacade = inject(IngredientDomainFacade);

  /* ================================
   * Domain-derived state
   * ================================ */
  private ingredientCategoryService = inject(IngredientCategoryBackendService);

  readonly ingredientCategorySelected =
    this.ingredientCategoryService.ingredientCategorySelected;
  readonly ingredientsSaving = this.ingredientDomainFacade.ingredientsSaving;

  /* ================================
   * Component context (set via connect())
   * ================================ */
  /** Private signals */
  private _ctx!: IngredientAdderContext;
  public connect(ctx: IngredientAdderContext) {
    this._ctx = ctx;
  }

  /* ================================
   * Local state
   * ================================ */
  /** Private signals */

  /* ================================
   * Local derived state
   * ================================ */
  /** Public signals */
  readonly ingredientBeingSaved = this.ingredientsSaving;

  readonly buttonIsDisabled = computed(() => {
    return !this.ingredientCategorySelected();
  });

  /* ================================
   * PUBLIC API
   * ================================ */
  openAddModal(event: MouseEvent) {
    event.stopPropagation();
    this.modalService.open(
      ModalAddIngredientComponent,
      {
        title: 'Enter a new ingredient',
        btnConfirmText: 'Create',
        btnConfirmColor: 'primary',
        existingItems: this._ctx.existingIngredientNames(),
      },
      {
        onConfirm: ({ name, measure, unit }) => {
          (async () => {
            await this.addIngredient(name, measure, unit);
          })();
        },
      },
    );
  }

  async addIngredient(name: string, measure: number, unit: string) {
    const propertiesToSave = {
      categoryId: this.ingredientCategorySelected()?.id,
      name,
      measure,
      unit,
    };

    this.ingredientDomainFacade.saveIngredient(propertiesToSave);
  }
}
