import { Component, inject, effect } from '@angular/core';
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
import { IngredientCategoryDocInBackend } from '../../models/ingredient.model';
import { RowComponent } from '../../shared/layout/primitives/row.component';
import { c } from '../../../../node_modules/@angular/cdk/a11y-module.d-DBHGyKoh';
import { HighlightMatchPipe } from '../../shared/pipes/highlight-match.pipe';
import { MeasureControlComponent } from './components/measure-control/measure-control.component';

@Component({
  selector: 'app-shopping',
  imports: [
    HeaderShellComponent,
    PageLayoutComponent,
    GridComponent,
    StackComponent,
    SectionComponent,
    InlineComponent,
    RowComponent,
    FooterComponent,
    SegmentedControlComponent,
    ButtonComponent,
    ChipComponent,
    SelectTestComponent,
    MeasureControlComponent,
    LoadingComponent,
    HighlightMatchPipe,
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css',
})
export class ShoppingComponent {
  private shoppingFacade = inject(ShoppingFacade);

  constructor() {
    effect(() => {
      console.log(
        'shoppingListNameSelected in shopping:',
        this.shoppingListNameSelected(),
      );
    });
  }

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

  readonly shoppingListElements = this.shoppingFacade.shoppingListElements;

  readonly selectIngredientType = this.shoppingFacade.selectIngredientType;

  readonly ingredientName = (ingredientId: string) =>
    this.shoppingFacade.getIngredientName(ingredientId);

  readonly ingredientMeasure = (ingredientId: string) =>
    this.shoppingFacade.getIngredientMeasure(ingredientId);

  readonly ingredientUnit = (ingredientId: string) =>
    this.shoppingFacade.getIngredientUnit(ingredientId);

  readonly methods = this.shoppingFacade.methods;
  readonly methodSelected = this.shoppingFacade.methodSelected;

  readonly quickEntryItem = this.shoppingFacade.quickEntryItem;
  readonly ingredientsFound = this.shoppingFacade.ingredientsFound;

  readonly ingredientCategoriesSorted =
    this.shoppingFacade.ingredientCategoriesSorted;

  readonly deleteElement = (element: ShoppingListElement) =>
    this.shoppingFacade.deleteElement(element);

  countIngredientsPerCategory(cat: IngredientCategoryDocInBackend) {
    return this.shoppingFacade.countIngredientsPerCategory(cat);
  }

  selectIngredientSuggestion(ing: {
    id: string;
    name: string;
    category: string;
  }) {
    this.shoppingFacade.selectIngredientSuggestion(ing);
  }

  shoppingQuickItems = this.shoppingFacade.shoppingQuickItems;

  setInputItem(item: string) {
    this.shoppingFacade.setInputItem(item);
  }

  measureFor(ingredientId: string) {
    return this.shoppingFacade.measureFor(ingredientId);
  }

  onMeasuresChange(
    ingredientId: string,
    ingredientUnit: string | null,
    value: 'decr' | 'incr',
  ) {
    this.shoppingFacade.changeMeasure(ingredientId, ingredientUnit, value);
  }

  addQuickEntryItem = () => this.shoppingFacade.addQuickEntryItem();

  openUpdateShoppingListModal(event: MouseEvent, shoppingListName: string) {
    this.shoppingFacade.openUpdateShoppingListModal(event, shoppingListName);
  }

  openDeleteShoppingListModal(event: MouseEvent, shoppingListName: string) {
    this.shoppingFacade.openDeleteShoppingListModal(event, shoppingListName);
  }

  openAddShoppingListInputModal(event: MouseEvent) {
    this.shoppingFacade.openAddShoppingListInputModal(event);
  }

  openAddShoppingCategoryInputModal(event: MouseEvent) {
    this.shoppingFacade.openAddShoppingCategoryInputModal(event);
  }

  openAddShoppingCategoryItemInputModal(event: MouseEvent) {
    this.shoppingFacade.openAddShoppingCategoryItemInputModal(event);
  }

  openUpdateShoppingCategoryModal(event: MouseEvent) {
    this.shoppingFacade.openUpdateShoppingCategoryModal(event);
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

  openUpdateQuickItemsModal(event: MouseEvent, ing: ShoppingListElement) {
    this.shoppingFacade.openUpdateQuickItemsModal(event, ing);
  }

  openUpdateIngredientMeasureModal(
    event: MouseEvent,
    ing: ShoppingListElement,
  ) {
    this.shoppingFacade.openUpdateIngredientMeasureModal(event, ing);
  }
}
