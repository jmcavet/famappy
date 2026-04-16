import { Component, inject, Input } from '@angular/core';
import { ButtonComponent } from '../../ui/button/button.component';
import { ModalService } from '../../modal/modal.service';

@Component({
  selector: 'app-modal-confirm',
  imports: [ButtonComponent],
  templateUrl: './modal-confirm.component.html',
  styleUrl: './modal-confirm.component.css',
})
export class ModalConfirmComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() btnConfirmText: string = '';
  @Input() btnConfirmColor: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() isModalOpen: boolean = false;

  private modalService = inject(ModalService);

  onCancel() {
    this.modalService.cancel();
  }

  onConfirm() {
    this.modalService.confirm();
  }
}
