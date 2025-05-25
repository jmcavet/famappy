import { NgFor, NgIf, NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../../shared/widgets/loading/loading.component';
import { IngredientService } from '../../services/ingredient.service';
import { IngredientTypeService } from '../../services/ingredient-type.service';
import { combineLatest } from 'rxjs';
import { IngredientType } from '../../models/ingredient-type.model';
import {
  IngredientWithIdAndDate,
  IngredientWithTypeName,
} from '../../models/ingredient.model';
import { ModalConfirmComponent } from '../../shared/modal-confirm/modal-confirm.component';
import { IngredientAdderComponent } from '../ingredients-page/ingredient-adder/ingredient-adder.component';
import { IngredientCategoriesSelectionComponent } from '../ingredients-page/ingredient-categories-selection/ingredient-categories-selection.component';
import { IngredientFilterComponent } from '../ingredients-page/ingredient-filter/ingredient-filter.component';

@Component({
  selector: 'app-manage-ingredients-page',
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    ModalConfirmComponent,
    LoadingComponent,
    IngredientAdderComponent,
    IngredientCategoriesSelectionComponent,
    IngredientFilterComponent,
  ],
  templateUrl: './manage-ingredients-page.component.html',
  styleUrl: './manage-ingredients-page.component.css',
})
export class ManageIngredientsPageComponent {
  private ingredientService = inject(IngredientService);
  private ingredientTypeService = inject(IngredientTypeService);

  ingredientTypes: IngredientType[] = [];
  ingredientType: IngredientType | undefined = undefined;
  ingredients: IngredientWithTypeName[] = [];
  ingredientsTEST: IngredientWithIdAndDate[] = [];
  ingredientsFiltered: IngredientWithTypeName[] = [];
  existingIngredientNames: string[] = [];
  isLoading: boolean = false;
  isLoadingIngredientTypes: boolean = false;
  sortByVar: keyof IngredientWithIdAndDate = 'dateCreated'; // Type-safe
  typeChanged: string | undefined = '';
  showConfirmDeleteModal: boolean = false;
  ingredientIdToRemove: string = '';

  // Track edit mode for ingredients
  editIngredientIndex: number | null = null;
  @ViewChildren('inputField') inputFields: QueryList<ElementRef> | undefined;

  ngOnInit() {
    this.isLoadingIngredientTypes = true;

    // We are loading both ingredients and ingredientTypes from Firestore, but ingredientTypes isn’t guaranteed
    // to be ready when we map the ingredients. That is why we can combine the two streams instead of calling the
    // ingredientTypes$ one and then the ingredients$.
    // Therefore, we wait for both collections to load before processing them.
    combineLatest([
      this.ingredientTypeService.ingredientTypes$,
      this.ingredientTypeService.ingredientTypeSelected$,
      this.ingredientService.ingredients$,
    ]).subscribe(([ingredientTypes, ingredientTypeSelected, ingredients]) => {
      if (ingredientTypes.length > 0) {
        this.ingredientTypes = ingredientTypes.map((item) => ({
          name: item.name,
          id: item.id,
        }));
        this.isLoadingIngredientTypes = false;
      }

      if (ingredients.length > 0) {
        this.ingredientsFiltered = ingredients.map((ingredient) => {
          const typeName =
            ingredientTypes.find((t) => t.id === ingredient.typeId)?.name || '';
          return { ...ingredient, typeName };
        });
      }

      // Save the original list (not filtered) of ingredients in 'this.ingredients'
      this.ingredients = this.ingredientsFiltered;

      // Save the ingredient type selected so that it can be used in the template when adding a new ingredient
      console.log('XXX: ingredientTypeSelected: ', ingredientTypeSelected);
      this.ingredientType = ingredientTypeSelected;

      // Filter the ingredients according to the ingredient type selected
      this.ingredientsFiltered = ingredientTypeSelected
        ? this.ingredients.filter((ingredient) => {
            return ingredient.typeId === ingredientTypeSelected.id;
          })
        : this.ingredients;
    });
  }

  onTypeChange(event: Event): void {
    this.typeChanged = (event.target as HTMLSelectElement).value;
    console.log('Selected type:', this.typeChanged);
  }

  // Focus on the ingredient input field when the edit button is clicked
  editIngredient(index: number, ingredient: IngredientWithTypeName): void {
    // Edit button clicked: first, save the ingredient type name. If only the name is changed,
    // the right type name will be saved in memory and later provided as property for the updated ingredient.
    this.typeChanged = ingredient.typeName;

    this.editIngredientIndex = index;
    setTimeout(() => {
      // Focus on the specific input field when edit mode is triggered
      const input = this.inputFields?.toArray()[0];
      if (input) {
        input.nativeElement.focus();
      }
    });
  }

  onEditPressEnterIngredient(
    event: KeyboardEvent,
    ingredient: IngredientWithIdAndDate
  ) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onUpdateIngredientName(ingredient);
      this.resetEditFunctionality();
    }
  }

  async onUpdateIngredientName(ingredient: IngredientWithIdAndDate) {
    this.isLoading = true;

    // Find the id of the ingredient type that has been selected from the
    // drop down menu in the edit mode
    const updatedIngredientTypeSearched = this.ingredientTypes.find(
      (ingredientType) => ingredientType.name === this.typeChanged
    );

    const updatedIngredientTypeId = updatedIngredientTypeSearched
      ? updatedIngredientTypeSearched.id
      : '';

    // Update the ingredient with the (potentially) new values (name and ingredient type id)
    try {
      const docId = await this.ingredientService.updateIngredientById(
        ingredient.id,
        {
          typeId: updatedIngredientTypeId,
          name: ingredient.name,
        }
      );
      console.log('New ingredient document ID: ', docId);
    } catch (error) {
      console.error('Error saving ingredient: ', error);
    }
    this.isLoading = false;
  }

  onValidateUpdate(ingredient: IngredientWithIdAndDate) {
    this.onUpdateIngredientName(ingredient);
    this.resetEditFunctionality();
  }

  resetEditFunctionality() {
    // Reset the editIngredientIndex to null so that the edit-related template is no more visible
    this.editIngredientIndex = null;
  }

  onConfirmRemoveIngredient(ingredientId: string) {
    this.ingredientIdToRemove = ingredientId;
    this.showConfirmDeleteModal = true;
  }

  getDeleteMessage() {
    const ingredientToRemove = this.ingredients.find(
      (ingredient) => ingredient.id === this.ingredientIdToRemove
    );
    return `Do you really want to remove '${ingredientToRemove?.name}'?`;
  }

  onConfirmModalAction(confirm: boolean) {
    // Close the Cancel/Confirm modal
    this.showConfirmDeleteModal = false;

    if (confirm) {
      // User has confirmed the action provided within the modal window
      this.onRemoveIngredientId(this.ingredientIdToRemove);
    }
  }

  async onRemoveIngredientId(ingredientId: string) {
    try {
      this.ingredientService.removeIngredientStoreById(ingredientId);
    } catch (error) {
      console.error('Error removing ingredient: ', error);
    }
  }
}
