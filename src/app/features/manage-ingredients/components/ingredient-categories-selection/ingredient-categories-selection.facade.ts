import { computed, inject, Injectable, signal } from '@angular/core';
import { IngredientCategoryDomainFacade } from '../../../../domain-facades/ingredientCategory.facade';
import { IngredientType } from '../../../../models/ingredient-type.model';
import { IngredientCategoryBackendService } from '../../../../services/backend/ingredient-category.service';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { ModalInputComponent } from '../../../../shared/layout/overlays/modal/modal-input/modal-input.component';

@Injectable()
export class IngredientCategoriesSelectionFacade {
  /* ================================
   * Dependencies
   * ================================ */
  private modalService = inject(ModalService);

  /** Framework dependencies */

  /** Domain access (business state & actions) */
  private ingredientCategoryDomainFacade = inject(
    IngredientCategoryDomainFacade,
  );

  /* ================================
   * Domain-derived state
   * ================================ */
  private ingredientCategoryService = inject(IngredientCategoryBackendService);

  readonly dbIngredientCategories =
    this.ingredientCategoryDomainFacade.dbIngredientCategories;

  /* ================================
   * Local state
   * ================================ */
  /** Signals rendered on UI */
  ingredientCategorySelected = signal<IngredientType | undefined>(undefined);

  /* ================================
   * Local derived state
   * ================================ */
  /** Public signals */
  readonly ingredientCategoriesSorted = computed(() =>
    this.dbIngredientCategories().sort((a, b) => a.name.localeCompare(b.name)),
  );

  /* ================================
   * PUBLIC API
   * ================================ */
  selectIngredientType(
    ingredientTypeElement: IngredientType,
    atLeastOneUnitSelected: boolean,
  ) {
    this.ingredientCategorySelected.set(
      atLeastOneUnitSelected ? undefined : ingredientTypeElement,
    );

    this.ingredientCategoryService.setSelectedIngredientCategory(
      this.ingredientCategorySelected(),
    );
  }

  openAddModal(event: MouseEvent) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Enter new ingredient category',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.dbIngredientCategories(),
      },
      {
        onConfirm: (name: string) => {
          (async () => {
            await this.addIngredientCategory(name);
          })();
        },
      },
    );
  }

  /* ================================
   * PRIVATE HELPERS
   * ================================ */
  private async addIngredientCategory(ingredientCategoryName: string) {
    this.ingredientCategoryDomainFacade.saveRecipeCategory(
      ingredientCategoryName,
    );
  }
}
