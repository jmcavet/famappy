import { Component, inject, input, Signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { IngredientAdderFacade } from './ingredient-adder.facade';
import { LoadingComponent } from '../../../../shared/layout/overlays/loading/loading.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';

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

  readonly form = this.facade.form;
  readonly ingredientCategorySelected = this.facade.ingredientCategorySelected;
  readonly ingredientsAreSaving = this.facade.ingredientsSaving;
  readonly ingredientBeingSaved = this.facade.ingredientBeingSaved;
  readonly nameAlreadyExists = this.facade.nameAlreadyExists;
  readonly buttonIsDisabled = this.facade.buttonIsDisabled;

  ngOnInit() {
    this.facade.connect(this.ctx);

    this.facade.subscribeForm();
  }

  onIngredientEnterPress(event: KeyboardEvent) {
    this.facade.ingredientEnterPress(event);
  }

  async addIngredient() {
    this.facade.addIngredient();
  }
}
