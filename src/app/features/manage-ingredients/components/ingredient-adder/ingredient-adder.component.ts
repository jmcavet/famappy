import {
  Component,
  computed,
  inject,
  input,
  signal,
  Signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { IngredientBackendService } from '../../../../services/backend/ingredient.service';
import { IngredientCategoryBackendService } from '../../../../services/backend/ingredient-category.service';
import { IngredientType } from '../../../../models/ingredient-type.model';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-ingredient-adder',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    ButtonComponent,
    PickerModule,
  ],
  templateUrl: './ingredient-adder.component.html',
  styleUrl: './ingredient-adder.component.css',
})
export class IngredientAdderComponent {
  private fb = inject(FormBuilder);

  /** Services */
  private ingredientService = inject(IngredientBackendService);
  private ingredientCategoryService = inject(IngredientCategoryBackendService);

  /** Get the ingredient category selected by user */
  ingredientCategorySelected: Signal<IngredientType | undefined> =
    this.ingredientCategoryService.ingredientCategorySelected;

  /** Declaration of signals communicating with firestore */
  readonly ingredientsAreSaving = this.ingredientService.saving;

  /** Declaration of local signals */
  nameValue = signal<string>('');

  existingIngredientNames = input<string[]>([]);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
  });

  ngOnInit() {
    this.form.get('name')?.valueChanges.subscribe((value) => {
      this.nameValue.set(value);
    });
  }

  readonly pageIsLoading = computed(() => this.ingredientsAreSaving());

  readonly nameAlreadyExists = computed(() => {
    return this.existingIngredientNames().includes(this.nameValue());
  });

  readonly buttonIsDisabled = computed(() => {
    return (
      !this.nameValue() ||
      this.nameAlreadyExists() ||
      !this.ingredientCategorySelected()
    );
  });

  onIngredientEnterPress(event: KeyboardEvent) {
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

    this.ingredientService.saveIngredientIntoStore(propertiesToSave);

    this.form.get('name')?.reset();
  }
}
