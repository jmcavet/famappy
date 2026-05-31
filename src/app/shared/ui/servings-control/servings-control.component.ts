import { Component, input, output, signal } from '@angular/core';
import { RowComponent } from '../../layout/primitives/row.component';
import { InlineComponent } from '../../layout/primitives/inline.component';

@Component({
  selector: 'app-servings-control',
  imports: [RowComponent, InlineComponent],
  templateUrl: './servings-control.component.html',
  styleUrl: './servings-control.component.css',
})
export class ServingsControlComponent {
  servings = input<number>(1);
  servingsChange = output<number>();

  decrease() {
    if (this.servings() > 1) {
      this.servingsChange.emit(this.servings() - 1);
    }
  }

  increase() {
    this.servingsChange.emit(this.servings() + 1);
  }
}
