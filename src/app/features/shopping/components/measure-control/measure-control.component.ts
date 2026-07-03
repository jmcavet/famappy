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
  measureChange = output<number>();
  disabled = input<boolean>(false);

  decrease() {
    if (this.measure() > 1) {
      this.measureChange.emit(this.measure() - 1);
    }
  }

  increase() {
    this.measureChange.emit(this.measure() + 1);

    console.log('measure: ', this.measure());
    console.log('unit: ', this.unit());
  }
}
