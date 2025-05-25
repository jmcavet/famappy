import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoadingComponent } from '../../../shared/widgets/loading/loading.component';
import { IngredientTypeService } from '../../../services/ingredient-type.service';
import { HeaderService } from '../../../services/header.service';

@Component({
  selector: 'app-ingredient-categories-adder',
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgFor, LoadingComponent],
  templateUrl: './ingredient-categories-adder.component.html',
  styleUrl: './ingredient-categories-adder.component.css',
})
export class IngredientCategoriesAdderComponent {
  private _formBuilder = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private ingredientTypeService = inject(IngredientTypeService);

  @Input() existingIngredientTypeNames: string[] = [];

  buttonIsDisabled: boolean = true;
  nameAlreadyExists: boolean = false;
  isLoading: boolean = false;

  form: FormGroup = this._formBuilder.group({});
  initialForm = {
    name: '',
  };

  name: string = this.initialForm.name;

  constructor() {
    // Initialize the form group
    this.form = this._formBuilder.group({
      name: [this.name, [Validators.maxLength(16)]],
    });
  }

  ngOnInit() {
    this.form.get('name')?.valueChanges.subscribe((value) => {
      this.nameAlreadyExists = this.existingIngredientTypeNames.includes(value);
      this.buttonIsDisabled = this.isButtonDisabled();
    });
  }

  onIngredientTypeEnterPress(event: KeyboardEvent) {
    if (
      event.key === 'Enter' &&
      this.form.get('name')?.value &&
      !this.buttonIsDisabled
    ) {
      event.preventDefault();
      this.addIngredientType();
    }
  }

  // Disable button if error exists
  isButtonDisabled(): boolean {
    return (
      this.form.get('name')?.value?.length === 0 ||
      this.nameAlreadyExists ||
      false
    );
  }

  async addIngredientType() {
    this.isLoading = true;

    const newIngredientType = {
      name: this.form.get('name')?.value,
    };

    try {
      const docId =
        await this.ingredientTypeService.saveIngredientTypeIntoStore(
          newIngredientType
        );
      console.log('New ingredient type document ID: ', docId);
    } catch (error) {
      console.error('Error saving ingredient type: ', error);
    }
    this.form.get('name')?.reset();
    this.cdr.detectChanges(); // Trigger change detection to update @ViewChildren3
    this.isLoading = false;
  }
}
