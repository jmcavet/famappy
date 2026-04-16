import { AfterViewInit, Component, ViewChild } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ToastService } from './services/toast.service';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ModalHostComponent } from './shared/modal/modal-host.component';
import { ContextMenuHostComponent } from './shared/context-menu/context-menu-host/context-menu-host.component';

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
  @ViewChild(ToastContainerComponent)
  toastContainer!: ToastContainerComponent;

  constructor(private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.toastService.registerContainer(this.toastContainer.viewContainerRef);
  }
}
