import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ShoppingStateService } from './state/shopping.service';
import { ShoppingListDomainFacade } from '../../domain-facades/shopping-list.facade';
import { IngredientDomainFacade } from '../../domain-facades/ingredient.facade';
import { IngredientCategoryDomainFacade } from '../../domain-facades/ingredientCategory.facade';
import { ModalService } from '../../shared/layout/overlays/modal/modal.service';
import { ModalInputComponent } from '../../shared/layout/overlays/modal/modal-input/modal-input.component';
import { IngredientType } from '../../models/ingredient-type.model';
import { ShoppingCategoryDomainFacade } from '../../domain-facades/shopping-category.facade';
import { ModalInputShoppingCategoryComponent } from './modal-input-shopping-category/modal-input-shopping-category.component';
import { ModalExportShoppingCategoryItemsComponent } from './modals/modal-export-shopping-category-items/modal-export-shopping-category-items.component';
import { ShoppingCategoryItemsDomainFacade } from '../../domain-facades/shopping-category-items.facade';

@Injectable({ providedIn: 'root' })
export class ShoppingFacade {
  constructor() {
    effect(() => {
      // Save the first available shopping list as the one selected
      this.shoppingService.saveShoppingListSelection(
        this.shoppingListsNames()[0],
      );

      // Save the first method ('Quick entry') as the one selected
      this.shoppingService.saveMethodSelection(this.methods[0]);

      this.shoppingService.saveShoppingCategorySelection(
        this.shoppingCategoriesNames()[0],
      );
      // // Select the first available ingredient category
      // const { id, name } = this.ingredientCategoriesSorted()[0];
      // this.ingredientCategorySelected.set({ id, name });
    });
  }

  /* ════════════════════════════════
   * Dependencies (injected)
   * ════════════════════════════════*/

  /** Domain access (business state & actions) */
  private shoppingListDomainFacade = inject(ShoppingListDomainFacade);
  private shoppingCategoryDomainFacade = inject(ShoppingCategoryDomainFacade);
  private shoppingCategoryItemsDomainFacade = inject(
    ShoppingCategoryItemsDomainFacade,
  );
  private ingredientDomainFacade = inject(IngredientDomainFacade);
  private ingredientCategoryDomainFacade = inject(
    IngredientCategoryDomainFacade,
  );
  private modalService = inject(ModalService);

  // /** Transitional state (shared by several ui) */
  private shoppingService = inject(ShoppingStateService);

  /* ════════════════════════════════
   * Local UI state (owned by this facade)
   * ════════════════════════════════ */
  /** Public signals */
  public itemDescription = signal('');
  public ingredientCategorySelected = signal<IngredientType | undefined>(
    undefined,
  );

  /* ════════════════════════════════
   * Domain Data Access (proxies)
   * ════════════════════════════════ */
  /** Private signals*/
  readonly shoppingLists = this.shoppingListDomainFacade.dbShoppingLists;
  readonly shoppingListsLoading =
    this.shoppingListDomainFacade.shoppingListsLoading;
  readonly ingredients = this.ingredientDomainFacade.dbIngredients;
  readonly ingredientsLoading = this.ingredientDomainFacade.ingredientsLoading;

  readonly ingredientCategories =
    this.ingredientCategoryDomainFacade.dbIngredientCategories;
  readonly ingredientCategoriesLoading =
    this.ingredientCategoryDomainFacade.ingredientCategoriesLoading;

  readonly shoppingCategories =
    this.shoppingCategoryDomainFacade.dbShoppingCategories;

  readonly shoppingCategoryItems =
    this.shoppingCategoryItemsDomainFacade.dbShoppingCategoryItems;

  /* ════════════════════════════════
   * Domain Projections (business logic)
   * ════════════════════════════════ */
  readonly shoppingListsNames = computed(() => {
    return this.shoppingLists().map((list) => list.name);
  });

  readonly shoppingListsTest = computed(() => {
    const shoppingList = this.shoppingLists().map((shoppingList) => {
      const titi = shoppingList.ingredients.map((ing) => {
        const ingredientSearched = this.ingredients().find(
          (ingr) => ingr.id === ing.id,
        );
        const ingredientName = ingredientSearched?.name;
        return {
          name: ingredientName,
          measure: ing.measure,
          unit: ingredientSearched?.unit,
        };
      });

      return {
        id: shoppingList.id,
        name: shoppingList.name,
        ingredients: titi,
      };
    });

    return shoppingList;
  });

  readonly ingredientCategoriesSorted = computed(() => {
    const availableIngredientCategories = this.ingredientCategories().filter(
      (cat) => this.availableIngredientCategoryIds()?.includes(cat.id),
    );

    return availableIngredientCategories?.sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  });

