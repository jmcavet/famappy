import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  Input,
  Signal,
  signal,
} from '@angular/core';
import { MealFacade } from '../../meals.facade';
import { MealWithId } from '../../state/mealCart.model';

@Component({
  selector: 'app-modal-servings-selection',
  imports: [],
  templateUrl: './modal-servings-selection.component.html',
  styleUrl: './modal-servings-selection.component.css',
})
export class ModalServingsSelectionComponent {
  private el = inject(ElementRef);

  // Facade service
  private mealFacade = inject(MealFacade);

  @Input() dailyMealPerMealType?: MealWithId[];
  servings = input.required<Signal<number>>();
  @Input() mealType!: string;

  servingsUi = signal(0);

  isOpen = signal(false);

  ngOnInit(): void {
    if (this.dailyMealPerMealType) {
      this.servingsUi.set(this.dailyMealPerMealType[0].servings);
    }
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }

  close() {
    this.isOpen.set(false);
  }

  increaseServings() {
    this.servingsUi.update((old) => old + 1);
  }

  decreaseServings() {
    if (this.servingsUi() > 1) {
      this.servingsUi.update((old) => old - 1);
    }
  }

  validate() {
    const mealIdsToUpdate = this.dailyMealPerMealType?.map((meal) => meal.id);
    if (mealIdsToUpdate) {
      this.mealFacade.updateMealFromStore(mealIdsToUpdate, {
        servings: this.servingsUi(),
      });
    }
    this.close();
  }

  // 👇 Close when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}
