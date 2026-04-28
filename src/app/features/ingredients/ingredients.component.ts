import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { IngredientsFacade } from './ingredients.facade';
import { SegmentedControlComponent } from '../../shared/ui/segmented-control/segmented-control.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ChipComponent } from '../../shared/ui/chip/chip.component';

@Component({
  selector: 'app-ingredients',
  imports: [
    FormsModule,
    LoadingComponent,
    RouterLink,
    ButtonComponent,
    ChipComponent,
    SegmentedControlComponent,
  ],
  providers: [IngredientsFacade],
  templateUrl: './ingredients.component.html',
  styleUrl: './ingredients.component.css',
})
export class IngredientsComponent {
  private facade = inject(IngredientsFacade);

  inputText = this.facade.inputText;
  pageIsLoading = this.facade.pageIsLoading;
  ingredientsFiltered = this.facade.ingredientsFiltered;
  ingredientCategoriesNames = this.facade.ingredientCategoriesNames;
  ingredientCategoryNameSelected = this.facade.ingredientCategoryNameSelected;

  @ViewChild('ingredientInput') ingredientInput!: ElementRef<HTMLInputElement>;

  /** Access the input field and focus it on view initialization */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.ingredientInput.nativeElement.focus();
    });
  }

  onResetInput() {
    this.facade.resetInput();
  }

  selectIngredientCategoryName(ingredientCategoryName: string) {
    this.facade.selectIngredientCategoryName(ingredientCategoryName);
  }

  selectIngredient(ingredientId: string) {
    this.facade.selectIngredient(ingredientId);
  }
}
