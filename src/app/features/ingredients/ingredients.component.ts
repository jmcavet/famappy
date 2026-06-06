import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IngredientsFacade } from './ingredients.facade';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ChipComponent } from '../../shared/ui/chip/chip.component';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';

@Component({
  selector: 'app-ingredients',
  imports: [
    FormsModule,
    RouterLink,
    ButtonComponent,
    ChipComponent,
    HeaderShellComponent,
    PageLayoutComponent,
    SectionComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    ButtonComponent,
    LoadingComponent,
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
