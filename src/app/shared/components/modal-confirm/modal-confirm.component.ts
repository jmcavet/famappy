import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-modal-confirm',
  imports: [ButtonComponent, NgClass],
  templateUrl: './modal-confirm.component.html',
  styleUrl: './modal-confirm.component.css',
})
export class ModalConfirmComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() btnConfirmText: string = '';
  @Input() btnConfirmColor: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() isModalOpen: boolean = false;
  @Output() confirmEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  openModal() {
    this.isModalOpen = true;
  }

  closeModalOnOutsideClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    if (targetElement.classList.contains('fixed')) {
      this.closeModal();
    }
  }

  closeModal() {
    this.confirmEvent.emit(false);
    this.isModalOpen = false;
  }

  onCancel() {
    this.closeModal();
  }

  onConfirm() {
    this.confirmEvent.emit(true);
    this.closeModal();
  }
}
