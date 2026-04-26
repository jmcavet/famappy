import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabInstructionsFacade } from './tab-instructions.facade';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-tab-instructions',
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgFor, ButtonComponent],
  providers: [TabInstructionsFacade],
  templateUrl: './tab-instructions.component.html',
  styleUrl: './tab-instructions.component.css',
})
export class TabInstructionsComponent {
  private facade = inject(TabInstructionsFacade);

  recipeInstructions = this.facade.recipeInstructions;
  editInstructionIndex = this.facade.editInstructionIndex;
  instruction = this.facade.instruction;
  addButtonIsDisabled = this.facade.addButtonIsDisabled;
  instructionErrors = this.facade.instructionErrors;

  @ViewChild('editInput') editInputRef!: ElementRef<HTMLInputElement>;

  onAddInstructionTextAreaKeyDown(event: KeyboardEvent) {
    this.facade.addInstructionTextAreaKeyDown(event);
  }

  onEditInstructionTextAreaKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const newInstruction = this.editInputRef?.nativeElement?.value ?? '';
      this.facade.updateInstruction(index, newInstruction);
    }
  }

  addInstruction() {
    this.facade.addInstruction();
  }

  onUpdateInstruction(index: number): void {
    const newInstruction = this.editInputRef?.nativeElement?.value ?? '';
    this.facade.updateInstruction(index, newInstruction);
  }

  onFocusInstruction(index: number) {
    this.facade.setEditIndex(index);

    setTimeout(() => {
      this.editInputRef?.nativeElement?.focus();
    });
  }

  onDeleteInstruction(index: number) {
    this.facade.deleteInstruction(index);
  }
}
