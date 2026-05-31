import { computed, Injectable, signal, Type } from '@angular/core';

export interface ModalOptions {
  onConfirm?: (payload: any) => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export interface ModalConfig {
  component: Type<any>;
  data?: Record<string, any>;
  onConfirm?: (result?: any) => void;
  onCancel?: (result?: any) => void;
  onClose?: (result?: any) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private _config = signal<ModalConfig | null>(null);
  readonly config = this._config.asReadonly();
  readonly isOpen = computed(() => this._config() !== null);

  open(
    component: Type<any>,
    data?: Record<string, any>,
    options?: ModalOptions,
  ) {
    this._config.set({ component, data, ...options });
  }

  confirm(result?: any) {
    this._config()?.onConfirm?.(result);
    this._config.set(null);
  }

  cancel() {
    this._config()?.onCancel?.();
    this._config.set(null);
  }
}
