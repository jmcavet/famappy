import {
  Component,
  computed,
  ContentChildren,
  inject,
  QueryList,
} from '@angular/core';
import { TabComponent } from '../tab/tab.component';
import { CommonModule } from '@angular/common';
import { RecipeStateService } from '../../../../services/state/recipe.service';

@Component({
  selector: 'app-tabs',
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
})
export class TabsComponent {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> | undefined;

  /** Services */
  private recipeService = inject(RecipeStateService);

  /** Declaration of local signals */
  recipeState = this.recipeService.recipeState;

  /** Declaration of recipe state signals */
  readonly selectedTabTitle = computed(
    () => this.recipeState().selectedTabTitle
  );

  ngAfterContentInit() {
    this.activateSelectedTab();
  }

  selectTab(tab: TabComponent) {
    this.recipeService.updateProperty('selectedTabTitle', tab.tabTitle);
    this.activateSelectedTab();
  }

  activateSelectedTab() {
    this.tabs?.toArray().forEach((t) => {
      return (t.active = t.tabTitle === this.selectedTabTitle() ? true : false);
    });
  }
}
