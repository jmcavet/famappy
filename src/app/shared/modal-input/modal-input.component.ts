import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ButtonComponent } from '../widgets/button/button.component';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-input',
  imports: [ButtonComponent, NgClass, FormsModule],
  templateUrl: './modal-input.component.html',
  styleUrl: './modal-input.component.css',
})
export class ModalInputComponent {
  @Input() title: string = '';
  @Input() inputValue: string = '';
  @Input() existingItems: any[] = [];
  @Input() btnConfirmText: string = '';
  @Input() btnConfirmColor: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() isModalOpen: boolean = false;
  @Output() confirmEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() confirmEventTest = new EventEmitter<{
    confirmed: boolean;
    name: string;
  }>();

  invalidMessage: string | undefined = undefined;

  @ViewChild('autoFocusInput') inputRef!: ElementRef<HTMLInputElement>;

  private wasModalPreviouslyOpen = false;

  // ngAfterViewChecked is called after each change detection
  ngAfterViewChecked() {
    // Focus the input only when modal just opened
    if (this.isModalOpen && !this.wasModalPreviouslyOpen) {
      // SetTimeout avoids timing issues when rendering elements
      setTimeout(() => this.inputRef?.nativeElement?.focus());
    }
    // Focus only happens when modal transitions from closed to open
    this.wasModalPreviouslyOpen = this.isModalOpen;
  }

  openModal() {
    this.isModalOpen = true;
    // Delay focus to allow modal rendering to finish
    setTimeout(() => {
      this.inputRef.nativeElement.focus();
    });
  }

  closeModalOnOutsideClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    if (targetElement.classList.contains('fixed')) {
      this.onCancel();
    }
  }

  closeModal() {
    this.confirmEventTest.emit({
      confirmed: false,
      name: '',
    });
    this.isModalOpen = false;
  }

  onCancel() {
    /** Reset the input value */
    this.inputValue = '';

    /** Close the modal window */
    this.closeModal();
  }

  onInputChange(value: string) {
    const existingItemNames = this.existingItems.map((item) => item.name);
    if (existingItemNames.includes(value)) {
      this.invalidMessage = 'This name already exists in the database!';
    } else {
      this.invalidMessage = undefined;
    }
  }

  onConfirm() {
    this.confirmEventTest.emit({
      confirmed: true,
      name: this.inputValue,
    });
    this.closeModal();
  }
}
