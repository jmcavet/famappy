import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter, map } from 'rxjs';

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
}

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private headerConfigSubject = new BehaviorSubject<HeaderConfig>({
    title: 'Default Title',
    showHomeIcon: true,
    showBackIcon: false,
    showDropdown: false,
    dropdownOptions: [],
  });
  headerConfig$ = this.headerConfigSubject.asObservable();

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
          };
        })
      )
      .subscribe((config) => {
        this.setHeaderConfig(config);
      });
  }

  setHeaderConfig(config: HeaderConfig) {
    this.headerConfigSubject.next(config);
  }
}
