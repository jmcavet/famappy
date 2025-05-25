import {
  Component,
  ElementRef,
  inject,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NgFor, NgIf, Location } from '@angular/common';
import { LoadingComponent } from '../../shared/widgets/loading/loading.component';
import { IngredientCategoriesAdderComponent } from './ingredient-categories-adder/ingredient-categories-adder.component';
import { FormsModule } from '@angular/forms';
import { IngredientTypeWithDate } from '../../models/ingredient-type.model';
import { IngredientTypeService } from '../../services/ingredient-type.service';
import { IngredientService } from '../../services/ingredient.service';
import { ToastService } from '../../services/toast.service';
import { ModalConfirmComponent } from '../../shared/modal-confirm/modal-confirm.component';
import { IngredientWithIdAndDate } from '../../models/ingredient.model';

@Component({
  selector: 'app-ingredient-categories-selection-page',
  imports: [
    FormsModule,
    NgIf,
    NgFor,
    LoadingComponent,
    IngredientCategoriesAdderComponent,
    ModalConfirmComponent,
  ],
  templateUrl: './manage-ingredient-categories-page.component.html',
  styleUrl: './manage-ingredient-categories-page.component.css',
})
export class ManageIngredientCategoriesPageComponent {
  private ingredientTypeService = inject(IngredientTypeService);
  private ingredientService = inject(IngredientService);
  private toastService = inject(ToastService);
  private location = inject(Location);

  existingIngredientTypeNames: string[] = [];
  oldIngredientTypeToBeUpdated: string = '';
  ingredientCategoryIdToRemove: string = '';
  ingredientsToRemove: IngredientWithIdAndDate[] = [];

  ingredientTypes: IngredientTypeWithDate[] = [];
  nameAlreadyExists: boolean = false;
  isLoading: boolean = false;
  showConfirmDeleteModal: boolean = false;

  tempNames: { [id: string]: string } = {};

  // Track edit mode for ingredient types
  editIngredientTypeIndex: number | null = null;
  @ViewChildren('inputField') inputFields: QueryList<ElementRef> | undefined;

  ngOnInit() {
    this.isLoading = true;
    this.ingredientTypeService.ingredientTypes$.subscribe((ingredientTypes) => {
      if (ingredientTypes) {
        this.ingredientTypes = ingredientTypes;
        this.existingIngredientTypeNames = this.ingredientTypes.map(
          (ingredientType) => ingredientType.name
        );
      }
    });

    this.isLoading = false;
  }

  goBack() {
    this.location.back();
  }

  // Focus on the ingredient type input field when the edit button is clicked
  editIngredientType(
    index: number,
    currentIngredientType: IngredientTypeWithDate
  ): void {
    // Retrieve the type name that is about to be (potentially) updated
    this.oldIngredientTypeToBeUpdated = currentIngredientType.name;

    this.tempNames[currentIngredientType.id] = currentIngredientType.name;

    this.editIngredientTypeIndex = index;
    setTimeout(() => {
      // Focus on the specific input field when edit mode is triggered
      const input = this.inputFields?.toArray()[0];
      console.log('input: ', input);
      if (input) {
        input.nativeElement.focus();
      }
    });
  }

  onEditPressEnterIngredientType(
    event: KeyboardEvent,
    ingredientType: IngredientTypeWithDate
  ) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onValidateUpdate(ingredientType);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel_updating_name();
    }
  }

  onValidateUpdate(ingredientType: IngredientTypeWithDate) {
    this.onUpdateIngredientTypeName(ingredientType);
    this.resetEditFunctionality();
    this.onUpdateIngredients(ingredientType);
  }

  async onUpdateIngredientTypeName(ingredientType: IngredientTypeWithDate) {
    this.isLoading = true;

    if (
      this.existingIngredientTypeNames.includes(
        this.tempNames[ingredientType.id]
      )
    ) {
      this.toastService.show(
        `The type "${
          this.tempNames[ingredientType.id]
        }" already exists. Please type another name.`,
        'error'
      );
      return;
    }

    ingredientType.name = this.tempNames[ingredientType.id];

    try {
      await this.ingredientTypeService.updateIngredientTypeIntoStore(
        ingredientType.id,
        { name: ingredientType.name }
      );
    } catch (error) {
      console.error('Error saving ingredient: ', error);
    }
    this.isLoading = false;
  }

  resetEditFunctionality() {
    // Reset the editIngredientTypeIndex to null so that the edit-related template is no more visible
    this.editIngredientTypeIndex = null;
  }

  async onUpdateIngredients(ingredientType: IngredientTypeWithDate) {
    this.isLoading = true;

    const oldType = this.oldIngredientTypeToBeUpdated;
    const newType = ingredientType.name;
    try {
      await this.ingredientService.updateIngredientsType(oldType, newType);
    } catch (error) {
      console.error('Error saving ingredient: ', error);
    }
    this.isLoading = false;
  }

  onConfirmRemoveCategory(ingredientTypeId: string) {
    this.ingredientCategoryIdToRemove = ingredientTypeId;
    const ingredients = this.ingredientService.getIngredientsSnapshot();
    this.ingredientsToRemove = ingredients.filter(
      (ingredient) => ingredient.typeId === ingredientTypeId
    );
    this.showConfirmDeleteModal = true;
  }

  getDeleteMessage() {
    const count = this.ingredientsToRemove.length;

    return count > 0
      ? `Do you really want to remove this category? ${count} ingredients from this category will be uncategorized.`
      : 'Do you really want to remove this category?';
  }

  onConfirmModalAction(confirm: boolean) {
    // Close the Cancel/Confirm modal
    this.showConfirmDeleteModal = false;

    if (confirm) {
      // User has confirmed the action provided within the modal window
      this.onRemoveIngredientType(this.ingredientCategoryIdToRemove);
    }
  }

  async onRemoveIngredientType(ingredientTypeId: string) {
    try {
      this.ingredientTypeService.removeIngredientTypeStoreById(
        ingredientTypeId
      );
    } catch (error) {
      console.error('Error removing ingredient type: ', error);
    }

    try {
      this.ingredientService.removeIngredientsByTypeId(ingredientTypeId);
    } catch (error) {
      console.log('Error removing ingredient: ', error);
    }
  }

  cancel_updating_name() {
    // If user clicks outside of the input field (the (blur) event triggers because the input has list focus)
    console.log(
      'oldIngredientTypeToBeUpdated: ',
      this.oldIngredientTypeToBeUpdated
    );
    console.log('INGREDIEN TYOES: ', this.ingredientTypes);
    this.resetEditFunctionality();
  }
}
