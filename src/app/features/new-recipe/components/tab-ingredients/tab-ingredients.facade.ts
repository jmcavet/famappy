import {
  computed,
  inject,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';
import { RecipeStateService } from '../../../../services/state/recipe.service';

import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { numberValidator } from '../../../../shared/validators/form-validators';
import { IngredientDomainFacade } from '../../../../domain-facades/ingredient.facade';

@Injectable()
export class TabIngredientsFacade {
  /* ================================
   * Dependencies
   * ================================ */
  /** Framework dependencies */
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  /** Domain access (business state & actions) */
  private ingredientDomainFacade = inject(IngredientDomainFacade);

  /** Transitional state */
  private recipeService = inject(RecipeStateService);

  /* ================================
   * Domain-derived state
   * ================================ */
  readonly dbIngredients = this.ingredientDomainFacade.dbIngredients;

  /* ================================
   * Local state
   * ================================ */
  /** Signals rendered on UI */
  readonly unit = signal<string>('');

  /** Internal signals */
  private readonly measure = signal<number>(1);

  readonly form: FormGroup = this.formBuilder.group({
    measure: [1, [Validators.required, numberValidator]],
  });

  /* ================================
   * Local derived state
   * ================================ */
  /** Private signals */
  private readonly ingredientId = computed(
    () => this.recipeService.recipeState().ingredientId,
  );

  /** Public signals */
  readonly recipeIngredients = computed(
    () => this.recipeService.recipeState().ingredients ?? [],
  );

  readonly ingredientName = linkedSignal(() => {
    const ingredient = this.dbIngredients().find(
      (i) => i.id === this.ingredientId(),
    );
    return ingredient?.name ?? 'none';
  });

  readonly buttonIsDisabled = computed(() => {
    return this.ingredientName() === 'none' || !this.measure();
  });

  /* ================================
   * PUBLIC API
   * ================================ */
  /** Subscribe to the 'measure' input field value changes */
  initializeForm() {
    this.form.get('measure')?.valueChanges.subscribe((value) => {
      this.measure.set(value ?? 1);
    });
  }

  selectUnit(unit: string) {
    this.unit.update((current) => (current === unit ? '' : unit));
  }

  addIngredientToRecipe() {
    this.recipeService.addIngredientToRecipe(
      this.ingredientName(),
      this.measure(),
      this.unit(),
    );

    // Reset the ingredient selected
    this.ingredientName.set('none');
  }

  deleteIngredient(index: number) {
    this.recipeService.deleteIngredient(index);
  }

  // Preserve scroll position when returning from /ingredients
  navigateToIngredientsPage() {
    this.router.navigate(['/ingredients']);
  }
}
