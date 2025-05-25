import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RecipeService } from '../../../../services/recipe.service';

@Component({
  selector: 'app-tab-instructions',
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './tab-instructions.component.html',
  styleUrl: './tab-instructions.component.css',
})
export class TabInstructionsComponent {
  private recipeService = inject(RecipeService);

  private _formBuilder = inject(FormBuilder);

  form: FormGroup = this._formBuilder.group({});
  initialForm = {
    instruction: '',
  };

  instruction: string = this.initialForm.instruction;

  // Track edit mode for instructions
  editInstructionIndex: number | null = null;

  @ViewChildren('inputField') inputFields: QueryList<ElementRef> | undefined;

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      instruction: [
        this.instruction,
        [Validators.minLength(5), Validators.maxLength(50)],
      ],
    });
  }

  get instructions() {
    return this.recipeService.recipeState.instructions;
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
      const updatedInstructions = [...this.instructions, newInstruction];
      this.recipeService.updateRecipeState('instructions', updatedInstructions);

      /** Reset the instruction input field */
      this.form.get('instruction')?.reset();
    }
  }

  /** Update instruction at a specific index */
  onUpdateInstruction(index: number): void {
    /** Use a copy of the instructions array to preserve immutability */
    const updatedInstructions = [...this.instructions];

    /** Update the specific instruction */
    updatedInstructions[index] =
      this.inputFields?.toArray()[0].nativeElement.value;

    this.recipeService.updateRecipeState('instructions', updatedInstructions);

    /** Reset the edit instruction index */
    this.editInstructionIndex = null;
  }

  /** Focus on the instruction input field when the edit button is clicked */
  onFocusInstruction(index: number): void {
    this.editInstructionIndex = index;
    setTimeout(() => {
      /** Focus on the specific input field when edit mode is triggered */
      const input = this.inputFields?.toArray()[0];
      if (input) {
        input.nativeElement.focus();
      }
    });
  }

  onDeleteInstruction(index: number) {
    /** Use updateRecipeState() instead of this.instructions.splice(1, index)
     * updateRecipeState:
     * - preserves immutability (copies and replaces state)
     * - triggers updates via BehaviorSubject.next()
     * - all state updates go through a single path
     * - is aligned with reactive programming
     * */
    const updatedInstructions = this.instructions.filter((_, i) => i !== index);
    this.recipeService.updateRecipeState('instructions', updatedInstructions);
  }
}
