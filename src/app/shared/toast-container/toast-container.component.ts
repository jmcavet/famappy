import { Component, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-toast-container',
  imports: [],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
})
export class ToastContainerComponent {
  @ViewChild('toastContainer', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  public get viewContainerRef() {
    return this.container;
  }
}