  readonly availableIngredientCategoryIds = computed(() => {
    const availableIngredientCategoryIds =
      this.shoppingListSelected()?.ingredients.map((ing) => {
        return this.ingredients().find((ingr) => ingr.id === ing.id)
          ?.categoryId;
      });

    return [...new Set(availableIngredientCategoryIds)];
  });

  // readonly shoppingListIngredients = computed(() => {
  //   const ingredients = this.shoppingListSelected()?.ingredients;

  //   console.log('ingredients: ', ingredients);
  //   const selectedIngredients = this.ingredients().filter((ing) =>
  //     ingredients?.map((ingr) => ingr.id).includes(ing.id),
  //   );

  //   console.log(
  //     'AAAAA: shoppingCategoryItemsSelected: ',
  //     this.shoppingCategoryItemsSelected(),
  //   );

  //   console.log(
  //     'ZZZZ: ',
  //     selectedIngredients.filter((ing) =>
  //       this.ingredientCategorySelected()
  //         ? ing.categoryId === this.ingredientCategorySelected()?.id
  //         : ing,
  //     ),
  //   );

  //   return selectedIngredients.filter((ing) =>
  //     this.ingredientCategorySelected()
  //       ? ing.categoryId === this.ingredientCategorySelected()?.id
  //       : ing,
  //   );
  // });

  readonly shoppingListIngredients = computed(() => {
    const ingredients = this.shoppingListSelected()?.ingredients;

    const selectedIngredients = this.ingredients().filter((ing) =>
      ingredients?.map((ingr) => ingr.id).includes(ing.id),
    );

    const gege = selectedIngredients.filter((ing) =>
      this.ingredientCategorySelected()
        ? ing.categoryId === this.ingredientCategorySelected()?.id
        : ing,
    );

    const fromObjects = gege.map((ing) => ({
      id: ing.id,
      name: ing.name,
    }));

    console.log('fromObjects: ', fromObjects);

    const itemsIds = this.shoppingListSelected()?.items ?? [];

    const items = this.shoppingCategoryItems().filter((item) =>
      itemsIds.includes(item.id),
    );
    const fromStrings = items.map((item) => ({
      id: null,
      name: item.name,
    }));

    console.log('fromStrings: ', fromStrings);

    return [...fromObjects, ...fromStrings];
  });

  readonly shoppingCategoriesNames = computed(() => {
    return this.shoppingCategories().map((list) => list.name);
  });

  /* ════════════════════════════════
   * State Projections (expose internal state)
   * ════════════════════════════════ */
  readonly shoppingListNameSelected = computed(() => {
    return this.shoppingService.state().shoppingListNameSelected;
  });

  readonly shoppingListSelected = computed(() => {
    return this.shoppingLists().find(
      (list) => list.name === this.shoppingListNameSelected(),
    );
  });

  public methodSelected = computed(
    () => this.shoppingService.state().methodSelected,
  );

  readonly shoppingCategoryNameSelected = computed(() => {
    return this.shoppingService.state().shoppingCategoryNameSelected;
  });

  /* ════════════════════════════════
   * View Model (UI logic / presentation state)
   * ════════════════════════════════ */
  readonly dataIsLoading = computed(() => {
    return (
      this.ingredientsLoading() ||
      this.shoppingListsLoading() ||
      this.ingredientCategoriesLoading()
    );
  });

  readonly shoppingListsSorted = computed(() => {
    const sorted = this.shoppingListsTest().map((shoppingList) => ({
      ...shoppingList,
      ingredients: [...shoppingList.ingredients].sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? ''),
      ),
    }));

