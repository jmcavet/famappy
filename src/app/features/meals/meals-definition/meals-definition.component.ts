import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RecipeCategoryDocInBackend } from '../../../models/cuisine.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MealDefinitionFacade } from './meals-definition.facade';
import { StepperComponent } from '../meals-cart/components/stepper/stepper.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ChipComponent } from '../../../shared/ui/chip/chip.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';

@Component({
  selector: 'app-meals-definition',
  imports: [
    ReactiveFormsModule,
    LoadingComponent,
    RouterLink,
    StepperComponent,
    ButtonComponent,
    ChipComponent,
    SelectComponent,
  ],
  templateUrl: './meals-definition.component.html',
  styleUrl: './meals-definition.component.css',
})
export class MealsDefinitionComponent {
  // Facade service
  private mealDefinitionFacade = inject(MealDefinitionFacade);

  /** Non-computed signals exposed to html template */
  selectedCategories = this.mealDefinitionFacade.selectedCategories;
  selectedCategoriesIds = this.mealDefinitionFacade.selectedCategoriesIds;

  /** Computed signals exposed to html template */
  nbMeals = this.mealDefinitionFacade.nbMeals;
  dataIsLoading = this.mealDefinitionFacade.dataIsLoading;
  plannedMealsCount = this.mealDefinitionFacade.plannedMealsCount;
  filteredCategories = this.mealDefinitionFacade.filteredCategories;
  applyProceedButtonDisableClass =
    this.mealDefinitionFacade.applyProceedButtonDisableClass;
  proceedButtonIsDisabled = this.mealDefinitionFacade.proceedButtonIsDisabled;

  mealNbSelected = new FormControl();

  constructor() {
    this.mealDefinitionFacade.initializeMealNbControl(this.mealNbSelected);
  }

  /*
  ----------------------------
  METHODS
  ----------------------------
  */
  toggleSelection(category: RecipeCategoryDocInBackend) {
    this.mealDefinitionFacade.toggleSelection(category);
  }

  proceed() {
    this.mealDefinitionFacade.proceed();
  }
}
