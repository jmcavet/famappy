import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoadingComponent } from '../../../shared/layout/overlays/loading/loading.component';
import { HeaderShellComponent } from '../../../shared/layout/shell/header-shell.component';
import { PageLayoutComponent } from '../../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../../shared/layout/primitives/section.component';
import { StackComponent } from '../../../shared/layout/primitives/stack.component';
import { InlineComponent } from '../../../shared/layout/primitives/inline.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SegmentedControlComponent } from '../../../shared/ui/segmented-control/segmented-control.component';
import { MeasureControlComponent } from '../components/measure-control/measure-control.component';
import { GridComponent } from '../../../shared/layout/primitives/grid.component';
import { RowComponent } from '../../../shared/layout/primitives/row.component';
import { ShoppingListDomainFacade } from '../../../domain-facades/shopping-list.facade';
import { ShoppingStateService } from '../state/shopping.service';
import { FirestoreService } from '../../../services/backend/generic.service';
import { StepperComponent } from '../components/stepper/stepper.component';

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
  private router = inject(Router);

  /** Transitional state (shared by several ui) */
  private shoppingService = inject(ShoppingStateService);

  public shoppingListTitle = signal('');

  dataIsLoading = computed(() => false);

  async addShoppingList() {
    // Kepp only ingredients that have a measure != 0
    const ingredients = this.shoppingService
      .state()
      .measures.filter((ing) => ing.measure !== 0);

    const propertiesToSave = {
      name: this.shoppingListTitle(),
      ingredients,
    };

    await this.shoppingListDomainFacade.saveShoppingList(propertiesToSave);

    // Navigate back to the shopping page with the list already selected & displayed
    this.shoppingService.saveShoppingListSelection(this.shoppingListTitle());
    this.router.navigateByUrl('/shopping');

    // Reset the state
    this.shoppingService.resetStateKeepListSelected();
  }
}
