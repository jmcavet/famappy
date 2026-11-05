import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { ModalShoppingFavoritesFacade } from './modal-shopping-favorites.facade';

@Component({
  selector: 'app-modal-shopping-favorites',
  imports: [ButtonComponent, RowComponent],
  providers: [ModalShoppingFavoritesFacade],
  templateUrl: './modal-shopping-favorites.component.html',
  styleUrl: './modal-shopping-favorites.component.css',
})
export class ModalShoppingFavoritesComponent {
  private readonly facade = inject(ModalShoppingFavoritesFacade);

  close() {
    this.facade.close();
  }

  validate() {
    this.facade.validate();
  }
}
