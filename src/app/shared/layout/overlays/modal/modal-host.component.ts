import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './modal-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalHostComponent {
  modalService = inject(ModalService);
}
