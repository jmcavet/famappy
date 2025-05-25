import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { LoadingComponent } from '../../../shared/widgets/loading/loading.component';
import { IngredientType } from '../../../models/ingredient-type.model';
import { IngredientService } from '../../../services/ingredient.service';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-ingredient-adder',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    LoadingComponent,
    PickerModule,
  ],
  templateUrl: './ingredient-adder.component.html',
  styleUrl: './ingredient-adder.component.css',
})
export class IngredientAdderComponent {
  private _formBuilder = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private ingredientService = inject(IngredientService);

  form: FormGroup = this._formBuilder.group({});
  initialForm = {
    name: '',
    type: '',
  };

  @Input() ingredientType: IngredientType | undefined = undefined;
  @Input() existingIngredientNames: string[] = [];

  buttonIsDisabled: boolean = true;
  nameAlreadyExists: boolean = false;
  isLoading: boolean = false;

  name: string = this.initialForm.name;
  type: string = this.initialForm.type;

  constructor() {
    // Initialize the form group
    this.form = this._formBuilder.group({
      name: [this.name, [Validators.maxLength(16)]],
      type: [this.type],
    });
  }

  ngOnInit() {
    this.form.get('name')?.valueChanges.subscribe((value) => {
      this.nameAlreadyExists = this.existingIngredientNames.includes(value);
      this.buttonIsDisabled = this.isButtonDisabled();
    });
  }

  onIngredientEnterPress(event: KeyboardEvent) {
    if (
      event.key === 'Enter' &&
      this.ingredientType &&
      this.form.get('name')?.value
    ) {
      event.preventDefault();
      this.addIngredient();
    }
  }

  async addIngredient() {
    if (!this.ingredientType) {
      return;
    }

    this.isLoading = true;

    const newIngredient = {
      typeId: this.ingredientType.id,
      // typeName: this.ingredientType.name,
      name: this.form.get('name')?.value,
    };

    try {
      const docId = await this.ingredientService.saveIngredientIntoStore(
        newIngredient
      );
      console.log('New ingredient document ID: ', docId);
    } catch (error) {
      console.error('Error saving ingredient: ', error);
    }
    this.form.get('name')?.reset();
    this.cdr.detectChanges(); // Trigger change detection to update @ViewChildren3
    this.isLoading = false;
  }

  // Disable button if error exists
  isButtonDisabled(): boolean {
    return (
      this.form.get('name')?.value?.length === 0 ||
      this.nameAlreadyExists ||
      false
    );
  }
}
