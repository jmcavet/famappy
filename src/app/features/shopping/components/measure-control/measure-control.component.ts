import { Component, input, output, signal } from '@angular/core';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-measure-control',
  imports: [RowComponent, InlineComponent, ButtonComponent],
  templateUrl: './measure-control.component.html',
  styleUrl: './measure-control.component.css',
})
export class MeasureControlComponent {
  measure = input<number>(1);
  unit = input<string>('Kg');
  measureChange = output<'decr' | 'incr'>();
  disabled = input<boolean>(false);

  decrease() {
    if (this.measure() > 0) {
      this.measureChange.emit('decr');
    }
  }

  increase() {
    this.measureChange.emit('incr');
  }
}
