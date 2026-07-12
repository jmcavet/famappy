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
      // Save the first available shopping list as the one selected (if not yet saved in state)
      if (!this.shoppingListNameSelected()) {
        this.shoppingService.saveShoppingListSelection(
          this.shoppingListsNames()[0],
        );
      }

      // Save the first method ('Quick entry') as the one selected
      if (!this.methodSelected())
        this.shoppingService.saveMethodSelection(this.methods[0]);

      if (!this.shoppingCategoryNameSelected()) {
        this.shoppingService.saveShoppingCategorySelection(
          this.shoppingCategoriesNames()[0],
        );
      }
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
  public shoppingCategoryItemsSelected = signal<string[]>([]);

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

  // readonly shoppingListsTest = computed(() => {
  //   const shoppingList = this.shoppingLists().map((shoppingList) => {
  //     const titi = shoppingList.ingredients.map((ing) => {
  //       const ingredientSearched = this.ingredients().find(
  //         (ingr) => ingr.id === ing.id,
  //       );
  //       const ingredientName = ingredientSearched?.name;
  //       return {
  //         name: ingredientName,
  //         measure: ing.measure,
  //         unit: ingredientSearched?.unit,
  //       };
  //     });

  //     return {
  //       id: shoppingList.id,
  //       name: shoppingList.name,
  //       ingredients: titi,
  //     };
  //   });

  //   return shoppingList;
  // });

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

  readonly shoppingListSelected = computed(() => {
    return this.shoppingLists().find(
      (list) => list.name === this.shoppingListNameSelected(),
    );
  });

  readonly shoppingListIngredients = computed(() => {
    // Shopping ingredients
    const ingredients = this.shoppingListSelected()?.ingredients;

    const selectedIngredients = this.ingredients().filter((ing) =>
      ingredients?.map((ingr) => ingr.id).includes(ing.id),
    );

    const ingredientsPerCategorySelected = selectedIngredients.filter((ing) =>
      this.ingredientCategorySelected()
        ? ing.categoryId === this.ingredientCategorySelected()?.id
        : ing,
    );

    const ingredientsIdName = ingredientsPerCategorySelected.map((ing) => ({
      ingredientId: ing.id,
      itemId: null,
      shoppingCategoryId: null,
      name: ing.name,
    }));

    // Shopping category items
    const itemsIds = this.shoppingListSelected()?.items ?? [];

    const items = this.shoppingCategoryItems().filter((item) =>
      itemsIds.includes(item.id),
    );
    const itemsIdName = items.map((item) => ({
      ingredientId: null,
      itemId: item.id,
      shoppingCategoryId: item.shoppingCategoryId,
      name: item.name,
    }));

    console.log('AAA: [...ingredientsIdName, ...itemsIdName]: ', [
      ...ingredientsIdName,
      ...itemsIdName,
    ]);

    return [...ingredientsIdName, ...itemsIdName];
  });

  readonly shoppingCategoriesNames = computed(() => {
    return this.shoppingCategories().map((list) => list.name);
  });

  readonly itemsPerSelectedCategory = computed(() => {
    const shoppingCategory = this.shoppingCategories().find(
      (cat) => cat.name === this.shoppingCategoryNameSelected(),
    );
    const shoppingCategoryId = shoppingCategory?.id;

    const shoppingCategoryItems = this.shoppingCategoryItems().filter(
      (item) => item.shoppingCategoryId === shoppingCategoryId,
    );

    return shoppingCategoryItems;
  });

  readonly itemsNamesPerSelectedCategory = computed(() =>
    this.itemsPerSelectedCategory().map((item) => item.name),
  );

  /* ════════════════════════════════
   * State Projections (expose internal state)
   * ════════════════════════════════ */
  readonly shoppingListNameSelected = computed(() => {
    return this.shoppingService.state().shoppingListNameSelected;
  });

  readonly shoppingCategoryNameSelected = computed(() => {
    return this.shoppingService.state().shoppingCategoryNameSelected;
  });

  public methodSelected = computed(
    () => this.shoppingService.state().methodSelected,
  );

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

  /* ════════════════════════════════
   * Public API (UI actions)
   * ════════════════════════════════ */
  methods = ['Quick entry', 'Ingredients', 'Other'];

  public toggleMethod(method: string) {
    this.shoppingService.saveMethodSelection(method);
  }

  public getShoppingCategoryById(categoryId: string | null) {
    return this.shoppingCategories().find((cat) => cat.id === categoryId);
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

  public openExportShoppingCategoryItemsModal(event: MouseEvent) {
    event.stopPropagation();

    const itemsIdsDisplayedOnPage = this.shoppingListSelected()?.items;

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
            await this.exportShoppingCategoryItems(items);
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

  private async exportShoppingCategoryItems(itemsNames: string[]) {
    const shoppingListIdSelected = this.shoppingLists().find(
      (list) => list.name === this.shoppingListNameSelected(),
    );

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

    const mustPreserveState = signal<boolean>(false);

    this.shoppingListDomainFacade.updateShoppingListCategories(
      shoppingListIdSelected?.id,
      currentItemsIdsUpdated,
      mustPreserveState,
    );
  }
}
