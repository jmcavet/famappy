import { computed, inject, Injectable, signal } from '@angular/core';
import { IngredientCategoryBackendService } from '../../../../services/backend/ingredient-category.service';
import { IngredientDomainFacade } from '../../../../domain-facades/ingredient.facade';
import { IngredientAdderContext } from './ingredient-adder.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class IngredientAdderFacade {
  /* ================================
   * Dependencies
   * ================================ */
  /** Framework dependencies */
  private formBuilder = inject(FormBuilder);

  /** Domain access (business state & actions) */
  private ingredientDomainFacade = inject(IngredientDomainFacade);

  /* ================================
   * Domain-derived state
   * ================================ */
  private ingredientCategoryService = inject(IngredientCategoryBackendService);

  readonly ingredientCategorySelected =
    this.ingredientCategoryService.ingredientCategorySelected;
  readonly ingredientsSaving = this.ingredientDomainFacade.ingredientsSaving;

  /* ================================
   * Component context (set via connect())
   * ================================ */
  /** Private signals */
  private _ctx!: IngredientAdderContext;
  public connect(ctx: IngredientAdderContext) {
    this._ctx = ctx;
  }

  /* ================================
   * Local state
   * ================================ */
  /** Private signals */
  private nameValue = signal<string>('');

  readonly form: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
  });

  /* ================================
   * Local derived state
   * ================================ */
  /** Public signals */
  readonly pageIsLoading = this.ingredientsSaving;

  readonly nameAlreadyExists = computed(() => {
    return this._ctx.existingIngredientNames().includes(this.nameValue());
  });

  readonly buttonIsDisabled = computed(() => {
    return (
      !this.nameValue() ||
      this.nameAlreadyExists() ||
      !this.ingredientCategorySelected()
    );
  });

  /* ================================
   * PUBLIC API
   * ================================ */
  subscribeForm() {
    this.form.get('name')?.valueChanges.subscribe((value) => {
      this.nameValue.set(value);
    });
  }

  ingredientEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addIngredient();
    }
  }

  async addIngredient() {
    if (!this.ingredientCategorySelected()) {
      return;
    }

    const propertiesToSave = {
      categoryId: this.ingredientCategorySelected()?.id,
      name: this.nameValue(),
    };

    this.ingredientDomainFacade.saveIngredient(propertiesToSave);

    this.form.get('name')?.reset();
  }
}
