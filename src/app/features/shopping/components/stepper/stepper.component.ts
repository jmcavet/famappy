import { Component, computed, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ShoppingStateService } from '../../state/shopping.service';

@Component({
  selector: 'app-shopping-stepper',
  imports: [],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css',
})
export class StepperComponent {
  private shoppingService = inject(ShoppingStateService);
  private router = inject(Router);

  @Input() navStep: number = 0;

  urls = [
    '/shopping/meals-selection',
    '/shopping/ingredients-selection',
    '/shopping/shopping-list-definition',
  ];

  steps = ['Meals', 'Ingredients', 'Shopping List'];

  selectStep(iter: number) {
    this.shoppingService.updateProperty('currentNavStep', iter);
    this.router.navigate([this.urls[iter - 1]]);
  }

  currentNavStep = computed(() => this.shoppingService.state().currentNavStep);

  readonly canSelectStep2 = computed<boolean>(
    () => this.shoppingService.state().shoppingMealsSelected.length > 0,
  );
}
