import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../shared/widgets/button/button.component';
import { RouterLink } from '@angular/router';
import { IngredientTypeService } from '../../../services/ingredient-type.service';
import { IngredientType } from '../../../models/ingredient-type.model';

@Component({
  selector: 'app-ingredient-categories-selection-page',
  imports: [ButtonComponent, RouterLink],
  templateUrl: './ingredient-categories-selection.component.html',
  styleUrl: './ingredient-categories-selection.component.css',
})
export class IngredientCategoriesSelectionComponent {
  private ingredientTypeService = inject(IngredientTypeService);

  ingredientTypes: IngredientType[] = [];
  ingredientTypeSelected: IngredientType | undefined = undefined;
  ingredientCategorySelected: IngredientType | undefined = undefined;
  linkText: string = '';

  ngOnInit() {
    this.ingredientTypeService.ingredientTypes$.subscribe((ingredientTypes) => {
      if (ingredientTypes) {
        this.ingredientTypes = ingredientTypes.map((item) => ({
          name: item.name,
          id: item.id,
        }));
      }
      this.linkText =
        ingredientTypes.length === 0
          ? 'Start by adding a new category'
          : 'Manage categories';
    });
  }

  selectIngredientType(
    ingredientTypeElement: IngredientType,
    atLeastOneUnitSelected: boolean
  ) {
    this.ingredientTypeSelected = atLeastOneUnitSelected
      ? undefined
      : ingredientTypeElement;

    this.ingredientTypeService.setSelectedType(this.ingredientTypeSelected);
  }
}
