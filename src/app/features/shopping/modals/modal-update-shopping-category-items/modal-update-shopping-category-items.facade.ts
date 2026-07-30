import {
  computed,
  effect,
  inject,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { ModalUpdateShoppingCategoryItemsContext } from './modal-update-shopping-category-items.component';
import { ShoppingListDomainFacade } from '../../../../domain-facades/shopping-list.facade';
import { ShoppingCategoryItemsDomainFacade } from '../../../../domain-facades/shopping-category-items.facade';
import { ShoppingCategoryItem } from '../../shopping.facade';

export interface ShoppingListElement {
  ingredientId: string | null;
  itemId: string | null;
  shoppingCategoryId: string | null;
  name: string;
  measure: number | null;
}
@Injectable({ providedIn: 'root' })
export class ModalUpdateShoppingCategoryItemsFacade {
  /* ════════════════════════════════
   * Dependencies (injected)
   * ════════════════════════════════*/

  /** Domain access (business state & actions) */
  private shoppingListDomainFacade = inject(ShoppingListDomainFacade);
  private shoppingCategoryItemsDomainFacade = inject(
    ShoppingCategoryItemsDomainFacade,
  );
  private modalService = inject(ModalService);

  // /** Transitional state (shared by several ui) */
  // private shoppingService = inject(ShoppingStateService);

  /* ================================
   * Component context (set via connect())
   * ================================ */
  /** Private signals */
  // private _ctx!: ModalUpdateShoppingCategoryItemsContext;
  private readonly _ctx =
    signal<ModalUpdateShoppingCategoryItemsContext | null>(null);

  public connect(ctx: ModalUpdateShoppingCategoryItemsContext) {
    console.log('CTX.existingItems: ', ctx.existingItems());
    this._ctx.set(ctx);
  }

  /* ════════════════════════════════
   * Local UI state (owned by this facade)
   * ════════════════════════════════ */
  /** Public signals */
  // public itemDescription = signal('');
  // public shoppingCategoryItemsSelected = signal<string[]>([]);
  mustPreserveState = signal<boolean>(false);

  /* ════════════════════════════════
   * Domain Data Access (proxies)
   * ════════════════════════════════ */
  /** Private signals*/
  // readonly shoppingLists = this.shoppingListDomainFacade.dbShoppingLists;
  // readonly shoppingListsLoading =
  //   this.shoppingListDomainFacade.shoppingListsLoading;
  // readonly shoppingListsNames =
  //   this.shoppingListDomainFacade.dbShoppingListsNames;

  // readonly ingredients = this.ingredientDomainFacade.dbIngredients;
  // readonly ingredientsLoading = this.ingredientDomainFacade.ingredientsLoading;

  // readonly ingredientCategories =
  //   this.ingredientCategoryDomainFacade.dbIngredientCategories;
  // readonly ingredientCategoriesLoading =
  //   this.ingredientCategoryDomainFacade.ingredientCategoriesLoading;

  // readonly shoppingCategories =
  //   this.shoppingCategoryDomainFacade.dbShoppingCategories;

  // readonly shoppingCategoryItems =
  //   this.shoppingCategoryItemsDomainFacade.dbShoppingCategoryItems;

  /* ════════════════════════════════
   * Domain Projections (business logic)
   * ════════════════════════════════ */

  /* ════════════════════════════════
   * State Projections (expose internal state)
   * ════════════════════════════════ */

  /* ════════════════════════════════
   * View Model (UI logic / presentation state)
   * ════════════════════════════════ */
  // readonly dataIsLoading = computed(() => {
  //   return (
  //     this.ingredientsLoading() ||
  //     this.shoppingListsLoading() ||
  //     this.ingredientCategoriesLoading()
  //   );
  // });

  readonly itemValues = linkedSignal<ShoppingCategoryItem[]>(() => [
    ...(this._ctx()?.existingItems() ?? []),
  ]);

  readonly originalItemsHaveChanged = computed(() => {
    const original = this._ctx()?.existingItems();
    const current = this.itemValues();

    return current.some((currentItem) => {
      const originalItem = original?.find((o) => o.id === currentItem.id);
      return originalItem?.name !== currentItem.name;
    });
  });

  /* ════════════════════════════════
   * Public API (UI actions)
   * ════════════════════════════════ */

  public deleteItem(item: ShoppingCategoryItem) {
    // Remove from UI immediately
    this.itemValues.update((current) =>
      current.filter((i) => i.id !== item.id),
    );

    // Remove from database
    this.shoppingCategoryItemsDomainFacade.deleteShoppingCategoryItem(item.id);
  }

  public cancel() {
    this.modalService.cancel();
  }

  public confirm() {
    // Identify only the items that have changed
    const original = this._ctx()?.existingItems();

    const itemsUpdated = this.itemValues().filter((item) => {
      return original?.find((o) => o.id === item.id)?.name !== item.name;
    });

    // Pass the value provided by the user to the onConfirm method of the modal service config.
    this.modalService.confirm({
      items: itemsUpdated,
    });
  }

  public updateItem(index: number, name: string) {
    this.itemValues.update((current) => {
      const updated = [...current];
      updated[index] = { ...updated[index], name };
      return updated;
    });
  }

  // public async deleteElement(element: ShoppingListElement) {
  //   const { itemId, ingredientId, measure } = element;

  //   const shoppingListId = this.shoppingListSelected()?.id;
  //   const elementType = itemId ? 'items' : 'ingredients';

  //   const _element = itemId ? itemId : { id: ingredientId, measure };

  //   if (shoppingListId && element) {
  //     this.shoppingListDomainFacade.deleteShoppingListElement(
  //       shoppingListId,
  //       elementType,
  //       _element,
  //     );
  //   }
  // }

  /* ════════════════════════════════
   * Private Helpers
   * ════════════════════════════════ */
}
