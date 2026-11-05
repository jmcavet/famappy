import { inject, Injectable } from '@angular/core';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';

@Injectable()
export class ModalShoppingFavoritesFacade {
  private readonly modalService = inject(ModalService);

  close() {
    this.modalService.cancel();
  }

  validate() {
    this.modalService.confirm();
  }
}
