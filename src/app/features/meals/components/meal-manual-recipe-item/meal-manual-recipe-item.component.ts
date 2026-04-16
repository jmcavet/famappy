import { Component, computed, inject, input } from '@angular/core';
import { MealManualRecipeItemFacade } from './meal-manual-recipe-item.facade';
import { ModalConfirmComponent } from '../../../../shared/components/modal-confirm/modal-confirm.component';
import { ModalService } from '../../../../shared/modal/modal.service';

@Component({
  selector: 'app-meal-manual-recipe-item',
  imports: [],
  templateUrl: './meal-manual-recipe-item.component.html',
  styleUrl: './meal-manual-recipe-item.component.css',
  providers: [MealManualRecipeItemFacade],
})
export class MealManualRecipeItemComponent {
  private modalService = inject(ModalService);

  /** Inputs */
  meal = input.required<any>();

  /** UI Facade */
  private facade = inject(MealManualRecipeItemFacade);

  /** Rendered on UI */
  readonly mealName = computed(() => this.meal()?.manualRecipe.name);

  ngOnInit(): void {
    this.facade.connect(this.meal, this.modalService);
  }

  /** Public UI methods (click events, etc.) */
  viewMeal() {
    this.facade.viewMeal();
  }

  openDeleteModal() {
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
        onConfirm: () => console.log('onConfirm triggered'),
        onClose: () => console.log('onClose tiggered'),
        // onCancel: () => console.log('onCancel triggered'),
      },
    );
  }
}
