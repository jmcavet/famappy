import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabInstructionsFacade } from './tab-instructions.facade';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { SectionComponent } from '../../../../shared/layout/primitives/section.component';
import { FormGridComponent } from '../../../../shared/layout/primitives/form-grid.component';
import { ContextMenuService } from 'primeng/api';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';
import { ModalInputComponent } from '../../../../shared/layout/overlays/modal/modal-input/modal-input.component';

@Component({
  selector: 'app-tab-instructions',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    SectionComponent,
    StackComponent,

    FormGridComponent,
    RowComponent,
    InlineComponent,
  ],
  providers: [TabInstructionsFacade],
  templateUrl: './tab-instructions.component.html',
  styleUrl: './tab-instructions.component.css',
})
export class TabInstructionsComponent {
  private facade = inject(TabInstructionsFacade);
  private modalService = inject(ModalService);

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

  existingItems = computed(() =>
    this.recipeInstructions().map((instr) => {
      return {
        name: instr,
      };
    }),
  );

  openUpdateInstructionModal(instructionIndex: number) {
    this.modalService.open(
      ModalInputComponent,
      {
        title: 'Update instruction',
        btnConfirmText: 'Apply',
        btnConfirmColor: 'primary',
        existingItems: this.existingItems(),
        inputValue: this.recipeInstructions()[instructionIndex],
      },
      {
        onConfirm: (instructionUpdated: string) => {
          this.facade.updateInstruction(instructionIndex, instructionUpdated);
        },
      },
    );
  }
}
