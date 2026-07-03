import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  readonly form: FormGroup = this.formBuilder.group({
    measure: [1, [Validators.required, numberValidator]],
  });

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

  /** Internal signals */

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

  readonly measure = linkedSignal(() => {
    return this.ingredient()?.measure ?? 1;
  });

  readonly ingredient = computed(() => {
    return this.dbIngredients().find((i) => i.id === this.ingredientId());
  });

  readonly ingredientName = linkedSignal(() => {
    const ingredient = this.dbIngredients().find(
      (i) => i.id === this.ingredientId(),
    );
    return ingredient?.name ?? '';
  });

  readonly buttonIsDisabled = computed(() => {
    return this.ingredientName() === '' || !this.measure();
  });

  constructor(private destroyRef: DestroyRef) {
    this.form
      .get('measure')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.measure.set(value));

    // sync signal → form when ingredient() changes
    effect(() => {
      const value = this.measure();
      this.form.get('measure')?.setValue(value, { emitEvent: false });
    });
  }

  /* ================================
   * PUBLIC API
   * ================================ */
  changeMeasure(value: number) {
    this.measure.set(value);
  }

  addIngredientToRecipe() {
    this.recipeService.addIngredientToRecipe(
      this.ingredientName(),
      this.measure(),
      this.ingredient()?.unit ?? '',
    );

    // Reset the ingredient selected
    this.ingredientName.set('');
  }

  deleteIngredient(index: number) {
    this.recipeService.deleteIngredient(index);
  }

  // Preserve scroll position when returning from /ingredients
  navigateToIngredientsPage() {
    this.router.navigate(['/ingredients']);
  }
}
