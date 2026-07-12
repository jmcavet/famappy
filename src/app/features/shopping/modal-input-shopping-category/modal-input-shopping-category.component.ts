import {
  Component,
  ElementRef,
  inject,
  input,
  Input,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SectionComponent } from '../../../shared/layout/primitives/section.component';
import { StackComponent } from '../../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../../shared/layout/primitives/row.component';
import { ModalService } from '../../../shared/layout/overlays/modal/modal.service';
import { GridComponent } from '../../../shared/layout/primitives/grid.component';
import { ShoppingCategoryDocInBackend } from '../../../models/shopping-category.model';
import { InlineComponent } from '../../../shared/layout/primitives/inline.component';

@Component({
  selector: 'app-modal-input-shopping-category',
  imports: [
    ButtonComponent,
    FormsModule,
    SectionComponent,
    StackComponent,
    RowComponent,
    GridComponent,
    InlineComponent,
  ],
  templateUrl: './modal-input-shopping-category.component.html',
  styleUrl: './modal-input-shopping-category.component.css',
})
export class ModalInputShoppingCategoryComponent {
  title = input.required<string>();
  btnConfirmText = input.required<string>();
  btnConfirmColor = input.required<'primary' | 'secondary' | 'danger'>();
  existingCategories = input.required<ShoppingCategoryDocInBackend[]>();

  category = signal<string>('');
  items = signal<string[]>([]);
  itemInput = signal<string>('');

  private modalService = inject(ModalService);

  invalidMessage: string | undefined = undefined;

  @ViewChild('autoFocusInput') inputRef!: ElementRef<HTMLInputElement>;

  ngAfterViewChecked() {
    // Focus the input only when modal just opened. SetTimeout avoids timing
    //  issues when rendering elements
    setTimeout(() => this.inputRef?.nativeElement?.focus());
  }

  onCancel() {
    this.modalService.cancel();
  }

  ngOnInit(): void {
    if (this.category().length === 0) return;

    this.invalidMessage = 'This name already exists in the database!';
  }

  onCategoryChange(value: string) {
    const existingCategoriesNames = this.existingCategories().map(
      (item) => item.name,
    );
    this.invalidMessage = existingCategoriesNames.includes(value)
      ? 'This name already exists in the database!'
      : undefined;
  }

  addItem() {
    // Update the list of items
    this.items.update((prev) => [...prev, this.itemInput()]);

    // Reset the input field for item entry
    this.itemInput.set('');
  }

  onConfirm() {
    // if (this.invalidMessage || this.categoryInput().length === 0) return;

    // Pass the value provided by the user to the onConfirm method of the modal service config.
    this.modalService.confirm({
      category: this.category(),
      items: this.items(),
    });
  }
}
