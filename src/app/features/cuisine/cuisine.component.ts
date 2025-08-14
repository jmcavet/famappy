import { Component, computed, inject, signal, Signal } from '@angular/core';
import { Location } from '@angular/common';
import { RecipeStateService } from '../../services/state/recipe.service';
import { CuisineBackendService } from '../../services/backend/cuisine.service';
import { CuisineDocInBackend } from '../../models/cuisine.model';
import { CapitalizePipe } from '../../shared/pipes/capitalize.pipe';
import { ModalInputComponent } from '../../shared/components/modal-input/modal-input.component';

@Component({
  selector: 'app-cuisine',
  imports: [CapitalizePipe, ModalInputComponent],
  templateUrl: './cuisine.component.html',
  styleUrl: './cuisine.component.css',
})
export class CuisineComponent {
  private location = inject(Location);

  /** Services */
  private recipeService = inject(RecipeStateService);
  private cuisineService = inject(CuisineBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbCuisines: Signal<CuisineDocInBackend[]> =
    this.cuisineService.cuisines;

  /** Declaration of local signals */
  recipeState = this.recipeService.recipeState;
  showModalInput = signal<boolean>(false);
  cuisineName = signal<string>('');

  /** Declaration of recipe state signals */
  readonly cuisineId = computed(() => this.recipeState().cuisineId);

  selectCuisine(cuisineId: string) {
    this.recipeService.updateProperty('cuisineId', cuisineId);
    this.recipeService.mustPreserveState.set(true);
    this.location.back();
  }

  openModalInput() {
    this.showModalInput.set(true);
  }

  onConfirmModalAction(event: { confirmed: boolean; name: string }) {
    // Close the Cancel/Confirm modal
    this.showModalInput.set(false);

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.addCuisine(event.name);
    }
  }

  async addCuisine(cuisineName: string) {
    this.cuisineService.saveCuisineIntoStore(cuisineName);
  }
}