    return sorted;
  });

  /* ════════════════════════════════
   * Public API (UI actions)
   * ════════════════════════════════ */
  methods = ['Quick entry', 'Ingredients', 'Other'];

  public toggleMethod(method: string) {
    this.shoppingService.saveMethodSelection(method);
  }

  public openAddShoppingListInputModal(event: MouseEvent) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Enter new shopping list',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.shoppingLists(),
      },
      {
        onConfirm: (name: string) => {
          (async () => {
            await this.addShoppingList(name);
          })();
        },
      },
    );
  }

  public openAddShoppingCategoryInputModal(event: MouseEvent) {
    event.stopPropagation();

    this.modalService.open(
      ModalInputShoppingCategoryComponent,
      {
        title: 'Create new shopping category',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingCategories: this.shoppingCategories(),
      },
      {
        onConfirm: ({ category, items }) => {
          (async () => {
            await this.addShoppingcategory(category, items);
          })();
        },
      },
    );
  }

  itemsPerSelectedCategory = computed(() => {
    const shoppingCategory = this.shoppingCategories().find(
      (cat) => cat.name === this.shoppingCategoryNameSelected(),
    );
    const shoppingCategoryId = shoppingCategory?.id;

    const shoppingCategoryItems = this.shoppingCategoryItems().filter(
      (item) => item.shoppingCategoryId === shoppingCategoryId,
    );

    return shoppingCategoryItems;
  });

  itemsNamesPerSelectedCategory = computed(() =>
    this.itemsPerSelectedCategory().map((item) => item.name),
  );

  public openExportShoppingCategoryItemsModal(event: MouseEvent) {
    event.stopPropagation();

    const itemsIdsDisplayedOnPage = this.shoppingListSelected()?.items;

    const titi = this.itemsPerSelectedCategory().filter((item) => {
      return itemsIdsDisplayedOnPage?.includes(item.id);
    });

    console.log('titi: ', titi);

    const existingItems = this.itemsPerSelectedCategory().map((item) => {
      return {
        id: item.id,
        name: item.name,
        selected: itemsIdsDisplayedOnPage?.includes(item.id),
      };
    });

    this.modalService.open(
      ModalExportShoppingCategoryItemsComponent,
      {
        title: 'Export category items',
        category: this.shoppingCategoryNameSelected(),
        existingItems,
      },
      {
        onConfirm: ({ items }) => {
          (async () => {
            await this.exportShoppingcategoryItems(items);
          })();
        },
      },
    );
  }

  public selectIngredientType(
    ingredientTypeElement: IngredientType,
    atLeastOneUnitSelected: boolean,
  ) {
    this.ingredientCategorySelected.set(
      atLeastOneUnitSelected ? undefined : ingredientTypeElement,
    );

    // this.shoppingService.setSelectedIngredientCategory(
    //   this.ingredientCategorySelected(),
    // );
  }

  public updateShoppingListSelection(shoppingListName: string | null) {
    if (shoppingListName !== null) {
      this.shoppingService.saveShoppingListSelection(shoppingListName);
    }
  }

  public updateShoppingCategoryNameSelection(
    shoppingCategoryName: string | null,
  ) {
    if (shoppingCategoryName !== null) {
      this.shoppingService.saveShoppingCategorySelection(shoppingCategoryName);
    }
  }

  public getIngredientName(ingredientId: string) {
    return (
      this.ingredients().find((ing) => ing.id === ingredientId)?.name ?? ''
    );
  }

  public getIngredientMeasure(ingredientId: string) {
    const ingredients = this.shoppingListSelected()?.ingredients;

    return ingredients?.find((ing) => ing.id === ingredientId)?.measure;
  }

  public getIngredientUnit(ingredientId: string) {
    return (
      this.ingredients().find((ing) => ing.id === ingredientId)?.unit ?? ''
    );
  }

  /* ════════════════════════════════
   * Private Helpers
   * ════════════════════════════════ */
  private async addShoppingList(shoppingListName: string) {
    this.shoppingListDomainFacade.saveShoppingList({
      name: shoppingListName,
      ingredients: [],
    });

    this.shoppingService.saveShoppingListSelection(shoppingListName);
  }

  private async addShoppingcategory(name: string, items: string[]) {
    // this.shoppingCategoryDomainFacade.saveShoppingCategory({ name, items });
    const shoppingCategoryId =
      await this.shoppingCategoryDomainFacade.saveShoppingCategory({
        name,
      });

    // TODO: create a method 'saveShoppingCategoryItemSSS' to save multiple docs at the same time
    items.forEach((item) => {
      this.shoppingCategoryItemsDomainFacade.saveShoppingCategoryItem({
        name: item,
        shoppingCategoryId,
      });
    });

    this.shoppingService.saveShoppingCategorySelection(name);
  }

  shoppingCategoryItemsSelected = signal<string[]>([]);

  private async exportShoppingcategoryItems(itemsNames: string[]) {
    const shoppingListIdSelected = this.shoppingLists().find(
      (list) => list.name === this.shoppingListNameSelected(),
    );

    const mustPreserveState = signal<boolean>(false);

    if (!shoppingListIdSelected?.id) return;

    const shoppingCategorySelected = this.shoppingCategories().find(
      (cat) => cat.name === this.shoppingCategoryNameSelected(),
    );

    const shoppingCategoryItemsSelected = this.shoppingCategoryItems().filter(
      (item) =>
        itemsNames.includes(item.name) &&
        item.shoppingCategoryId === shoppingCategorySelected?.id,
    );

    const shoppingCategoryItemsIdsSelected = shoppingCategoryItemsSelected.map(
      (item) => item.id,
    );

    const currentItemsIds = this.shoppingListSelected()?.items ?? [];

    const currentItemsIdsUpdated = [
      ...currentItemsIds,
      ...shoppingCategoryItemsIdsSelected,
    ];

    this.shoppingListDomainFacade.updateShoppingListCategories(
      shoppingListIdSelected?.id,
      currentItemsIdsUpdated,
      mustPreserveState,
    );

    // this.shoppingCategoryItemsSelected.set(items);
  }
}
