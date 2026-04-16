import { Component, computed, inject, Signal, signal } from '@angular/core';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';
import { ModalConfirmComponent } from '../../shared/components/modal-confirm/modal-confirm.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { RecipeStateService } from '../../services/state/recipe.service';
import { CuisineBackendService } from '../../services/backend/cuisine.service';
import { CuisineDocInBackend } from '../../models/cuisine.model';
import { RecipeBackendService } from '../../services/backend/recipe.service';
import { RecipeWithId } from '../recipes/components/recipe-card/recipe.model';
import { ModalService } from '../../shared/modal/modal.service';

@Component({
  selector: 'app-manage-cuisines',
  imports: [
    CapitalizePipe,
    ModalInputComponent,
    ModalInputComponent,
    LoadingComponent,
  ],
  templateUrl: './manage-cuisines.component.html',
  styleUrl: './manage-cuisines.component.css',
})
export class ManageCuisinesComponent {
  private modalService = inject(ModalService);

  /** Services */
  private recipeStateService = inject(RecipeStateService);
  private recipeBackendService = inject(RecipeBackendService);
  private cuisineBackendService = inject(CuisineBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbCuisines: Signal<CuisineDocInBackend[]> =
    this.cuisineBackendService.cuisines;

  readonly dbRecipes: Signal<RecipeWithId[]> =
    this.recipeBackendService.recipes;
  readonly cuisinesAreLoading = this.cuisineBackendService.loading;
  readonly cuisinesAreSaving = this.cuisineBackendService.saving;
  readonly cuisineisUpdating = this.cuisineBackendService.updating;
  readonly cuisineIsBeingDeleted = this.cuisineBackendService.deleting;
  readonly recipeIsUpdating = this.recipeBackendService.updating;

  /** Declaration of local signals */
  cuisineName = signal<string>('');
  showModalAddCuisine = signal<boolean>(false);
  showModalUpdateCuisine = signal<boolean>(false);
  cuisineIdToUpdate = signal<string>('');
  cuisineNameToUpdate = signal<string>('');
  cuisineIdToDelete = signal<string>('');

  openDeleteModal(event: MouseEvent, cuisineId: string) {
    event.stopPropagation();

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message: this.modalDeleteMessage(cuisineId),
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        onConfirm: () => this.deleteCuisine(cuisineId),
      },
    );
  }

  public modalDeleteMessage(cuisineId: string) {
    const cuisineToDelete = this.dbCuisines().find(
      (cuisine) => cuisine.id === cuisineId,
    );

    return `Do you really want to remove the '${cuisineToDelete?.name}' cuisine ?`;
  }

  readonly canShowPage = computed(() => {
    return (
      this.cuisinesAreLoading() ||
      this.cuisinesAreSaving() ||
      this.cuisineisUpdating() ||
      this.cuisineIsBeingDeleted() ||
      this.recipeIsUpdating()
    );
  });

  openModalAddCuisine() {
    this.showModalAddCuisine.set(true);
  }

  openModalUpdateCuisine(cuisine: any) {
    this.showModalUpdateCuisine.set(true);
    this.cuisineIdToUpdate.set(cuisine.id);
    this.cuisineNameToUpdate.set(cuisine.name);
  }

  onConfirmModalAddCuisine(event: { confirmed: boolean; name: string }) {
    // Close the Cancel/Confirm modal
    this.showModalAddCuisine.set(false);

    if (event.confirmed) {
      this.addCuisine(event.name);
    }
  }

  async addCuisine(cuisineName: string) {
    this.cuisineBackendService.saveCuisineIntoStore(cuisineName);
  }

  onConfirmModalUpdateCuisine(event: { confirmed: boolean; name: string }) {
    // Close the Cancel/Confirm modal
    this.showModalUpdateCuisine.set(false);

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.updateCuisine(this.cuisineIdToUpdate(), event.name);
    }
  }

  async updateCuisine(cuisineIdToUpdate: string, newCuisineName: string) {
    this.cuisineBackendService.updateCuisineInStore(
      cuisineIdToUpdate,
      newCuisineName,
      this.recipeStateService.mustPreserveState,
    );

    // try {
    //   await this.firestoreService.updateDocumentInFirestore(
    //     'cuisines',
    //     cuisineIdToUpdate,
    //     newCuisineName
    //   );

    //   // If the user has selected a specific cuisine (e.g. italian) in the /new-recipe page, which corresponds to
    //   // the original cuisine name that has been updated, make sure to update it with the new cuisine name
    //   const cuisineSelected = this.recipeService.cuisineName();
    //   if (cuisineSelected === this.cuisineNameToUpdate()) {
    //     console.log('propertiesToUpdate: ', propertiesToUpdate);
    //     //TODO: pass the name of the new cuisine name to 'setCuisine'
    //     // this.recipeService.setCuisine(propertiesToUpdate?.name);
    //   }
    // } catch (error) {
    //   console.error('Error updating cuisine: ', error);
    // }
  }

  async deleteCuisine(cuisineId: string) {
    // Delete the cuisine document from the 'cuisines' collection
    this.cuisineBackendService.deleteCuisineInStore(cuisineId);

    const recipesWithCuisineId = this.dbRecipes().filter(
      (recipe) => recipe.cuisineId === cuisineId,
    );

    // Reset the 'cuisineId' property (to '') of the recipes which cuisineId
    // corresponds to the one just deleted)
    await this.recipeBackendService.resetRecipesPropertiesInStore(
      recipesWithCuisineId,
      { cuisineId: '' },
      this.recipeStateService.mustPreserveState,
    );
  }
}
