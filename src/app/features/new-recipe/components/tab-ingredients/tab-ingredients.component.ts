import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { TabIngredientsFacade } from './tab-ingredients.facade';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ChipComponent } from '../../../../shared/ui/chip/chip.component';

@Component({
  selector: 'app-tab-ingredients',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CapitalizePipe,
    NgClass,
    ButtonComponent,
    ChipComponent,
  ],
  providers: [TabIngredientsFacade],
  templateUrl: './tab-ingredients.component.html',
  styleUrl: './tab-ingredients.component.css',
})
export class TabIngredientsComponent {
  private facade = inject(TabIngredientsFacade);

  readonly UNITS: string[] = ['cl', 'l', 'g', 'Kg'];

  readonly form = this.facade.form;
  readonly ingredientName = this.facade.ingredientName;
  readonly unit = this.facade.unit;
  readonly recipeIngredients = this.facade.recipeIngredients;
  readonly buttonIsDisabled = this.facade.buttonIsDisabled;

  ngOnInit(): void {
    this.facade.initializeForm();
  }

  selectUnit(unit: string) {
    this.facade.selectUnit(unit);
  }

  addIngredientToRecipe() {
    this.facade.addIngredientToRecipe();
  }

  onDeleteIngredient(index: number) {
    this.facade.deleteIngredient(index);
  }

  navigateToIngredientsPage() {
    this.facade.navigateToIngredientsPage();
  }
}
