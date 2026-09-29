import {
  Component,
  computed,
  effect,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';

import { Router } from '@angular/router';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabComponent } from './components/tab/tab.component';
import { TabDefinitionComponent } from './components/tab-definition/tab-definition.component';
import { TabIngredientsComponent } from './components/tab-ingredients/tab-ingredients.component';
import { TabInstructionsComponent } from './components/tab-instructions/tab-instructions.component';
import { RecipeBackendService } from '../../services/backend/recipe.service';
import {
  RecipeDocInBackend,
  toRecipeDocInBackend,
} from '../../models/recipe.model';
import { ToastService } from '../../services/toast.service';
import { RecipeStateService } from '../../services/state/recipe.service';
import {
  deleteObject,
  FirebaseStorage,
  getStorage,
  ref,
} from 'firebase/storage';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { RecipeCategoryDomainFacade } from '../../domain-facades/recipeCategory.facade';
import { LoadingComponent } from '../../shared/layout/overlays/loading/loading.component';
import { ImageUploadLoaderComponent } from '../../shared/ui/upload/image-upload-loader/image-upload-loader.component';
import { StackComponent } from '../../shared/layout/primitives/stack.component';
import { InlineComponent } from '../../shared/layout/primitives/inline.component';
import { PageLayoutComponent } from '../../shared/layout/primitives/page-layout.component';
import { SectionComponent } from '../../shared/layout/primitives/section.component';

@Component({
  selector: 'app-new-recipe',
  imports: [
    TabsComponent,
    TabComponent,
    TabDefinitionComponent,
    TabIngredientsComponent,
    TabInstructionsComponent,
    ButtonComponent,
    LoadingComponent,
    ImageUploadLoaderComponent,
    PageLayoutComponent,
    SectionComponent,
    StackComponent,
    InlineComponent,
  ],
  templateUrl: './new-recipe.component.html',
  styleUrl: './new-recipe.component.css',
})
export class NewRecipeComponent {
  private router = inject(Router);
  private location = inject(Location);

  /** Services */
  private recipeService = inject(RecipeBackendService);
  private stateRecipeService = inject(RecipeStateService);
  private toastService = inject(ToastService);

  private recipeCategoryDomainFacade = inject(RecipeCategoryDomainFacade);

  readonly recipeIsSaving = this.recipeService.saving;
  readonly recipeIsUpdating = this.recipeService.updating;

  readonly recipeCategoriesLoading =
    this.recipeCategoryDomainFacade.recipeCategoriesLoading;

  /** Declaration of local signals */
  recipeState = this.stateRecipeService.recipeState;
  readonly recipeId = input<string | undefined>();
  readonly buttonSaveOrUpdate = computed(() =>
    this.recipeId() ? 'Update' : 'Save',
  );
  private initializedEditId: string | null = null;
  uploadProgress = this.recipeService.uploadProgress;
  readonly dbRecipes = this.recipeService.recipes;
  readonly recipesAreLoading = this.recipeService.loading;
  readonly recipesLoaded = this.recipeService.recipesLoaded;

  /** Declaration of recipe state signals */
  readonly formIsValid = computed(() => {
    return this.stateRecipeService.formIsValid();
  });
  readonly canSubmit = computed(
    () =>
      this.formIsValid() &&
      (!this.recipeId() || this.stateRecipeService.recipeHasChanges()),
  );

  readonly pageLoading = computed(() => {
    return (
      this.recipeIsSaving() ||
      this.recipeIsUpdating() ||
      this.recipeCategoriesLoading() ||
      (!!this.recipeId() &&
        (!this.recipesLoaded() ||
          this.recipesAreLoading() ||
          !this.dbRecipes().some((recipe) => recipe.id === this.recipeId()) ||
          this.stateRecipeService.editingRecipeId() !== this.recipeId()))
    );
  });

  @ViewChild(TabDefinitionComponent) childComponent!: TabDefinitionComponent;

  constructor() {
    effect(() => {
      const recipeId = this.recipeId();
      if (!recipeId) {
        if (this.stateRecipeService.editingRecipeId()) {
          this.stateRecipeService.resetRecipeState();
        }
        this.initializedEditId = null;
        return;
      }

      if (this.initializedEditId === recipeId) return;

      if (this.stateRecipeService.editingRecipeId() === recipeId) {
        this.initializedEditId = recipeId;
        return;
      }

      if (!this.recipesLoaded() || this.recipesAreLoading()) return;

      const recipe = this.dbRecipes().find((item) => item.id === recipeId);
      if (!recipe) {
        this.router.navigate(['/recipes']);
        return;
      }

      this.stateRecipeService.updateRecipeState(recipe, recipeId);
      this.initializedEditId = recipeId;
    });
  }

  goBack() {
    const recipeId = this.recipeId();
    this.stateRecipeService.resetRecipeState();
    if (recipeId) {
      this.router.navigate(['/recipes', recipeId]);
    } else {
      this.location.back();
    }
  }

