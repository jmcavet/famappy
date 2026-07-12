import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoadingComponent } from '../../../shared/layout/overlays/loading/loading.component';
import { HeaderShellComponent } from '../../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../../shared/layout/primitives/page-layout.component';
import { StepperComponent } from '../../meals/meals-cart/components/stepper/stepper.component';
import { SectionComponent } from '../../../shared/layout/primitives/section.component';
import { StackComponent } from '../../../shared/layout/primitives/stack.component';
import { InlineComponent } from '../../../shared/layout/primitives/inline.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SegmentedControlComponent } from '../../../shared/ui/segmented-control/segmented-control.component';
import { MeasureControlComponent } from '../components/measure-control/measure-control.component';
import { GridComponent } from '../../../shared/layout/primitives/grid.component';
import { NgClass } from '@angular/common';
import { RowComponent } from '../../../shared/layout/primitives/row.component';
import { ShoppingListDomainFacade } from '../../../domain-facades/shopping-list.facade';
import { ShoppingStateService } from '../../meals/state/shopping.service';
import { FirestoreService } from '../../../services/backend/generic.service';

@Component({
  selector: 'app-shopping-list-definition',
  imports: [
    RouterLink,
    LoadingComponent,
    HeaderShellComponent,
    PageLayoutComponent,
    StepperComponent,
    SectionComponent,
    StackComponent,
    InlineComponent,
    ButtonComponent,
    RowComponent,
  ],
  templateUrl: './shopping-list-definition.component.html',
  styleUrl: './shopping-list-definition.component.css',
})
export class ShoppingListDefinitionComponent {
  private firestoreService = inject(FirestoreService);
  private shoppingListDomainFacade = inject(ShoppingListDomainFacade);

  /** Transitional state (shared by several ui) */
  private shoppingService = inject(ShoppingStateService);

  public shoppingListTitle = signal('');

  dataIsLoading = computed(() => false);

  async addShoppingList() {
    const propertiesToSave = {
      name: this.shoppingListTitle(),
      ingredients: this.shoppingService.state().measures,
    };

    this.shoppingListDomainFacade.saveShoppingList(propertiesToSave);
  }
}
