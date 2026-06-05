import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../ui/button/button.component';
import { ModalService } from '../modal.service';
import { RowComponent } from '../../../primitives/row.component';
import { StackComponent } from '../../../primitives/stack.component';
import { SectionComponent } from '../../../primitives/section.component';

@Component({
  selector: 'app-modal-input',
  imports: [
    ButtonComponent,
    FormsModule,
    SectionComponent,
    StackComponent,
    RowComponent,
  ],
  templateUrl: './modal-input.component.html',
  styleUrl: './modal-input.component.css',
})
export class ModalInputComponent {
  @Input() title: string = '';
  @Input() inputValue: string = '';
  @Input() existingItems: any[] = [];
  @Input() btnConfirmText: string = '';
  @Input() btnConfirmColor: 'primary' | 'secondary' | 'danger' = 'primary';

  private modalService = inject(ModalService);

  invalidMessage: string | undefined = undefined;

  @ViewChild('autoFocusInput') inputRef!: ElementRef<HTMLInputElement>;

  ngAfterViewChecked() {
    // Focus the input only when modal just opened. SetTimeout avoids timing
    //  issues when rendering elements
    setTimeout(() => this.inputRef?.nativeElement?.focus());
  }

  onCancel() {
    this.modalService.cancel();
  }

  ngOnInit(): void {
    if (this.inputValue.length === 0) return;

    this.invalidMessage = 'This name already exists in the database!';
  }

  onInputChange(value: string) {
    const existingItemNames = this.existingItems.map((item) => item.name);

    this.invalidMessage = existingItemNames.includes(value)
      ? 'This name already exists in the database!'
      : undefined;
  }

  onConfirm() {
    if (this.invalidMessage || this.inputValue.length === 0) return;

    // Pass the value provided by the user to the onConfirm method of the modal service config.
    this.modalService.confirm(this.inputValue);
  }
}
