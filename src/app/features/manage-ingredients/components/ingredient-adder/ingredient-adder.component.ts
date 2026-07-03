import { Component, inject, input, Signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IngredientAdderFacade } from './ingredient-adder.facade';
import { LoadingComponent } from '../../../../shared/layout/overlays/loading/loading.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';
import { SectionComponent } from '../../../../shared/layout/primitives/section.component';

export interface IngredientAdderContext {
  existingIngredientNames: Signal<any>;
}

@Component({
  selector: 'app-ingredient-adder',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    ButtonComponent,
    PickerModule,
    StackComponent,
    InlineComponent,
    SectionComponent,
  ],
  providers: [IngredientAdderFacade],
  templateUrl: './ingredient-adder.component.html',
  styleUrl: './ingredient-adder.component.css',
})
export class IngredientAdderComponent {
  existingIngredientNames = input.required<string[]>();

  private facade = inject(IngredientAdderFacade);

  private ctx: IngredientAdderContext = {
    existingIngredientNames: this.existingIngredientNames,
  };

  readonly ingredientCategorySelected = this.facade.ingredientCategorySelected;
  readonly ingredientsAreSaving = this.facade.ingredientsSaving;
  readonly ingredientBeingSaved = this.facade.ingredientBeingSaved;
  readonly buttonIsDisabled = this.facade.buttonIsDisabled;

  ngOnInit() {
    this.facade.connect(this.ctx);
  }

  openAddModal(event: MouseEvent) {
    this.facade.openAddModal(event);
  }
}
