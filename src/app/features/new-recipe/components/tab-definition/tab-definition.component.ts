import { Component, inject, input, Signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { RecipeCategoryDocInBackend } from '../../../../models/cuisine.model';
import {
  Difficulty,
  Frequency,
  Price,
  Season,
} from '../../../../models/recipe.model';
import { ChipComponent } from '../../../../shared/ui/chip/chip.component';
import { TabDefinitionFacade } from './tab-definition.facade';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

export interface TabDefinitionContext {
  buttonType: Signal<string>;
}

@Component({
  selector: 'app-tab-definition',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CapitalizePipe,
    ButtonComponent,
    ChipComponent,
    LoadingComponent,
  ],
  providers: [TabDefinitionFacade],
  templateUrl: './tab-definition.component.html',
  styleUrl: './tab-definition.component.css',
})
export class TabDefinitionComponent {
  buttonType = input.required<string>();

  private facade = inject(TabDefinitionFacade);

  difficultyOptions: Difficulty[] = ['low', 'normal', 'high'];
  priceOptions: Price[] = ['low', 'normal', 'high'];
  frequencyOptions: Frequency[] = ['weekly', 'monthly', 'yearly'];
  seasonOptions: Season[] = ['spring', 'summer', 'autumn', 'winter'];

  readonly dbRecipeCategories = this.facade.dbRecipeCategories;

  form = this.facade.form;
  readonly messageServings = this.facade.messageServings;
  readonly price = this.facade.price;
  readonly frequency = this.facade.frequency;
  readonly difficulty = this.facade.difficulty;
  readonly seasonsSelected = this.facade.seasonsSelected;
  readonly imageFile = this.facade.imageFile;
  readonly imageUrl = this.facade.imageUrl;

  readonly selectedCategoryIds = this.facade.selectedCategoryIds;
  readonly cuisineName = this.facade.cuisineName;
  readonly mealCategoryName = this.facade.mealCategoryName;
  readonly messageUniqueTitle = this.facade.messageUniqueTitle;

  dataLoading = this.facade.dataLoading;

  private ctx: TabDefinitionContext = {
    buttonType: this.buttonType,
  };

  ngOnInit() {
    this.facade.connect(this.ctx);

    this.facade.initializeForm();
  }

  resetRecipeState() {
    this.facade.resetRecipeState();
  }

  onTitleChange(value: string) {
    this.facade.onTitleChange(value);
  }

  openAddRecipeCategoryInputModal(event: MouseEvent) {
    this.facade.openAddRecipeCategoryInputModal(event);
  }

  decreaseServings() {
    this.facade.decreaseServings();
  }

  increaseServings() {
    this.facade.increaseServings();
  }

  setDifficulty(difficultySelected: Difficulty) {
    this.facade.setDifficulty(difficultySelected);
  }

  setPrice(priceSelected: Price) {
    this.facade.setPrice(priceSelected);
  }

  setFrequency(frequencySelected: Frequency) {
    this.facade.setFrequency(frequencySelected);
  }

  setSeason(seasonSelected: Season) {
    this.facade.setSeason(seasonSelected);
  }

  setRecipeCategory(recipeCategorySelected: RecipeCategoryDocInBackend) {
    this.facade.setRecipeCategory(recipeCategorySelected);
  }

  navigateToCuisinePage() {
    this.facade.navigateToCuisinePage();
  }

  navigateToMealCategoryPage() {
    this.facade.navigateToMealCategoryPage();
  }

  ngAfterViewInit() {
    this.facade.scrollBackToCuisineButton();
  }

  async onFileSelected(event: any) {
    this.facade.onFileSelected(event);
  }

  removeImage() {
    this.facade.removeImage();
  }
}
