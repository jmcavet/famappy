import { Component, inject } from '@angular/core';
import { RecipeService } from '../../../services/recipe.service';
import { Location } from '@angular/common';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import { ModalInputComponent } from '../../../shared/modal-input/modal-input.component';
import {
  CuisineWithIdAndDate,
  RecipeCategoryWithIdAndDate,
} from '../../../models/cuisine.model';

@Component({
  selector: 'app-cuisine',
  imports: [CapitalizePipe, ModalInputComponent],
  templateUrl: './cuisine.component.html',
  styleUrl: './cuisine.component.css',
})
export class CuisineComponent {
  private recipeService = inject(RecipeService);
  private location = inject(Location);
  cuisinePreviouslySelected: string = 'none';
  isLoading: boolean = false;
  showModalInput: boolean = false;
  cuisineName: string = '';
  cuisines: CuisineWithIdAndDate[] = [];

  ngOnInit(): void {
    this.recipeService.recipeState$.subscribe((state) => {
      this.cuisinePreviouslySelected = state.cuisine;
    });

    this.recipeService.cuisines$.subscribe((cuisines) => {
      this.cuisines = cuisines;
    });
  }

  selectCuisine(cuisine: string) {
    this.recipeService.updateRecipeState('cuisine', cuisine);
    this.recipeService.mustPreserveState = true;
    this.location.back();
  }

  openModalInput() {
    this.showModalInput = true;
  }

  onConfirmModalAction(event: { confirmed: boolean; name: string }) {
    // Close the Cancel/Confirm modal
    this.showModalInput = false;

    if (event.confirmed) {
      // User has confirmed the action provided within the modal window
      this.addCuisine(event.name);
    }
  }

  async addCuisine(cuisineName: string) {
    console.log('Cuisine entered by user: ', cuisineName);
    this.isLoading = true;

    const newCuisine = {
      name: cuisineName,
    };

    try {
      const docId = await this.recipeService.saveDocIntoFirestore(
        'cuisines',
        newCuisine
      );

      console.log('New cuisine document ID: ', docId);
    } catch (error) {
      console.error('Error saving cuisine: ', error);
    }
    // this.form.get('name')?.reset();
    // this.cdr.detectChanges(); // Trigger change detection to update @ViewChildren3
    this.isLoading = false;
  }
}
