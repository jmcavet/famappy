import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  Input,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../ui/button/button.component';
import { ModalService } from '../modal.service';
import { RowComponent } from '../../../primitives/row.component';
import { StackComponent } from '../../../primitives/stack.component';
import { SectionComponent } from '../../../primitives/section.component';
import { InlineComponent } from '../../../primitives/inline.component';
import { ChipComponent } from '../../../../ui/chip/chip.component';

@Component({
  selector: 'app-modal-add-ingredient',
  imports: [
    ButtonComponent,
    FormsModule,
    SectionComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    ChipComponent,
  ],
  templateUrl: './modal-add-ingredient.component.html',
  styleUrl: './modal-add-ingredient.component.css',
})
export class ModalAddIngredientComponent {
  @Input() title: string = '';
  @Input() existingItems: any[] = [];
  @Input() btnConfirmText: string = '';
  @Input() btnConfirmColor: 'primary' | 'secondary' | 'danger' = 'primary';

  name = signal<string>('');
  measure = signal<number | null>(null);
  unit = signal<string>('none');

  private modalService = inject(ModalService);

  invalidMessage: string | undefined = undefined;

  onCancel() {
    this.modalService.cancel();
  }

  ngOnInit(): void {
    if (this.name().length === 0) return;

    this.invalidMessage = 'This name already exists in the database!';
  }

  onInputChange(value: string) {
    this.invalidMessage = this.existingItems.includes(value)
      ? 'This name already exists in the database!'
      : undefined;
  }

  selectUnit(unit: string) {
    this.unit.set(unit);

    if (unit === 'none') {
      this.measure.update((old) => 1);
    } else {
      this.measure.update((old) => null);
    }
  }

  onConfirm() {
    if (this.invalidMessage || this.name().length === 0) return;

    // Pass the value provided by the user to the onConfirm method of the modal service config.

    this.modalService.confirm({
      name: this.name(),
      measure: this.measure(),
      unit: this.unit(),
    });
  }
}
