import { computed, Injectable, signal, Type } from '@angular/core';

export interface ContextMenuConfig {
  component: Type<any>;
  data?: Record<string, any>;
  anchor: { x: number; y: number }; // position from click event
}

@Injectable({ providedIn: 'root' })
export class ContextMenuService {
  private _config = signal<ContextMenuConfig | null>(null);
  readonly config = this._config.asReadonly();
  readonly isOpen = computed(() => this._config() !== null);

  open(component: Type<any>, event: MouseEvent, data?: Record<string, any>) {
    this._config.set({
      component,
      data,
      anchor: { x: event.clientX, y: event.clientY }, // position from click
    });
  }

  close() {
    this._config.set(null);
  }
}
