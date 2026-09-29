import { ComponentRef, Injectable, ViewContainerRef } from '@angular/core';
import { ToastComponent } from '../shared/layout/overlays/toast/toast.component';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private containerRef!: ViewContainerRef;

  registerContainer(container: ViewContainerRef) {
    this.containerRef = container;
  }

  show(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
  ) {
    if (!this.containerRef) {
      throw new Error(
        'Toast container not set. Call registerContainer() first.',
      );
    }

    const componentRef: ComponentRef<ToastComponent> =
      this.containerRef.createComponent(ToastComponent);

    componentRef.setInput('message', message);
    componentRef.setInput('type', type);
    componentRef.changeDetectorRef.detectChanges();

    setTimeout(() => {
      componentRef.destroy();
    }, 3000);
  }
}
