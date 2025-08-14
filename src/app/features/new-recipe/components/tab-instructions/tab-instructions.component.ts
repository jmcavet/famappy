import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RecipeStateService } from '../../../../services/state/recipe.service';

@Component({
  selector: 'app-tab-instructions',
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './tab-instructions.component.html',
  styleUrl: './tab-instructions.component.css',
})
export class TabInstructionsComponent {
  private fb = inject(FormBuilder);

  /** Services */
  private recipeService = inject(RecipeStateService);

  form: FormGroup = this.fb.group({});

  /** Declaration of recipe state signals */
  recipeState = this.recipeService.recipeState;
  recipeInstructions = computed(() => this.recipeState().instructions ?? []);

  // Track edit mode for instructions
  editInstructionIndex = signal<number | null>(null);

  @ViewChild('editInput') editInputRef!: ElementRef<HTMLInputElement>;

  constructor() {
    this.form = this.fb.group({
      instruction: ['', [Validators.minLength(5), Validators.maxLength(50)]],
    });
  }

  onAddInstructionTextAreaKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addInstruction();
    }
  }

  onEditInstructionTextAreaKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onUpdateInstruction(index);
    }
  }

  addInstruction() {
    const newInstruction = this.form.get('instruction')?.value;

    if (newInstruction) {
      this.recipeService.addInstructionToRecipe(newInstruction);

      // Reset the instruction input field
      this.form.get('instruction')?.reset();
    }
  }

  /** Update instruction at a specific index */
  onUpdateInstruction(index: number): void {
    const newInstruction = this.editInputRef.nativeElement.value;
    this.recipeService.updateInstruction(index, newInstruction);

    /** Reset the edit instruction index */
    this.editInstructionIndex.set(null);
  }

  /** Focus on the instruction input field when the edit button is clicked */
  onFocusInstruction(index: number): void {
    this.editInstructionIndex.set(index);

    setTimeout(() => {
      // Focus after Angular has rendered the input
      this.editInputRef.nativeElement.focus();
    });
  }

  /** Delete an instruction (from the instructions state) by its index */
  onDeleteInstruction(index: number) {
    this.recipeService.deleteInstruction(index);
  }
}
