import { Component, inject } from '@angular/core';
import { RecipeService } from '../../services/recipe.service';
import { CuisineWithIdAndDate } from '../../models/cuisine.model';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ModalInputComponent } from '../../shared/modal-input/modal-input.component';
import { ModalConfirmComponent } from '../../shared/modal-confirm/modal-confirm.component';

@Component({
  selector: 'app-manage-cuisine-page',
  imports: [CapitalizePipe, ModalInputComponent, ModalConfirmComponent],
  templateUrl: './manage-cuisine-page.component.html',
  styleUrl: './manage-cuisine-page.component.css',
})
export class ManageCuisinePageComponent {
  private recipeService = inject(RecipeService);

  cuisines: CuisineWithIdAndDate[] = [];
  isLoading: boolean = false;
  showModalUpdateCuisine: boolean = false;
  cuisineIdToUpdate: string = '';
  cuisineNameToUpdate: string = '';
  showModalDeleteCuisine: boolean = false;
  cuisineIdToDelete: string = '';

  ngOnInit(): void {
    this.recipeService.cuisines$.subscribe((cuisines) => {
      this.cuisines = cuisines;
    });
  }

  openModalUpdateCuisine(cuisine: any) {
    this.showModalUpdateCuisine = true;
    this.cuisineIdToUpdate = cuisine.id;
    this.cuisineNameToUpdate = cuisine.name;
  }

  onConfirmModalUpdateCuisine(event: { confirmed: boolean; name: string }) {
    // Close the Cancel/Confirm modal
    this.showModalUpdateCuisine = false;

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.updateCuisine(this.cuisineIdToUpdate, event.name);
    }
  }

  async updateCuisine(cuisineIdToUpdate: string, newCuisineName: string) {
    this.isLoading = true;

    try {
      await this.recipeService.updateDocInFirestore(
        'cuisines',
        cuisineIdToUpdate,
        newCuisineName
      );
      console.log(
        this.cuisineNameToUpdate + ' has been updated into ' + newCuisineName
      );

      // If the user has selected a specific cuisine (e.g. italian) in the /new-recipe page, which corresponds to
      // the original cuisine name that has been updated, make sure to update it with the new cuisine name
      const cuisineSelected = this.recipeService.getCuisineSelected();
      if (cuisineSelected === this.cuisineNameToUpdate) {
        this.recipeService.setCuisine(newCuisineName);
      }
    } catch (error) {
      console.error('Error updating cuisine: ', error);
    }
    this.isLoading = false;
  }

  openModalDeleteCuisine(cuisine: any) {
    this.showModalDeleteCuisine = true;
    this.cuisineIdToDelete = cuisine.id;
  }

  onConfirmModalDeleteCuisine(confirm: boolean) {
    // Close the Cancel/Confirm modal
    this.showModalDeleteCuisine = false;

    if (confirm) {
      // User has confirmed the action provided within the modal window
      this.deleteCuisineId(this.cuisineIdToDelete);
    }
  }

  getDeleteMessage() {
    const cuisineToDelete = this.cuisines.find(
      (cuisine) => cuisine.id === this.cuisineIdToDelete
    );
    return `Do you really want to remove '${cuisineToDelete?.name}'?`;
  }

  async deleteCuisineId(cuisineIdToDelete: string) {
    this.isLoading = true;

    try {
      // If the user has selected a specific cuisine (e.g. italian) in the /new-recipe page, which corresponds to
      // the cuisine that is about to be deleted, make sure to delete it and replace it by 'none'
      const cuisineSelected = this.recipeService.getCuisineSelected();
      const cuisineNameDeleted = this.cuisines.find(
        (cuisine) => cuisine.id === cuisineIdToDelete
      );
      if (cuisineSelected === cuisineNameDeleted?.name) {
        this.recipeService.setCuisine('none');
      }

      await this.recipeService.deleteDocFromFirestore(
        'cuisines',
        cuisineIdToDelete
      );
    } catch (error) {
      console.error('Error deleting cuisine: ', error);
    }
    this.isLoading = false;
  }
}
