import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoadingComponent } from '../../../shared/layout/overlays/loading/loading.component';
import { HeaderShellComponent } from '../../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../../shared/layout/primitives/page-layout.component';
import { StepperComponent } from '../../meals/meals-cart/components/stepper/stepper.component';
import { SectionComponent } from '../../../shared/layout/primitives/section.component';
import { StackComponent } from '../../../shared/layout/primitives/stack.component';
import { InlineComponent } from '../../../shared/layout/primitives/inline.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { GridComponent } from '../../../shared/layout/primitives/grid.component';
import { SegmentedControlComponent } from '../../../shared/ui/segmented-control/segmented-control.component';
import { ShoppingIngredientsSelectionFacade } from './shopping-ingredients-selection.facade';
import { MeasureControlComponent } from '../components/measure-control/measure-control.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-shopping-ingredients-selection',
  imports: [
    RouterLink,
    LoadingComponent,
    HeaderShellComponent,
    PageLayoutComponent,
    StepperComponent,
    SectionComponent,
    StackComponent,
    InlineComponent,
    ButtonComponent,
    SegmentedControlComponent,
    MeasureControlComponent,
    GridComponent,
    NgClass,
  ],
  providers: [],
  templateUrl: './shopping-ingredients-selection.component.html',
  styleUrl: './shopping-ingredients-selection.component.css',
})
export class ShoppingIngredientsSelectionComponent {
  private facade = inject(ShoppingIngredientsSelectionFacade);

  readonly dataIsLoading = computed(() => false);

  readonly shoppingMealsSelected = this.facade.shoppingMealsSelected;
  readonly ingredientsSelectedSorted = this.facade.ingredientsSelectedSorted;
  readonly ingredientCategoriesSelected =
    this.facade.ingredientCategoriesSelected;
  readonly ingredientCategoryNameSelected =
    this.facade.ingredientCategoryNameSelected;
  readonly measures = this.facade.measures;
  readonly units = this.facade.units;
  readonly ingredientsDisabled = this.facade.ingredientsDisabled;

  measureFor(ingredientId: string) {
    return this.facade.measureFor(ingredientId);
  }

  toggleIngredientCategory(ingredientCategoryName: string) {
    this.facade.toggleIngredientCategory(ingredientCategoryName);
  }

  onMeasuresChange(ingredientId: string, value: number) {
    this.facade.changeMeasure(ingredientId, value);
  }

  disableIngredient(ingredientId: string) {
    this.facade.disableIngredient(ingredientId);
  }
}
