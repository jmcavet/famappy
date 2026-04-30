import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
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

@Component({
  selector: 'app-manage-ingredients',
  imports: [
    FormsModule,
    LoadingComponent,
    IngredientAdderComponent,
    IngredientCategoriesSelectionComponent,
    IngredientFilterComponent,
    ButtonComponent,
  ],
  providers: [ManageIngredientsFacade],
  templateUrl: './manage-ingredients.component.html',
  styleUrl: './manage-ingredients.component.css',
})
export class ManageIngredientsComponent {
  private facade = inject(ManageIngredientsFacade);

  /** Local signals */
  readonly editIngredientIndex = this.facade.editIngredientIndex;
  readonly filterSelected = this.facade.filterSelected;
  readonly isAscending = this.facade.isAscending;

  /** Domain-derived state */
  readonly ingredientCategories = this.facade.dbIngredientCategories;
  readonly pageIsLoading = this.facade.pageIsLoading;

  /** Local-derived state */
  readonly showMessageNoCategories = this.facade.showMessageNoCategories;
  readonly existingIngredientNames = this.facade.existingIngredientNames;
  readonly ingredientsFiltered = this.facade.ingredientsFiltered;

  @ViewChild('editInput') editInputRef!: ElementRef<HTMLInputElement>;

  onFilterSelected(filter: SortKey) {
    this.facade.onFilterSelected(filter);
  }

  onCategoryChange(event: Event): void {
    this.facade.changeCategory(event);
  }

  editIngredient(index: number, ingredient: IngredientWithTypeName): void {
    this.facade.editIngredient(index, ingredient);

    setTimeout(() => {
      // Focus after Angular has rendered the input
      this.editInputRef.nativeElement.focus();
    });
  }

  onEditPressEnterIngredient(
    event: KeyboardEvent,
    ingredient: IngredientWithIdAndDate,
  ) {
    this.facade.editPressEnterIngredient(event, ingredient);
  }

  onValidateUpdate(ingredient: IngredientWithIdAndDate) {
    this.facade.validateUpdate(ingredient);
  }

  openDeleteModal(event: MouseEvent, ingredientId: string) {
    this.facade.deleteModal(event, ingredientId);
  }
}
