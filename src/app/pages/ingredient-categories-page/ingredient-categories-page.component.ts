import { Location, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  IngredientType,
  IngredientTypeWithDate,
} from '../../models/ingredient-type.model';
import { IngredientTypeService } from '../../services/ingredient-type.service';
import { LoadingComponent } from '../../shared/widgets/loading/loading.component';

@Component({
  selector: 'app-ingredient-categories-page',
  imports: [NgFor, LoadingComponent],
  templateUrl: './ingredient-categories-page.component.html',
  styleUrl: './ingredient-categories-page.component.css',
})
export class IngredientCategoriesPageComponent {
  private ingredientTypeService = inject(IngredientTypeService);
  private location = inject(Location);

  ingredientCategories: IngredientTypeWithDate[] = [];
  existingIngredientCategoryNames: string[] = [];
  isLoading: boolean = false;

  ngOnInit() {
    this.isLoading = true;
    this.ingredientTypeService.ingredientTypes$.subscribe(
      (ingredientCategories) => {
        if (ingredientCategories.length > 0) {
          this.ingredientCategories = ingredientCategories;
          this.existingIngredientCategoryNames = this.ingredientCategories.map(
            (ingredientCategory) => ingredientCategory.name
          );
          this.isLoading = false;
        }
      }
    );
  }
}
