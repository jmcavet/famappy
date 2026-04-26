import { computed, inject, Injectable, signal } from '@angular/core';
import { RecipeStateService } from '../../../../services/state/recipe.service';

@Injectable()
export class TabInstructionsFacade {
  /* ================================
   * Dependencies
   * ================================ */
  /** Transitional state */
  private recipeService = inject(RecipeStateService);

  /* ================================
   * Local state
   * ================================ */
  /** Signals rendered on UI */
  readonly editInstructionIndex = signal<number | null>(null);
  readonly instruction = signal<string>('');

  /* ================================
   * Local derived state
   * ================================ */
  /** Public signals */
  readonly recipeInstructions = computed(
    () => this.recipeService.recipeState().instructions ?? [],
  );

  readonly instructionErrors = computed(() => {
    const value = this.instruction();
    if (!value) return null;
    if (value.length < 5) return 'minlength';
    if (value.length > 100) return 'maxlength';
    return null;
  });

  readonly addButtonIsDisabled = computed(
    () => !this.instruction() || !!this.instructionErrors(),
  );

  /* ================================
   * PUBLIC API
   * ================================ */
  addInstructionTextAreaKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addInstruction();
    }
  }

  addInstruction() {
    if (this.addButtonIsDisabled()) return;
    this.recipeService.addInstructionToRecipe(this.instruction());
    this.instruction.set('');
  }

  updateInstruction(index: number, newInstruction: string): void {
    this.recipeService.updateInstruction(index, newInstruction);

    this.editInstructionIndex.set(null);
  }

  setEditIndex(index: number): void {
    this.editInstructionIndex.set(index);
  }

  deleteInstruction(index: number) {
    this.recipeService.deleteInstruction(index);
  }
}
