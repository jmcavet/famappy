import { Component, ElementRef, ViewChild, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ManualEntryFacade } from './manual-entry.facade';
import { CalendarDay } from '../calendar/calendar.facade';
import { MealType, MealWithId } from '../../state/mealCart.model';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ModalService } from '../../../../shared/modal/modal.service';

@Component({
  selector: 'app-manual-entry',
  imports: [FormsModule, ButtonComponent],
  templateUrl: './manual-entry.component.html',
  styleUrl: './manual-entry.component.css',
})
export class ManualEntryComponent {
  private modalService = inject(ModalService);

  // Fed by *ngComponentOutlet via config.data
  title = input<string>('');
  dailyMealPlan = input.required<{
    weekDay: CalendarDay;
    recipes: MealWithId[];
  }>();

  mealType = input.required<MealType>();

  /** UI Facade */
  private facade = inject(ManualEntryFacade);

  /** Rendered on UI */
  mealDescription = this.facade.mealDescription;
  ingredients = this.facade.ingredients;
  ingredientSearched = this.facade.ingredientSearched;
  suggestedIngredients = this.facade.suggestedIngredients;
  dbIngredientsNames = this.facade.dbIngredientsNames;
  ingredientFromDb = this.facade.ingredientFromDb;
  createAnother = this.facade.createAnother;

  constructor() {
    this.facade.connect(this.dailyMealPlan, this.mealType, this.modalService);
  }

  @ViewChild('autoFocusInput') inputRef!: ElementRef<HTMLInputElement>;
  // ngAfterViewChecked is called after each change detection
  ngAfterViewChecked() {
    this.facade.ngAfterViewChecked(this.inputRef);
  }

  selectSuggestedIngredient(suggestedIngredient: string) {
    this.facade.selectSuggestedIngredient(suggestedIngredient);
  }

  toggleCreateAnother() {
    this.facade.toggleCreateAnother();
  }

  addIngredient() {
    this.facade.addIngredient();
  }

  removeIngredient(index: number) {
    this.facade.removeIngredient(index);
  }

  cancel() {
    this.facade.cancel();
  }

  onConfirm() {
    this.facade.onConfirm();
  }
}
