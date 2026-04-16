import { Component, computed, inject, Input } from '@angular/core';
import { MealStateService } from '../../../state/meal.service';
import { Router } from '@angular/router';
import { MealFilterStateService } from '../../../state/mealFilter.service';
import { MealCartStateService } from '../../../state/mealCart.service';

@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css',
})
export class StepperComponent {
  private mealService = inject(MealStateService);
  private filterService = inject(MealFilterStateService);
  private cartService = inject(MealCartStateService);
  private router = inject(Router);

  @Input() navStep: number = 0;

  urls = [
    '/meals/definition',
    '/meals/filter',
    '/meals/selection',
    '/meals/cart',
  ];

  steps = ['Definition', 'Filter', 'Selection', 'Cart'];

  selectStep(iter: number) {
    this.mealService.updateProperty('currentNavStep', iter);
    this.router.navigate([this.urls[iter - 1]]);
  }

  currentNavStep = computed(() => this.mealService.state().currentNavStep);

  readonly canSelectStep2Or3 = computed<boolean>(
    () => this.filterService.state().recipesFiltered.length > 0,
  );

  readonly canSelectStep4 = computed<boolean>(
    () => this.cartService.state().cart.length > 0,
  );

  readonly finalCartIsNotEmpty = computed(() => {
    return this.cartService.state().finalCart.length > 0;
  });
}
