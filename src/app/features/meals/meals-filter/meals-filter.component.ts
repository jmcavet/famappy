import { Component, inject } from '@angular/core';
import { Difficulty, Frequency, Season } from '../../../models/recipe.model';
import { CapitalizePipe } from '../../../shared/pipes/capitalize.pipe';
import {
  CuisineDocInBackend,
  RecipeCategoryDocInBackend,
} from '../../../models/cuisine.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { RouterLink } from '@angular/router';
import { MealFilterFacade } from './meals-filter.facade';
import { StepperComponent } from '../meals-cart/components/stepper/stepper.component';
import { ChipComponent } from '../../../shared/ui/chip/chip.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ToggleBtnWithIconComponent } from '../../../shared/ui/toggle-btn-with-icon/toggle-btn-with-icon.component';

@Component({
  selector: 'app-meals-filter',
  imports: [
    LoadingComponent,
    CapitalizePipe,
    RouterLink,
    StepperComponent,
    ChipComponent,
    ButtonComponent,
    ToggleBtnWithIconComponent,
  ],
  templateUrl: './meals-filter.component.html',
  styleUrl: './meals-filter.component.css',
})
export class MealsFilterComponent {
  // Facade service and view model
  private readonly facade = inject(MealFilterFacade);

  // Direct facade signals exposed to HTML template
  seasonsSelected = this.facade.seasonsSelected;
  difficultiesSelected = this.facade.difficultiesSelected;
  cuisinesSelected = this.facade.cuisinesSelected;
  frequenciesSelected = this.facade.frequenciesSelected;
  selectedCategoryIds = this.facade.selectedCategoryIds;
  nbRecipesFiltered = this.facade.nbRecipesFiltered;
  dataIsLoading = this.facade.dataIsLoading;

  cuisineOptions = this.facade.cuisineOptions;
  seasonOptions = this.facade.seasonOptions;
  difficultyOptions = this.facade.difficultyOptions;
  frequencyOptions = this.facade.frequencyOptions;
  recipeCategoryOptions = this.facade.recipeCategoryOptions;

  recipeCategoryMode = this.facade.recipeCategoryMode;
  /*
  ----------------------------
  METHODS
  ----------------------------
  */
  selectSeason(seasonSelected: Season) {
    this.facade.selectSeason(seasonSelected);
  }

  selectCuisine(cuisineSelected: CuisineDocInBackend) {
    this.facade.selectCuisine(cuisineSelected);
  }

  selectDifficulty(difficultySelected: Difficulty) {
    this.facade.selectDifficulty(difficultySelected);
  }

  selectFrequency(frequencySelected: Frequency) {
    this.facade.selectFrequency(frequencySelected);
  }

  toggleRecipeCategory(recipeCategorySelected: RecipeCategoryDocInBackend) {
    this.facade.toggleRecipeCategory(recipeCategorySelected);
  }

  toggleRecipeCategoryMode(position: number) {
    this.facade.toggleRecipeCategoryMode(position);
  }
}
