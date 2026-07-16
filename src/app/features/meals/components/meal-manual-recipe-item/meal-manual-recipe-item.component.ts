import { Component, computed, inject, input } from '@angular/core';
import { MealManualRecipeItemFacade } from './meal-manual-recipe-item.facade';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { ModalConfirmComponent } from '../../../../shared/layout/overlays/modal/modal-confirm/modal-confirm.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';

@Component({
  selector: 'app-meal-manual-recipe-item',
  imports: [ButtonComponent],
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

  onRemoveManualMeal(event: MouseEvent) {
    this.facade.openDeleteModal(event);
  }
}
