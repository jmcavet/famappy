import {
  computed,
  effect,
  inject,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';
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
import { ModalUpdateShoppingCategoryItemsComponent } from './modals/modal-update-shopping-category-items/modal-update-shopping-category-items.component';
import { ShoppingQuickItemsDomainFacade } from '../../domain-facades/shopping-quick-items.facade';
import {
  IngredientCategoryDocInBackend,
  SortKey,
} from '../../models/ingredient.model';
import { ModalConfirmComponent } from '../../shared/layout/overlays/modal/modal-confirm/modal-confirm.component';
import { ShoppingListDocInBackend } from '../../models/shopping-list.model';
import { ModalUpdateMeasureComponent } from '../../shared/layout/overlays/modal/modal-measure/modal-update-measure.component';

export interface ShoppingListElement {
  ingredientId: string | null;
  itemId: string | null;
  shoppingCategoryId: string | null;
  name: string;
  measure: number | null;
  quickItemId: string | null;
}

export interface ShoppingCategoryItem {
  id: string;
  name: string;
}
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

      // Initialize measures
      const ingredients = this.ingredientsFound();
      if (ingredients.length > 0 && this.measures().length === 0) {
        this.measures.set(
          ingredients.map((ing) => ({ id: ing.id, measure: ing.measure })),
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
  private shoppingQuickItemsDomainFacade = inject(
    ShoppingQuickItemsDomainFacade,
  );

  private modalService = inject(ModalService);

  // /** Transitional state (shared by several ui) */
  private shoppingService = inject(ShoppingStateService);

  /* ════════════════════════════════
   * Local UI state (owned by this facade)
   * ════════════════════════════════ */
  /** Public signals */
  public quickEntryItem = signal<string>('');
  public ingredientsFound = signal<
    {
      id: string;
      name: string;
      category: string;
      measure: number;
      unit: string;
    }[]
  >([]);
  public searchIngredientsAdded = signal<
    { id: string; name: string; category: string }[]
  >([]);

  public ingredientCategorySelected = signal<IngredientType | undefined>(
    undefined,
  );
  public shoppingCategoryItemsSelected = signal<string[]>([]);

  readonly measures = signal<{ id: string; measure: number }[]>([]);

  /* ════════════════════════════════
   * Domain Data Access (proxies)
   * ════════════════════════════════ */
  readonly shoppingLists = this.shoppingListDomainFacade.dbShoppingLists;
  readonly shoppingListsLoading =
    this.shoppingListDomainFacade.shoppingListsLoading;
  readonly shoppingListsNames =
    this.shoppingListDomainFacade.dbShoppingListsNames;

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
  readonly shoppingCategoryItemsLoading =
    this.shoppingCategoryItemsDomainFacade.shoppingCategoryItemsLoading;

  readonly shoppingQuickItems =
    this.shoppingQuickItemsDomainFacade.dbShoppingQuickItems;
  readonly shoppingQuickItemsLoading =
    this.shoppingQuickItemsDomainFacade.shoppingQuickItemsLoading;

  /* ════════════════════════════════
   * Domain Projections (business logic)
   * ════════════════════════════════ */
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

  readonly shoppingListElements = computed(() => {
    // Shopping ingredients
    const ingredients = this.shoppingListSelected()?.ingredients;

    const selectedIngredients = this.ingredients().filter((ing) =>
      ingredients?.map((ingr) => ingr.id).includes(ing.id),
    );

    console.log('selectedIngredients: ', selectedIngredients);

    const ingredientsPerCategorySelected = selectedIngredients.filter((ing) =>
      this.ingredientCategorySelected()
        ? ing.categoryId === this.ingredientCategorySelected()?.id
        : ing,
    );

    const ingredientsIdName: ShoppingListElement[] =
      ingredientsPerCategorySelected.map((ing) => ({
        ingredientId: ing.id,
        itemId: null,
        shoppingCategoryId: null,
        name: ing.name,
        measure: this.getIngredientMeasure(ing.id) ?? 0,
        quickItemId: null,
      }));

    // Shopping category items
    const itemsIds = this.shoppingListSelected()?.categoryItemIds ?? [];

    const categoryItems = this.shoppingCategoryItems().filter((item) =>
      itemsIds.includes(item.id),
    );
    const categoryItemsIdName = categoryItems.map((item) => ({
      ingredientId: null,
      itemId: item.id,
      shoppingCategoryId: item.shoppingCategoryId,
      name: item.name,
      measure: null,
      quickItemId: null,
    }));

    // Quick items
    const shoppingListId = this.shoppingListSelected()?.id;

    const quickItems = this.shoppingQuickItems().filter(
      (item) => item.shoppingListId === shoppingListId,
    );

    const quickItemsIdName = quickItems.map((item) => ({
      ingredientId: null,
      itemId: null,
      shoppingCategoryId: null,
      name: item.name,
      measure: null,
      quickItemId: item.id,
    }));

    // Searched ingredients added
    const searchIngredientsIdName: ShoppingListElement[] =
      this.searchIngredientsAdded().map((ing) => ({
        ingredientId: ing.id,
        itemId: null,
        shoppingCategoryId: null,
        name: ing.name,
        measure: this.getIngredientMeasure(ing.id) ?? 0,
        quickItemId: null,
      }));

    return [
      ...ingredientsIdName,
      ...(this.ingredientCategorySelected() ? [] : categoryItemsIdName),
      ...(this.ingredientCategorySelected() ? [] : quickItemsIdName),
      ...(this.ingredientCategorySelected() ? [] : searchIngredientsIdName),
    ].sort((a, b) => a.name.localeCompare(b.name));
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

  readonly shoppingCategoryItemsTEST = computed(() => {
    return this.shoppingCategoryItems().filter(
      (item) => item.shoppingCategoryId === this.shoppingCategoryIdSelected(),
    );
  });

  /* ════════════════════════════════
   * State Projections (expose internal state)
   * ════════════════════════════════ */
  readonly shoppingListNameSelected = computed(() => {
    return this.shoppingService.state().shoppingListNameSelected;
  });

  readonly shoppingCategoryIdSelected = computed(() => {
    return this.shoppingCategories().find(
      (cat) => cat.name === this.shoppingCategoryNameSelected(),
    )?.id;
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

  ingredientsNames = computed(() => this.ingredients().map((ing) => ing.name));

  /* ════════════════════════════════
   * Public API (UI actions)
   * ════════════════════════════════ */
  methods = ['Quick entry', 'Ingredients', 'Categories'];

  public addQuickEntryItem() {
    const shoppingListId = this.shoppingListSelected()?.id;

    this.shoppingQuickItemsDomainFacade.saveShoppingQuickItem({
      name: this.quickEntryItem(),
      shoppingListId,
    });

    // Reset input field
    this.quickEntryItem.set('');
    this.ingredientsFound.set([]);
  }

  public toggleMethod(method: string) {
    this.shoppingService.saveMethodSelection(method);
  }

  public getShoppingCategoryById(categoryId: string | null) {
    return this.shoppingCategories().find((cat) => cat.id === categoryId);
  }

  setInputItem(inputEntry: string) {
    if (inputEntry.length > 2) {
      const ingredientsFound = this.ingredients()
        .filter((ing) =>
          ing.name.toLowerCase().includes(inputEntry.toLowerCase()),
        )
        .map((ing) => {
          const category =
            this.ingredientCategories().find((cat) => cat.id === ing.categoryId)
              ?.name ?? '';
          return {
            id: ing.id,
            name: ing.name,
            category,
            measure: ing.measure,
            unit: ing.unit,
          };
        });

      this.ingredientsFound.set(
        ingredientsFound.length ? ingredientsFound : [],
      );
    } else {
      this.ingredientsFound.set([]);
    }

    // Sort ingredient alphabetically
    this.ingredientsFound().sort((a, b) => a.name.localeCompare(b.name));

    this.quickEntryItem.set(inputEntry);
  }

  public openUpdateShoppingListModal(
    event: MouseEvent,
    shoppingListName: string,
  ) {
    event.stopPropagation();

    const existingItems = this.shoppingLists().map((list) => {
      return {
        id: list.id,
        name: list.name,
      };
    });

    const shoppingListId = this.shoppingLists().find(
      (list) => list.name === shoppingListName,
    )?.id;

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Update shopping list',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems,
        inputValue: shoppingListName,
      },
      {
        onConfirm: (name: string) => {
          (async () => {
            await this.updateShoppingList(shoppingListId!, name);
          })();
        },
      },
    );
  }

  public openDeleteShoppingListModal(
    event: MouseEvent,
    shoppingListName: string,
  ) {
    event.stopPropagation();

    const shoppingList = this.shoppingLists().find(
      (list) => list.name === shoppingListName,
    );

    console.log('shoppingList: ', shoppingList);

    this.modalService.open(
      ModalConfirmComponent,
      {
        title: 'Delete confirmation',
        message: `Do you really want to remove the '${shoppingListName}' list?`,
        btnConfirmText: 'Delete',
        btnConfirmColor: 'danger',
      },
      {
        onConfirm: () => this.deleteShoppingList(shoppingList!),
      },
    );
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

  public openAddShoppingCategoryItemInputModal(event: MouseEvent) {
    event.stopPropagation();
    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Add new shopping category item',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.shoppingCategoryItemsTEST(),
      },
      {
        onConfirm: (name: string) => {
          (async () => {
            await this.addShoppingCategoryItem(
              this.shoppingCategoryIdSelected(),
              name,
            );
          })();
        },
      },
    );
  }

  addShoppingCategoryItem(
    shoppingCategoryId: string | undefined,
    name: string,
  ) {
    this.shoppingCategoryItemsDomainFacade.saveShoppingCategoryItem({
      shoppingCategoryId,
      name,
    });
  }

  public openUpdateShoppingCategoryModal(event: MouseEvent) {
    event.stopPropagation();

    const itemsIdsDisplayedOnPage =
      this.shoppingListSelected()?.categoryItemIds;

    const existingItems = this.itemsPerSelectedCategory().map((item) => {
      return {
        id: item.id,
        name: item.name,
        selected: itemsIdsDisplayedOnPage?.includes(item.id),
      };
    });

    this.modalService.open(
      ModalUpdateShoppingCategoryItemsComponent,
      {
        title: 'Update shopping category',
        category: this.shoppingCategoryNameSelected(),
        existingItems,
      },
      {
        onConfirm: ({ items }) => {
          (async () => {
            await this.updateShoppingCategoryItems(items);
          })();
        },
      },
    );
  }

  public openExportShoppingCategoryItemsModal(event: MouseEvent) {
    event.stopPropagation();

    const itemsIdsDisplayedOnPage =
      this.shoppingListSelected()?.categoryItemIds;

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

  public async deleteElement(element: ShoppingListElement) {
    const { itemId, ingredientId, measure, quickItemId } = element;

    const shoppingListId = this.shoppingListSelected()?.id;
    const elementType = itemId
      ? 'categoryItemIds'
      : quickItemId
        ? 'quickItems'
        : 'ingredients';

    const _element = itemId ? itemId : { id: ingredientId, measure };

    if (quickItemId) {
      this.shoppingListDomainFacade.deleteQuickItem(quickItemId);
    } else if (shoppingListId && element) {
      this.shoppingListDomainFacade.deleteShoppingListElement(
        shoppingListId,
        elementType,
        _element,
      );
    }
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

  measureFor = (ingredientId: string): number => {
    return (
      this.measures().find((meas) => meas.id === ingredientId)?.measure ?? 0
    );
  };

  public changeMeasure(
    ingredientId: string,
    ingredientUnit: string | null,
    value: 'decr' | 'incr',
  ) {
    this.measures.update((current) =>
      current.map((m) => {
        if (m.id !== ingredientId) return m;

        let newMeasure;
        const refMeasure =
          this.ingredients().find((ing) => ing.id === ingredientId)?.measure ??
          0;

        if (ingredientUnit === null) {
          // For measures without unit
          newMeasure = value === 'decr' ? m.measure - 1 : m.measure + 1;
        } else {
          if (value === 'decr' && m.measure !== 0) {
            newMeasure = Math.max(
              0,
              Math.ceil(m.measure / refMeasure) * refMeasure - refMeasure,
            );
          } else {
            newMeasure =
              Math.floor(m.measure / refMeasure) * refMeasure + refMeasure;
          }
        }

        return {
          ...m,
          measure: newMeasure,
        };
      }),
    );
  }

  public selectIngredientSuggestion(ing: {
    id: string;
    name: string;
    category: string;
  }) {
    // Reset found ingredients and quick entry item
    this.quickEntryItem.set('');
    this.ingredientsFound.set([]);

    const shoppingListId = this.shoppingLists().find(
      (list) => list.name === this.shoppingListNameSelected(),
    )?.id;

    const updatedMeasure = this.measures().find(
      (m) => m.id === ing.id,
    )?.measure;

    this.updateOrSumIngredientMeasureInShoppingList(shoppingListId!, {
      id: ing.id,
      measure: updatedMeasure,
    });
  }

  public openUpdateQuickItemsModal(
    event: MouseEvent,
    shoppingElement: ShoppingListElement,
  ) {
    event.stopPropagation();

    const quickItemsIdsDisplayedOnPage = this.shoppingListElements()
      .filter((el) => el.quickItemId)
      .map((el) => el.quickItemId);

    const quickItemsDisplayedOnPage = this.shoppingQuickItems().filter((item) =>
      quickItemsIdsDisplayedOnPage.includes(item.id),
    );

    const existingItems = quickItemsDisplayedOnPage.map((item) => {
      return {
        id: item.id,
        name: item.name,
        selected: quickItemsIdsDisplayedOnPage?.includes(item.id),
      };
    });

    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Update quick item',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems,
        inputValue: shoppingElement.name,
      },
      {
        onConfirm: (name: string) => {
          (async () => {
            await this.updateQuickItem(shoppingElement.quickItemId!, name);
          })();
        },
      },
    );
  }

  public openUpdateIngredientMeasureModal(
    event: MouseEvent,
    shoppingElement: ShoppingListElement,
  ) {
    event.stopPropagation();

    console.log('shoppingElement: ', shoppingElement);

    const ingredient = this.ingredients().find(
      (ing) => ing.id === shoppingElement.ingredientId,
    );
    const ingredientId = ingredient?.id ?? '';
    const unit = ingredient?.unit;
    const ingredientDefaultMeasure = ingredient?.measure;
    const measure = shoppingElement.measure;

    this.modalService.open(
      ModalUpdateMeasureComponent,
      {
        title: 'Update ingredient measure',
        ingredientName: shoppingElement.name,
        unit,
        measure,
        btnConfirmColor: 'primary',
        ingredientDefaultMeasure,
      },
      {
        onConfirm: (data: { measure: number }) => {
          (async () => {
            await this.updateIngredientMeasureInShoppingList(
              ingredientId,
              data.measure,
            );
          })();
        },
      },
    );
  }

  public getIngredientUnit(ingredientId: string) {
    return (
      this.ingredients().find((ing) => ing.id === ingredientId)?.unit ?? ''
    );
  }

  public countIngredientsPerCategory(
    ingredientCategory: IngredientCategoryDocInBackend,
  ) {
    const ingredients = this.shoppingListSelected()?.ingredients;

    const selectedIngredients = this.ingredients().filter((ing) =>
      ingredients?.map((ingr) => ingr.id).includes(ing.id),
    );

    const ingredientsPerCategorySelected = selectedIngredients.filter(
      (ing) => ing.categoryId === ingredientCategory.id,
    );

    return ingredientsPerCategorySelected.length;
  }

  /* ════════════════════════════════
   * Private Helpers
   * ════════════════════════════════ */
  /**
   * Add a new shopping list.
   *
   * @param shoppingListName - name of the shopping list to create
   */
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

  /**
   * User selects category items and export them to the shopping list.
   *
   * @param itemsNames - names of the category items to export
   */
  private async exportShoppingCategoryItems(itemsNames: string[]) {
    const shoppingListIdSelected = this.shoppingLists().find(
      (list) => list.name === this.shoppingListNameSelected(),
    )?.id;

    if (!shoppingListIdSelected) return;

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

    const currentItemsIds = this.shoppingListSelected()?.categoryItemIds ?? [];

    const currentItemsIdsUpdated = [
      ...currentItemsIds,
      ...shoppingCategoryItemsIdsSelected,
    ];

    const mustPreserveState = signal<boolean>(false);

    this.shoppingListDomainFacade.updateShoppingListCategories(
      shoppingListIdSelected,
      currentItemsIdsUpdated,
      mustPreserveState,
    );
  }

  /**
   * Update the shopping category items of a specific shopping list document.
   *
   * @param items - List of items from a shopping category
   */
  private async updateShoppingCategoryItems(items: ShoppingCategoryItem[]) {
    const mustPreserveState = signal<boolean>(false);

    this.shoppingCategoryItemsDomainFacade.updateShoppingCategoryItems(
      items,
      mustPreserveState,
    );
  }

  private async updateQuickItem(
    quickItemIdToUpdate: string,
    newQuickItemName: string,
  ) {
    const mustPreserveState = signal<boolean>(false);

    await this.shoppingQuickItemsDomainFacade.updateQuickItem(
      quickItemIdToUpdate,
      newQuickItemName,
      mustPreserveState,
    );
  }

  /**
   * Update the measure of an ingredient for a specific shopping list document.
   *
   * @param ingredientId - The id of the ingredient (element of the 'ingredients' property)
   * @param updatedMeasure - Measure of the ingredient, updated by user via modal
   */
  private async updateIngredientMeasureInShoppingList(
    ingredientId: string,
    updatedMeasure: number,
  ) {
    const shoppingListId = this.shoppingListSelected()?.id;

    const currentIngredients = this.shoppingListSelected()?.ingredients ?? [];

    const existingIndex = currentIngredients.findIndex(
      (ing) => ing.id === ingredientId,
    );

    const updatedIngredients = currentIngredients.map((ing, index) =>
      index === existingIndex
        ? {
            ...ing,
            measure: updatedMeasure ?? 0,
          }
        : ing,
    );

    const mustPreserveState = signal<boolean>(false);

    this.shoppingListDomainFacade.updateIngredientsInShoppingList(
      shoppingListId!,
      updatedIngredients,
      mustPreserveState,
    );
  }

  private async updateShoppingList(
    shoppingListIdToUpdate: string,
    newShoppingListName: string,
  ) {
    const mustPreserveState = signal<boolean>(false);

    await this.shoppingListDomainFacade.updateShoppingList(
      shoppingListIdToUpdate,
      newShoppingListName,
      mustPreserveState,
    );

    this.updateShoppingListSelection(newShoppingListName);
  }

  /**
   * Update the measure of an ingredient for a specific shopping list document. If the ingredient does not exist yet
   *  in the list of ingredients, it will be added. If it exists, its new measure will be added to the original one.
   *
   * @param shoppingListIdToUpdate - The id of the shopping list selected
   * @param newIngredient - Object representing the ingredient's new values for id and measure
   */
  private async updateOrSumIngredientMeasureInShoppingList(
    shoppingListIdToUpdate: string,
    newIngredient: { id: string; measure: number | undefined },
  ) {
    const mustPreserveState = signal<boolean>(false);

    const currentIngredients = this.shoppingListSelected()?.ingredients ?? [];

    const existingIndex = currentIngredients.findIndex(
      (ing) => ing.id === newIngredient.id,
    );

    const updatedIngredients =
      existingIndex !== -1
        ? // If id already exists, sum the measures
          currentIngredients.map((ing, index) =>
            index === existingIndex
              ? {
                  ...ing,
                  measure: (ing.measure ?? 0) + (newIngredient.measure ?? 0),
                }
              : ing,
          )
        : // If id does not exist,  add as new object in the 'ingredients' property (array)
          [...currentIngredients, newIngredient];

    this.shoppingListDomainFacade.updateIngredientsInShoppingList(
      shoppingListIdToUpdate,
      updatedIngredients,
      mustPreserveState,
    );
  }

  /**
   * Delete a shopping list from db. If it contains quick items, those will be deleted as well from db.
   *
   * @param shoppingListElement - Element of a shopping list. Can be an existing ingredient, an item from an existing
   * category, or a quick item.
   */
  private async deleteShoppingList(
    shoppingListElement: ShoppingListDocInBackend,
  ) {
    const shoppingListId = shoppingListElement.id;

    // Delete shopping list from firestore
    await this.shoppingListDomainFacade.deleteShoppingList(shoppingListId);

    const correspondingShoppingQuickItemsIds = this.shoppingQuickItems()
      .filter((item) => item.shoppingListId === shoppingListId)
      .map((el) => el.id);

    // If existing, delete list-related shopping quick items from firestore
    if (correspondingShoppingQuickItemsIds.length > 0) {
      await this.shoppingQuickItemsDomainFacade.deleteShoppingQuickItems(
        correspondingShoppingQuickItemsIds,
      );
    }
  }
}
