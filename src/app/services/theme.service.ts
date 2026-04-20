import { effect, Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly _theme = signal<Theme>('light');
  readonly theme = this._theme.asReadonly();

  constructor() {
    // Restore theme from storage
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) {
      this._theme.set(saved);
    }

    // side effect: apply to DOM + persist
    effect(() => {
      const theme = this._theme();

      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    });
  }

  toggle() {
    this._theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }
}
