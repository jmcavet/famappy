import { Component, inject, input, Input } from '@angular/core';
import { SectionComponent } from '../../../../shared/layout/primitives/section.component';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { TagComponent } from '../../../../shared/ui/tag/tag.component';
import { ModalService } from '../../../../shared/layout/overlays/modal/modal.service';

@Component({
  selector: 'app-manual-entry-view',
  imports: [
    SectionComponent,
    StackComponent,
    RowComponent,
    InlineComponent,
    TagComponent,
    ButtonComponent,
  ],
  templateUrl: './manual-entry-view.component.html',
  styleUrl: './manual-entry-view.component.css',
})
export class ManualEntryViewComponent {
  name = input.required<string>();
  ingredients = input.required<string[]>();

  private modalService = inject(ModalService);

  onClose() {
    this.modalService.cancel();
  }
}
