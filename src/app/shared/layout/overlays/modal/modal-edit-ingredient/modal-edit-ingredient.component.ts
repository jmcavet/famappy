import { Component, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../ui/button/button.component';
import { ChipComponent } from '../../../../ui/chip/chip.component';
import { InlineComponent } from '../../../primitives/inline.component';
import { RowComponent } from '../../../primitives/row.component';
import { SectionComponent } from '../../../primitives/section.component';
import { StackComponent } from '../../../primitives/stack.component';
import { IngredientDocInBackend } from '../../../../../models/ingredient.model';
import { ModalService } from '../modal.service';

@Component({
  selector: 'app-modal-edit-ingredient',
  imports: [
    ButtonComponent,
    ChipComponent,
    FormsModule,
    InlineComponent,
    RowComponent,
    SectionComponent,
    StackComponent,
  ],
  templateUrl: './modal-edit-ingredient.component.html',
  styleUrl: './modal-edit-ingredient.component.css',
})
export class ModalEditIngredientComponent {
  @Input() ingredient!: IngredientDocInBackend;
  @Input() existingItems: string[] = [];
  @Input() title = 'Edit ingredient';
  @Input() btnConfirmText = 'Apply';
  @Input() btnConfirmColor: 'primary' | 'secondary' | 'danger' = 'primary';

  name = '';
  measure: number | null = null;
  unit: string | null = null;
  invalidMessage: string | undefined;

  isFavorite = signal<boolean>(false);

  private modalService = inject(ModalService);

  ngOnInit(): void {
    this.name = this.ingredient.name;
    this.measure = this.ingredient.measure;
    this.unit = this.ingredient.unit || null;
    this.isFavorite.set(this.ingredient.isFavorite);
  }

  onInputChange(value: string): void {
    const normalizedName = value.trim().toLocaleLowerCase();
    const originalName = this.ingredient.name.trim().toLocaleLowerCase();
    const duplicateName = this.existingItems.some(
      (item) =>
        item.trim().toLocaleLowerCase() === normalizedName &&
        normalizedName !== originalName,
    );

    this.invalidMessage = duplicateName
      ? 'This name already exists in the database!'
      : undefined;
  }

  selectUnit(unit: string | null): void {
    this.unit = unit;
    if (this.measure === null) this.measure = 1;
  }

  toggleFavorite() {
    this.isFavorite.set(!this.isFavorite());
  }

  onCancel(): void {
    this.modalService.cancel();
  }

  onConfirm(): void {
    const name = this.name.trim();
    if (
      this.invalidMessage ||
      !name ||
      this.measure === null ||
      this.measure < 0
    ) {
      return;
    }

    this.modalService.confirm({
      name,
      measure: this.measure,
      unit: this.unit ?? '',
      isFavorite: this.isFavorite(),
    });
  }
}
