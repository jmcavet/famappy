import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from './services/toast.service';
import { ModalHostComponent } from './shared/layout/overlays/modal/modal-host.component';
import { ContextMenuHostComponent } from './shared/layout/overlays/context-menu/context-menu-host/context-menu-host.component';
import { ToastContainerComponent } from './shared/layout/overlays/toast-container/toast-container.component';
import { PwaUpdateService } from './pwa/pwa-update.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    ToastContainerComponent,
    ModalHostComponent,
    ContextMenuHostComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit {
  private readonly pwaUpdateService = inject(PwaUpdateService);

  @ViewChild(ToastContainerComponent)
  toastContainer!: ToastContainerComponent;

  constructor(private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.toastService.registerContainer(this.toastContainer.viewContainerRef);
  }
}
