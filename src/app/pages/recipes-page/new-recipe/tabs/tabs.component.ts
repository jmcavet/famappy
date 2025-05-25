import { Component, ContentChildren, inject, QueryList } from '@angular/core';
import { TabComponent } from '../tab/tab.component';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../../../services/recipe.service';

@Component({
  selector: 'app-tabs',
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
})
export class TabsComponent {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> | undefined;

  selectedTabTitle: string = '';

  private recipeService = inject(RecipeService);

  ngOnInit() {
    this.recipeService.recipeState$.subscribe((state) => {
      this.selectedTabTitle = state.selectedTabTitle;
      this.activateSelectedTab();
    });
  }

  ngAfterContentInit() {
    this.activateSelectedTab();
  }

  selectTab(tab: TabComponent) {
    this.recipeService.updateRecipeState('selectedTabTitle', tab.tabTitle);
  }

  activateSelectedTab() {
    this.tabs?.toArray().forEach((t) => {
      return (t.active = t.tabTitle === this.selectedTabTitle ? true : false);
    });
  }
}
