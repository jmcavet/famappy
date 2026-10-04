import {
  Component,
  ElementRef,
  inject,
  input,
  Signal,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
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
import { LoadingComponent } from '../../../../shared/layout/overlays/loading/loading.component';
import { StackComponent } from '../../../../shared/layout/primitives/stack.component';
import { SectionComponent } from '../../../../shared/layout/primitives/section.component';
import { RowComponent } from '../../../../shared/layout/primitives/row.component';
import { InlineComponent } from '../../../../shared/layout/primitives/inline.component';
import { ServingsControlComponent } from '../../../../shared/ui/servings-control/servings-control.component';
import { GridResponsiveComponent } from '../../../../shared/layout/primitives/grid-responsive.component';
import { FormGridComponent } from '../../../../shared/layout/primitives/form-grid.component';
import { cropRecipeImage } from './recipe-image-crop';

export interface TabDefinitionContext {
  buttonType: Signal<string>;
  recipeId: Signal<string>;
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
    StackComponent,
    SectionComponent,
    FormGridComponent,
    RowComponent,
    InlineComponent,
    ServingsControlComponent,
  ],
  providers: [TabDefinitionFacade],
  templateUrl: './tab-definition.component.html',
  styleUrl: './tab-definition.component.css',
})
export class TabDefinitionComponent {
  buttonType = input.required<string>();
  recipeId = input<string>('');

  private facade = inject(TabDefinitionFacade);

  difficultyOptions: Difficulty[] = ['easy', 'medium', 'hard'];
  priceOptions: Price[] = ['low', 'normal', 'high'];
  frequencyOptions: Frequency[] = ['weekly', 'monthly', 'yearly'];
  seasonOptions: Season[] = ['spring', 'summer', 'autumn', 'winter'];

  readonly dbRecipeCategories = this.facade.dbRecipeCategories;

  form = this.facade.form;
  readonly servings = this.facade.servings;
  readonly price = this.facade.price;
  readonly frequency = this.facade.frequency;
  readonly difficulty = this.facade.difficulty;
  readonly seasonsSelected = this.facade.seasonsSelected;
  readonly imageFile = this.facade.imageFile;
  readonly imageUrl = this.facade.imageUrl;
  isCroppingImage = false;
  isApplyingCrop = false;

  @ViewChild('cropSourceImage')
  private cropSourceImage?: ElementRef<HTMLImageElement>;

  cropSelection = { x: 0, y: 0, width: 1, height: 1 };
  private cropDragStart: { x: number; y: number; pointerId: number } | null =
    null;

  readonly selectedCategoryIds = this.facade.selectedCategoryIds;
  readonly cuisineName = this.facade.cuisineName;
  readonly mealCategoryName = this.facade.mealCategoryName;
  readonly messageUniqueTitle = this.facade.messageUniqueTitle;

  dataLoading = this.facade.dataLoading;

  private ctx: TabDefinitionContext = {
    buttonType: this.buttonType,
    recipeId: this.recipeId,
  };

  ngOnInit() {
    this.facade.connect(this.ctx);

    this.facade.initializeForm();
  }

  resetRecipeState() {
    this.facade.resetRecipeState();
  }

  onServingsChange(value: number) {
    this.facade.changeServings(value);
  }

  openAddRecipeCategoryInputModal(event: MouseEvent) {
    this.facade.openAddRecipeCategoryInputModal(event);
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.facade.onFileSelected(file);
    this.isCroppingImage = true;
    input.value = '';
  }

  initializeCropSelection(event: Event) {
    const image = event.target as HTMLImageElement;
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const width = imageAspect >= 1.5 ? 1.5 / imageAspect : 1;
    const height = imageAspect >= 1.5 ? 1 : imageAspect / 1.5;

    this.cropSelection = {
      x: (1 - width) / 2,
      y: (1 - height) / 2,
      width,
      height,
    };
  }

  startCropSelection(event: PointerEvent) {
    if (event.button !== 0) return;

    event.preventDefault();
    const viewport = event.currentTarget as HTMLElement;
    const point = this.getCropPoint(event, viewport);
    this.cropDragStart = { ...point, pointerId: event.pointerId };
    viewport.setPointerCapture(event.pointerId);
    this.updateCropSelection(point, viewport);
  }

  updateCropSelectionFromPointer(event: PointerEvent) {
    if (
      !this.cropDragStart ||
      this.cropDragStart.pointerId !== event.pointerId
    ) {
      return;
    }

    this.updateCropSelection(
      this.getCropPoint(event, event.currentTarget as HTMLElement),
      event.currentTarget as HTMLElement,
    );
  }

  finishCropSelection(event: PointerEvent) {
    this.updateCropSelectionFromPointer(event);
    this.cropDragStart = null;
  }

  private getCropPoint(event: PointerEvent, viewport: HTMLElement) {
    const bounds = viewport.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
      y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
    };
  }

  private updateCropSelection(
    point: { x: number; y: number },
    viewport: HTMLElement,
  ) {
    if (!this.cropDragStart) return;

    const start = this.cropDragStart;
    const bounds = viewport.getBoundingClientRect();
    const directionX = point.x < start.x ? -1 : 1;
    const directionY = point.y < start.y ? -1 : 1;
    const maxWidth = Math.min(
      (directionX > 0 ? 1 - start.x : start.x) * bounds.width,
      (directionY > 0 ? 1 - start.y : start.y) * bounds.height * 1.5,
    );
    const widthPixels = Math.min(
      maxWidth,
      Math.max(
        Math.abs(point.x - start.x) * bounds.width,
        Math.abs(point.y - start.y) * bounds.height * 1.5,
      ),
    );
    if (widthPixels < 2) return;

    const width = widthPixels / bounds.width;
    const height = widthPixels / 1.5 / bounds.height;
    this.cropSelection = {
      x: directionX > 0 ? start.x : start.x - width,
      y: directionY > 0 ? start.y : start.y - height,
      width,
      height,
    };
  }

  async applyImageCrop(): Promise<boolean> {
    const image = this.cropSourceImage?.nativeElement;
    if (this.isApplyingCrop || !image?.naturalWidth || !image.naturalHeight)
      return false;

    this.isApplyingCrop = true;
    try {
      const croppedImage = await cropRecipeImage(image, this.cropSelection);
      this.facade.applyImageCrop(croppedImage);
      this.isCroppingImage = false;
      return true;
    } catch (error) {
      console.error('Could not crop recipe image:', error);
      return false;
    } finally {
      this.isApplyingCrop = false;
    }
  }

  cancelImageCrop() {
    this.facade.useOriginalImage();
    this.isCroppingImage = false;
  }

  removeImage() {
    this.facade.removeImage();
  }
}
