import { Component, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../ui/button/button.component';
import { ModalService } from '../modal.service';
import { RowComponent } from '../../../primitives/row.component';
import { StackComponent } from '../../../primitives/stack.component';
import { SectionComponent } from '../../../primitives/section.component';
import { MeasureControlComponent } from '../../../../../features/shopping/components/measure-control/measure-control.component';

@Component({
  selector: 'modal-update-measure',
  imports: [
    ButtonComponent,
    FormsModule,
    SectionComponent,
    StackComponent,
    RowComponent,
    MeasureControlComponent,
  ],
  templateUrl: './modal-update-measure.component.html',
  styleUrl: './modal-update-measure.component.css',
})
export class ModalUpdateMeasureComponent {
  @Input() title: string = '';
  @Input() btnConfirmColor: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() ingredientName: string = '';
  @Input() unit: string = '';
  @Input() measure: number = 0;
  @Input() ingredientDefaultMeasure: number = 0;

  measureTest = signal<number>(0);

  private modalService = inject(ModalService);

  invalidMessage: string | undefined = undefined;

  onCancel() {
    this.modalService.cancel();
  }

  ngOnInit(): void {
    this.measureTest.set(this.measure);
  }

  public changeMeasure(value: 'decr' | 'incr') {
    let newMeasure;
    const refMeasure = this.ingredientDefaultMeasure;

    if (this.unit === null) {
      // For measure without unit
      newMeasure =
        value === 'decr' ? this.measureTest() - 1 : this.measureTest() + 1;
    } else {
      if (value === 'decr' && this.measureTest() !== 0) {
        newMeasure = Math.max(
          0,
          Math.ceil(this.measureTest() / refMeasure) * refMeasure - refMeasure,
        );
      } else {
        newMeasure =
          Math.floor(this.measureTest() / refMeasure) * refMeasure + refMeasure;
      }
    }

    this.measureTest.set(newMeasure);
  }

  onConfirm() {
    // Pass the value provided by the user to the onConfirm method of the modal service config.
    this.modalService.confirm({
      measure: this.measureTest(),
    });
  }
}
