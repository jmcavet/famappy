import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RecipeCategoryDocInBackend } from '../../../models/cuisine.model';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MealDefinitionFacade } from './meals-definition.facade';
import { StepperComponent } from '../meals-cart/components/stepper/stepper.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ChipComponent } from '../../../shared/ui/chip/chip.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { LoadingComponent } from '../../../shared/layout/overlays/loading/loading.component';
import { StackComponent } from '../../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../../shared/layout/primitives/inline.component';
import { SectionComponent } from '../../../shared/layout/primitives/section.component';
import { PageLayoutComponent } from '../../../shared/layout/primitives/page-layout.component';
import { HeaderShellComponent } from '../../../shared/layout/shell/header-shell.component';

@Component({
  selector: 'app-meals-definition',
  imports: [
    ReactiveFormsModule,
    LoadingComponent,
    RouterLink,
    StepperComponent,
    HeaderShellComponent,
    PageLayoutComponent,
    StackComponent,
    InlineComponent,
    SectionComponent,
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
