import {
  Component,
  computed,
  ContentChildren,
  inject,
  QueryList,
  signal,
} from '@angular/core';
import { TabComponent } from '../tab/tab.component';
import { CommonModule } from '@angular/common';
import { SegmentedControlComponent } from '../../../../shared/ui/segmented-control/segmented-control.component';
import { GlobalStateService } from '../../../../services/global.service';

@Component({
  selector: 'app-tabs',
  imports: [CommonModule, SegmentedControlComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
})
export class TabsComponent {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> | undefined;

  /** Services */
  private globalService = inject(GlobalStateService);

  /** Declaration of local signals */
  globalState = this.globalService.globalState;

  readonly tabsTitles = signal<string[]>([]);

  readonly selectedTabTitle = computed(
    () => this.globalState().selectedTabTitle,
  );

  toggleTab(tabTitle: string) {
    this.globalService.updateProperty('selectedTabTitle', tabTitle);
    this.activateSelectedTab();
  }

  ngAfterContentInit() {
    this.activateSelectedTab();

    // Set initially
    this.tabsTitles.set(this.tabs?.toArray().map((tab) => tab.tabTitle) ?? []);

    // Activate the first tab
    this.toggleTab(this.tabsTitles()[0]);
  }

  activateSelectedTab() {
    this.tabs?.toArray().forEach((t) => {
      return (t.active = t.tabTitle === this.selectedTabTitle() ? true : false);
    });
  }
}