  async onAddOrUpdateRecipe() {
    const recipe = toRecipeDocInBackend(this.recipeState());

    const storage = getStorage();

    const imageFile = this.stateRecipeService.imageFile();
    const imageChange = this.stateRecipeService.imageChange();
    const originalImage = this.stateRecipeService.originalImage();

    try {
      if (this.buttonSaveOrUpdate() === 'Save') {
        const recipeId = this.recipeService.createRecipeId();
        let recipeToSave: RecipeDocInBackend | null = null;
        try {
          recipeToSave = await this.uploadImageToFirebase(
            imageFile,
            recipeId,
            storage,
            recipe,
          );
          await this.recipeService.saveRecipeIntoStore(recipeToSave, recipeId);
        } catch (error) {
          if (imageChange === 'replaced' && recipeToSave?.imageUrl) {
            await this.removeImagesFromUrl(recipeToSave.imageUrl);
          }
          throw error;
        }

        this.toastService.show('New recipe saved in database', 'success');

        this.childComponent.resetRecipeState();

        // Navigate back to all recipes
        this.router.navigate(['/recipes']);
      } else {
        const recipeId = this.recipeId();
        if (!recipeId) throw new Error('Recipe ID is missing in edit mode');

        const updatedRecipe = await this.uploadImageToFirebase(
          imageFile,
          recipeId,
          storage,
          recipe,
        );

        try {
          await this.recipeService.updateRecipeInStore(
            recipeId,
            updatedRecipe,
            this.stateRecipeService.mustPreserveState,
          );
        } catch (error) {
          if (
            imageChange === 'replaced' &&
            updatedRecipe.imageUrl &&
            updatedRecipe.imageUrl !== originalImage?.imageUrl
          ) {
            await this.removeImagesFromUrl(updatedRecipe.imageUrl);
          }
          throw error;
        }

        if (imageChange !== 'unchanged' && originalImage?.imageUrl) {
          await this.removeImagesFromUrl(originalImage.imageUrl);
        }

        this.toastService.show('Recipe updated in database', 'success');

        const navigated = await this.router.navigate(['/recipes', recipeId]);
        if (navigated) {
          this.stateRecipeService.resetRecipeState();
        }
      }
    } catch (error) {
      const message =
        this.buttonSaveOrUpdate() === 'Save'
          ? 'Recipe could not be saved in database'
          : 'Recipe could not be updated in database';
      this.toastService.show(message, 'error');
    }
  }

  async uploadImageToFirebase(
    imageFile: File | null,
    recipeId: string,
    storage: FirebaseStorage,
    recipe: RecipeDocInBackend,
  ) {
    const imageChange = this.stateRecipeService.imageChange();

    if (imageChange === 'replaced') {
      if (!imageFile) throw new Error('Replacement image file is missing');

      const uploadFileName = `${crypto.randomUUID()}_${imageFile.name}`;
      const imagePath = `recipes/${recipeId}/${uploadFileName}`;
      const imageRef = ref(storage, imagePath);

      const thumbnailPath = `recipes/${recipeId}/thumb_${uploadFileName}`;
      const thumbnailRef = ref(storage, thumbnailPath);

      try {
        await this.recipeService.uploadImageToFirebase(
          imageRef,
          thumbnailRef,
          imageFile,
        );

        const imageUrl =
          await this.recipeService.downloadImageUrlFromFirebase(imageRef);

        const thumbnailUrl =
          await this.recipeService.downloadImageUrlFromFirebase(thumbnailRef);

        if (!imageUrl || !thumbnailUrl) {
          throw new Error('Could not retrieve uploaded image URLs');
        }

        recipe.imageUrl = imageUrl;
        recipe.thumbnailUrl = thumbnailUrl;
      } catch (error) {
        await Promise.all([
          deleteObject(imageRef).catch(() => undefined),
          deleteObject(thumbnailRef).catch(() => undefined),
        ]);
        throw error;
      }
    } else if (imageChange === 'removed') {
      recipe.imageUrl = '';
      recipe.thumbnailUrl = '';
    }

    return recipe;
  }

  async removeImagesFromUrl(imageUrl: string): Promise<void> {
    const storage = getStorage();

    try {
      // Step 1: Decode the image URL
      const decodedUrl = decodeURIComponent(imageUrl);

      // Example: recipes/7554AzKOuJnM6baGgxDe/famappy_recipe6.jpg
      const match = decodedUrl.match(/recipes\/([^/]+)\/([^/?]+)/);

      if (!match || match.length < 3) {
        throw new Error('Could not extract recipeId or filename from URL');
      }

      const recipeId = match[1]; // e.g., 7554AzKOuJnM6baGgxDe
      const filename = match[2]; // e.g., famappy_recipe6.jpg

      const imagePath = `recipes/${recipeId}/${filename}`;
      const thumbnailPath = `recipes/${recipeId}/thumb_${filename}`;

      const imageRef = ref(storage, imagePath);
      const thumbnailRef = ref(storage, thumbnailPath);

      // Step 2: Delete both files
      await deleteObject(imageRef);
      await deleteObject(thumbnailRef);

      console.log('Both image and thumbnail deleted from Firebase');
    } catch (error) {
      console.error('Failed to delete images:', error);
    }
  }
}
