import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { IngredientsFacade } from './ingredients.facade';
import { SegmentedControlComponent } from '../../shared/ui/segmented-control/segmented-control.component';

@Component({
  selector: 'app-ingredients',
  imports: [
    FormsModule,
    LoadingComponent,
    RouterLink,
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
  IngredientCategoriesNames = this.facade.IngredientCategoriesNames;
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

  toggleIngredientCategory(ingredientCategoryName: string) {
    this.facade.toggleIngredientCategory(ingredientCategoryName);
  }

  selectIngredient(ingredientId: string) {
    this.facade.selectIngredient(ingredientId);
  }
}
