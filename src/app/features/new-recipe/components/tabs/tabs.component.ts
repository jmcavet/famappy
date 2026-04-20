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
import { RecipeStateService } from '../../../../services/state/recipe.service';
import { SegmentedControlComponent } from '../../../../shared/ui/segmented-control/segmented-control.component';

@Component({
  selector: 'app-tabs',
  imports: [CommonModule, SegmentedControlComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
})
export class TabsComponent {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> | undefined;

  /** Services */
  private recipeService = inject(RecipeStateService);

  /** Declaration of local signals */
  recipeState = this.recipeService.recipeState;

  readonly tabsTitles = signal<string[]>([]);

  /** Declaration of recipe state signals */
  readonly selectedTabTitle = computed(
    () => this.recipeState().selectedTabTitle,
  );

  toggleTab(tabTitle: string) {
    this.recipeService.updateProperty('selectedTabTitle', tabTitle);
    this.activateSelectedTab();
  }

  ngAfterContentInit() {
    this.activateSelectedTab();

    // Set initially
    this.tabsTitles.set(this.tabs?.toArray().map((tab) => tab.tabTitle) ?? []);
  }

  activateSelectedTab() {
    this.tabs?.toArray().forEach((t) => {
      return (t.active = t.tabTitle === this.selectedTabTitle() ? true : false);
    });
  }
}
