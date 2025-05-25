import {
  AfterViewInit,
  Component,
  Inject,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { HeaderComponent } from './header/header/header.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { BottomNavigationComponent } from './footer/bottomNavigation/bottom-navigation.component';
import { ToastContainerComponent } from './shared/toast-container/toast-container.component';
import { ToastService } from './services/toast.service';

interface Item {
  id: string;
  text: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    HeaderComponent,
    ButtonModule,
    InputTextModule,
    DialogModule,
    MatMenuModule,
    MatButtonModule,
    BottomNavigationComponent,
    FooterComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit {
  @ViewChild(ToastContainerComponent)
  toastContainer!: ToastContainerComponent;

  constructor(private toastService: ToastService) {}

  message: string = '';

  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  ngAfterViewInit(): void {
    this.toastService.registerContainer(this.toastContainer.viewContainerRef);
  }

  items?: Item[];

  onSubmit() {
    this.message = '';
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
  }
}
