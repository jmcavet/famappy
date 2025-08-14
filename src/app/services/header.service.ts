import { inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

export type DropdownOption = {
  label: string;
  icon: string;
  url: string;
};

export interface HeaderConfig {
  title: string;
  showHomeIcon?: boolean;
  showBackIcon?: boolean;
  showDropdown?: boolean;
  dropdownOptions: DropdownOption[];
  actions: any[];
}

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  headerConfig = signal<HeaderConfig>({
    title: 'Default Title',
    showHomeIcon: true,
    showBackIcon: false,
    showDropdown: false,
    dropdownOptions: [],
    actions: [],
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute.firstChild;
          while (route?.firstChild) {
            route = route.firstChild;
          }
          const data = route?.snapshot.data || {};
          return {
            title: data['title'] || '',
            showHomeIcon: data['showHomeIcon'] ?? true,
            showBackIcon: data['showBackIcon'] ?? false,
            showDropdown: data['showDropdown'] ?? false,
            dropdownOptions: data['dropdownOptions'] ?? [],
            actions: data['actions'] ?? [],
          };
        })
      )
      .subscribe((config) => {
        this.headerConfig.set(config);
      });
  }
}
