import {
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { RecipeStateService } from '../../../../services/state/recipe.service';
import { IngredientBackendService } from '../../../../services/backend/ingredient.service';
import {
  IngredientDocInBackend,
  IngredientWithIdAndDate,
} from '../../../../models/ingredient.model';
import { numberValidator } from '../../../../shared/validators/form-validators';

@Component({
  selector: 'app-tab-ingredients',
  imports: [FormsModule, ReactiveFormsModule, CapitalizePipe, NgClass],
  templateUrl: './tab-ingredients.component.html',
  styleUrl: './tab-ingredients.component.css',
})
export class TabIngredientsComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  /** Services */
  public recipeService = inject(RecipeStateService);
  public ingredientService = inject(IngredientBackendService);

  /** Declaration of signals communicating with firestore */
  readonly dbIngredients: Signal<IngredientDocInBackend[]> =
    this.ingredientService.ingredients;

  form: FormGroup = this.fb.group({});

  UNITS: string[] = ['cl', 'l', 'g', 'Kg'];

  /** Declaration of local signals */
  ingredientName = signal<string>('none');
  unit = signal<string>('');
  measure = signal<number>(1);

  /** Declaration of recipe state signals */
  readonly recipeState = this.recipeService.recipeState;
  readonly recipeIngredients = computed(
    () => this.recipeState().ingredients ?? []
  );
  readonly ingredient = computed(() => this.recipeState().ingredient);
  readonly ingredientId = computed(() => this.recipeState().ingredientId);

  constructor() {
    effect(() => {
      const ingredient = this.dbIngredients().find(
        (ingredient) => ingredient.id === this.ingredientId()
      );
      this.ingredientName.set(ingredient?.name ?? 'none');
    });

    // Initialize the form group
    this.form = this.fb.group({
      measure: [1, [Validators.required, numberValidator]],
    });
  }

  ngOnInit(): void {
    this.form.get('measure')?.valueChanges.subscribe((value) => {
      this.measure.set(value ?? 1);
    });
  }

  buttonIsDisabled = computed(() => {
    return this.ingredientName() === 'none' || !this.measure();
  });

  selectUnit(unit: string) {
    this.unit.update((current) => (current === unit ? '' : unit));
  }

  addIngredientToRecipe() {
    this.recipeService.addIngredientToRecipe(
      this.ingredientName(),
      this.measure(),
      this.unit()
    );

    // Reset the ingredient selected
    this.ingredientName.set('none');
  }

  onDeleteIngredient(index: number) {
    this.recipeService.deleteIngredient(index);
  }

  navigateToIngredientsPage() {
    // Store the actual target (button) so that when going back from the /meal-category page to the /new-recipe page,
    // the view scrolls back automatically to the button itself and not the top of the page (default).
    this.router.navigate(['/ingredients']);
  }
}
