import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ToastService } from './services/toast.service';
import { PwaUpdateService } from './pwa/pwa-update.service';
import { FooterComponent } from './shared/layout/shell/footer/footer.component';
import { ModalHostComponent } from './shared/layout/overlays/modal/modal-host.component';
import { ContextMenuHostComponent } from './shared/layout/overlays/context-menu/context-menu-host/context-menu-host.component';
import { ToastContainerComponent } from './shared/layout/overlays/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    FooterComponent,
    ToastContainerComponent,
    ModalHostComponent,
    ContextMenuHostComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit {
  private pwaUpdateService = inject(PwaUpdateService);

  @ViewChild(ToastContainerComponent)
  toastContainer!: ToastContainerComponent;

  constructor(private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.toastService.registerContainer(this.toastContainer.viewContainerRef);
  }
}
