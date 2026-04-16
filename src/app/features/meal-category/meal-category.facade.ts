import { computed, inject, Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { ModalService } from '../../shared/modal/modal.service';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';
import { MealCategoryDomainFacade } from '../../domain-facades/mealCategory.facade';
import { MealCategoryBackendService } from '../../services/backend/meal-category.service';
import { RecipeStateService } from '../../services/state/recipe.service';

/** This UI facade may inject domain facades. However, domain facades must NEVER inject UI facades!! */
@Injectable()
export class MealCategoryFacade {
  /* ================================
   * Dependencies (injected)
   * ================================ */
  private location = inject(Location);

  /** Domain access (business state & actions) */
  private mealCategoryDomainFacade = inject(MealCategoryDomainFacade);

  private mealCategoryService = inject(MealCategoryBackendService);
  private modalService = inject(ModalService);

  /** Transitional state */
  private recipeService = inject(RecipeStateService);

  /* ================================
   * Domain-derived state
   * ================================ */
  readonly dbMealCategories = this.mealCategoryDomainFacade.dbMealCategories;

  /* ================================
   * Computed signals
   * ================================ */
  readonly mealCategoryId = computed(
    () => this.recipeService.recipeState().mealCategoryId,
  );

  /* ================================
   * Methods
   * ================================ */
  /** Public UI methods */
  public selectMealCategory(mealCategoryId: string) {
    this.recipeService.updateProperty('mealCategoryId', mealCategoryId);
    this.recipeService.mustPreserveState.set(true);
    this.location.back();
  }

  public openInputModal(event: MouseEvent) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Enter new meal category',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.dbMealCategories(),
      },
      {
        onConfirm: (name: string) => {
          // TODO: SHOULD I USE AWAIT HERE? YET, I CANNOT ADD ASYNC IN FRONT OF onConfirm!!
          this.addMealCategory(name);
        },
      },
    );
  }

  /** Private methods */
  private async addMealCategory(mealCategoryName: string) {
    this.mealCategoryService.saveMealCategoryIntoStore(mealCategoryName);
  }
}
