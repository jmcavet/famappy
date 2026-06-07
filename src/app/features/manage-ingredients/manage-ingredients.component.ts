import {
  Component,
  computed,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IngredientWithIdAndDate,
  IngredientWithTypeName,
  SortKey,
} from '../../models/ingredient.model';
import { IngredientAdderComponent } from './components/ingredient-adder/ingredient-adder.component';
import { IngredientCategoriesSelectionComponent } from './components/ingredient-categories-selection/ingredient-categories-selection.component';
import { IngredientFilterComponent } from './components/ingredient-filter/ingredient-filter.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ManageIngredientsFacade } from './manage-ingredients.facade';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';
import { ModalService } from '../../shared/layout/overlays/modal/modal.service';
import { ModalInputComponent } from '../../shared/layout/overlays/modal/modal-input/modal-input.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { GridComponent } from '../../shared/layout/primitives/grid.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-manage-ingredients',
  imports: [
    FormsModule,
    IngredientAdderComponent,
    IngredientCategoriesSelectionComponent,
    IngredientFilterComponent,
    HeaderShellComponent,
    PageLayoutComponent,
    SectionComponent,
    StackComponent,
    GridComponent,
    RowComponent,
    InlineComponent,
    ButtonComponent,
    LoadingComponent,
  ],
  providers: [ManageIngredientsFacade],
  templateUrl: './manage-ingredients.component.html',
  styleUrl: './manage-ingredients.component.css',
})
export class ManageIngredientsComponent {
  private facade = inject(ManageIngredientsFacade);
  private modalService = inject(ModalService);
  private location = inject(Location);

  /** Local signals */
  readonly editIngredientIndex = this.facade.editIngredientIndex;
  readonly filterSelected = this.facade.filterSelected;
  readonly isAscending = this.facade.isAscending;

  /** Domain-derived state */
  readonly ingredientCategories = this.facade.dbIngredientCategories;
  readonly pageIsLoading = this.facade.pageIsLoading;

  /** Local-derived state */
  readonly existingIngredientNames = this.facade.existingIngredientNames;
  readonly ingredientsFiltered = this.facade.ingredientsFiltered;

  goBack() {
    this.location.back();
  }

  onFilterSelected(filter: SortKey) {
    this.facade.onFilterSelected(filter);
  }

  onCategoryChange(event: Event): void {
    this.facade.changeCategory(event);
  }

  openUpdateModal(ingredient: any) {
    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Update ingredient',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.ingredientsFiltered(),
        inputValue: ingredient.name,
      },
      {
        onConfirm: (newName: string) => {
          const updatedIngredient = { ...ingredient, name: newName };
          this.facade.updateIngredient(updatedIngredient);
        },
      },
    );
  }

  openDeleteModal(event: MouseEvent, ingredientId: string) {
    this.facade.deleteModal(event, ingredientId);
  }
}
