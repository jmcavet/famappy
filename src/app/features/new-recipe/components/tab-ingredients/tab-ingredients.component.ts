import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { TabIngredientsFacade } from './tab-ingredients.facade';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { SectionComponent } from '../../../../shared/layout/primitives/section.component';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { FormGridComponent } from '../../../../shared/layout/primitives/form-grid.component';

@Component({
  selector: 'app-tab-ingredients',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CapitalizePipe,
    ButtonComponent,
    SectionComponent,
    StackComponent,
    FormGridComponent,
    RowComponent,
    InlineComponent,
  ],
  providers: [TabIngredientsFacade],
  templateUrl: './tab-ingredients.component.html',
  styleUrl: './tab-ingredients.component.css',
})
export class TabIngredientsComponent {
  private facade = inject(TabIngredientsFacade);

  readonly form = this.facade.form;
  readonly ingredient = this.facade.ingredient;
  readonly ingredientName = this.facade.ingredientName;
  readonly measure = this.facade.measure;
  readonly recipeIngredients = this.facade.recipeIngredients;
  readonly buttonIsDisabled = this.facade.buttonIsDisabled;

  addIngredientToRecipe() {
    this.facade.addIngredientToRecipe();
  }

  onDeleteIngredient(index: number) {
    this.facade.deleteIngredient(index);
  }

  navigateToIngredientsPage() {
    this.facade.navigateToIngredientsPage();
  }

  onMeasureChange(value: number) {
    this.facade.changeMeasure(value);
  }
}
