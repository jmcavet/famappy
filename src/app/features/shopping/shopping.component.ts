import { Component, inject } from '@angular/core';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { HeaderShellComponent } from '../../shared/layout/shell/header-shell.component';
import { FooterComponent } from '../../shared/layout/shell/footer/footer.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';
import { ShoppingFacade, ShoppingListElement } from './shopping.facade';
import { GridComponent } from '../../shared/layout/primitives/grid.component';
import { ChipComponent } from '../../shared/ui/chip/chip.component';
import { SegmentedControlComponent } from '../../shared/ui/segmented-control/segmented-control.component';
import { SelectTestComponent } from '../../shared/ui/select-test/select.component';
import { TagComponent } from '../../shared/ui/tag/tag.component';

@Component({
  selector: 'app-shopping',
  imports: [
    HeaderShellComponent,
    PageLayoutComponent,
    GridComponent,
    StackComponent,
    SectionComponent,
    InlineComponent,
    FooterComponent,
    SegmentedControlComponent,
    ButtonComponent,
    ChipComponent,
    TagComponent,
    SelectTestComponent,
    LoadingComponent,
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css',
})
export class ShoppingComponent {
  private shoppingFacade = inject(ShoppingFacade);

  dataIsLoading = this.shoppingFacade.dataIsLoading;

  readonly shoppingLists = this.shoppingFacade.shoppingLists;

  readonly getShoppingCategoryById = (categoryId: string | null) =>
    this.shoppingFacade.getShoppingCategoryById(categoryId);

  readonly shoppingListsNames = this.shoppingFacade.shoppingListsNames;
  readonly shoppingListNameSelected =
    this.shoppingFacade.shoppingListNameSelected;
  readonly shoppingListSelected = this.shoppingFacade.shoppingListSelected;

  readonly shoppingCategoriesNames =
    this.shoppingFacade.shoppingCategoriesNames;
  readonly shoppingCategoryNameSelected =
    this.shoppingFacade.shoppingCategoryNameSelected;

  readonly ingredientCategorySelected =
    this.shoppingFacade.ingredientCategorySelected;

  readonly shoppingListIngredients =
    this.shoppingFacade.shoppingListIngredients;

  readonly selectIngredientType = this.shoppingFacade.selectIngredientType;

  readonly ingredientName = (ingredientId: string) =>
    this.shoppingFacade.getIngredientName(ingredientId);

  readonly ingredientMeasure = (ingredientId: string) =>
    this.shoppingFacade.getIngredientMeasure(ingredientId);

  readonly ingredientUnit = (ingredientId: string) =>
    this.shoppingFacade.getIngredientUnit(ingredientId);

  readonly methods = this.shoppingFacade.methods;
  readonly methodSelected = this.shoppingFacade.methodSelected;

  readonly itemDescription = this.shoppingFacade.itemDescription;

  readonly ingredientCategoriesSorted =
    this.shoppingFacade.ingredientCategoriesSorted;

  readonly deleteElement = (element: ShoppingListElement) =>
    this.shoppingFacade.deleteElement(element);

  openAddShoppingListInputModal(event: MouseEvent) {
    this.shoppingFacade.openAddShoppingListInputModal(event);
  }

  openAddShoppingCategoryInputModal(event: MouseEvent) {
    this.shoppingFacade.openAddShoppingCategoryInputModal(event);
  }

  openExportShoppingCategoryItemsModal(event: MouseEvent) {
    this.shoppingFacade.openExportShoppingCategoryItemsModal(event);
  }

  updateShoppingListSelection(name: string) {
    this.shoppingFacade.updateShoppingListSelection(name);
  }

  updateShoppingCategoryNameSelection(name: string) {
    this.shoppingFacade.updateShoppingCategoryNameSelection(name);
  }

  toggleMethod(method: string) {
    this.shoppingFacade.toggleMethod(method);
  }
}
