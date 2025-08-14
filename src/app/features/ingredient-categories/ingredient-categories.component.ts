import { NgFor } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { IngredientCategoryBackendService } from '../../services/backend/ingredient-category.service';
import { IngredientTypeWithDate } from '../../models/ingredient-type.model';

@Component({
  selector: 'app-ingredient-categories',
  imports: [NgFor, LoadingComponent],
  templateUrl: './ingredient-categories.component.html',
  styleUrl: './ingredient-categories.component.css',
})
export class IngredientCategoriesComponent {
  /** Services */
  private ingredientCategoryService = inject(IngredientCategoryBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbIngredientCategories: Signal<IngredientTypeWithDate[]> =
    this.ingredientCategoryService.ingredientCategories;
  readonly isLoading = this.ingredientCategoryService.loading;

  readonly pageIsRefreshing = computed(() => this.isLoading());
}
