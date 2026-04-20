import {
  Component,
  computed,
  inject,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';

import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { Recipe } from '../recipes/components/recipe-card/recipe.model';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabComponent } from './components/tab/tab.component';
import { TabDefinitionComponent } from './components/tab-definition/tab-definition.component';
import { TabIngredientsComponent } from './components/tab-ingredients/tab-ingredients.component';
import { TabInstructionsComponent } from './components/tab-instructions/tab-instructions.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { RecipeBackendService } from '../../services/backend/recipe.service';
import { ToastService } from '../../services/toast.service';
import { RecipeStateService } from '../../services/state/recipe.service';
import {
  deleteObject,
  FirebaseStorage,
  getStorage,
  ref,
} from 'firebase/storage';
import { ImageUploadLoaderComponent } from '../../shared/components/image-upload-loader/image-upload-loader.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { RecipeCategoryDomainFacade } from '../../domain-facades/recipeCategory.facade';

@Component({
  selector: 'app-new-recipe',
  imports: [
    TabsComponent,
    TabComponent,
    TabDefinitionComponent,
    TabIngredientsComponent,
    TabInstructionsComponent,
    ButtonComponent,
    NgClass,
    LoadingComponent,
    ImageUploadLoaderComponent,
  ],
  templateUrl: './new-recipe.component.html',
  styleUrl: './new-recipe.component.css',
})
export class NewRecipeComponent {
  private router = inject(Router);

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
  buttonSaveOrUpdate = signal<string>('Save');
  recipeId = signal<string>('');
  uploadProgress = this.recipeService.uploadProgress;

  /** Declaration of recipe state signals */
  readonly formIsValid = computed(() => {
    return this.stateRecipeService.formIsValid();
  });

  readonly pageLoading = computed(() => {
    return (
      this.recipeIsSaving() ||
      this.recipeIsUpdating() ||
      this.recipeCategoriesLoading()
    );
  });

  @ViewChild(TabDefinitionComponent) childComponent!: TabDefinitionComponent;

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const navigationState = navigation?.extras?.state as {
      recipe: Recipe;
      id: string;
    };

    if (navigationState?.recipe) {
      this.buttonSaveOrUpdate.set('Update');
      this.recipeId.set(navigationState.id);
    }
  }

  async onAddOrUpdateRecipe() {
    const {
      ingredient,
      ingredientId,
      selectedTabTitle,
      filter,
      nbFilters,
      ...recipe
    } = this.recipeState();

    const storage = getStorage();

    const imageFile = this.stateRecipeService.imageFile();

    // Create a copy of the original image url from the firestore object. If I use 'recipe.imageUrl' later
    // in the code after having redefined the new image, I won't be able to remove the original image (from firebase)
    // since it would refer to the most updated/redefined one!
    const originalImageUrl = recipe.imageUrl?.slice();

    try {
      if (this.buttonSaveOrUpdate() === 'Save') {
        const recipeId = await this.recipeService.saveRecipeIntoStore(recipe);

        if (!recipeId) throw new Error('No recipe ID returned');

        const updatedRecipe = await this.uploadImageToFirebase(
          false,
          imageFile,
          recipeId,
          storage,
          recipe
        );

        try {
          await this.recipeService.updateRecipeInStore(
            recipeId,
            updatedRecipe,
            this.stateRecipeService.mustPreserveState
          );
        } catch (error) {
          this.toastService.show(
            'Could not update the recipe document with imageUrl',
            'error'
          );
        }

        this.toastService.show('New recipe saved in database', 'success');

        this.childComponent.resetRecipeState();

        // Navigate back to all recipes
        this.router.navigate(['/recipes']);
      } else {
        const updatedRecipe = await this.uploadImageToFirebase(
          true,
          imageFile,
          this.recipeId(),
          storage,
          recipe
        );

        try {
          await this.recipeService.updateRecipeInStore(
            this.recipeId(),
            updatedRecipe,
            this.stateRecipeService.mustPreserveState
          );
        } catch (error) {
          this.toastService.show(
            'Could not update the recipe document with imageUrl',
            'error'
          );
        }

        try {
          if (originalImageUrl)
            await this.removeImagesFromUrl(originalImageUrl);
        } catch (error) {
          console.log('Error while removing images from firebase: ', error);
        }

        this.childComponent.resetRecipeState();

        this.toastService.show('Recipe updated in database', 'success');

        // Navigate with the recipe ID and pass the recipe object in the state
        this.router.navigate(['/recipes', this.recipeId()], {
          state: { recipe: recipe },
        });
      }
    } catch (error) {
      const message =
        this.buttonSaveOrUpdate() === 'Save'
          ? 'Recipe could not be saved in database'
          : 'Recipe could not be updated in database';
      this.toastService.show(message, 'error');
    }

    this.stateRecipeService.resetRecipeState();
  }

  async uploadImageToFirebase(
    update: boolean,
    imageFile: File | null,
    recipeId: string,
    storage: FirebaseStorage,
    recipe: any
  ) {
    if (imageFile) {
      const imagePath = `recipes/${recipeId}/${imageFile?.name}`;
      const imageRef = ref(storage, imagePath);

      const thumbnailPath = `recipes/${recipeId}/thumb_${imageFile?.name}`;
      const thumbnailRef = ref(storage, thumbnailPath);

      await this.recipeService.uploadImageToFirebase(
        imageRef,
        thumbnailRef,
        imageFile
      );

      // Download both image and thumbnail urls from firebase
      const imageUrl = await this.recipeService.downloadImageUrlFromFirebase(
        imageRef
      );

      const thumbnailUrl =
        await this.recipeService.downloadImageUrlFromFirebase(thumbnailRef);

      // Add both image and thumbnail urls as properties of the original recipe object
      if (imageUrl && thumbnailUrl) {
        recipe['imageUrl'] = imageUrl;
        recipe['thumbnailUrl'] = thumbnailUrl;
      }
    } else {
      if (update) {
        // Use case when the use removes the existing image for the recipe
        recipe['imageUrl'] = '';
        recipe['thumbnailUrl'] = '';
      }
    }

    /** Reset the imageFile, otherwise next time users save a recipe without loading an image,
     * it will still have the previous imageFile in memory (from the state) and will upload this
     * very image.
     */
    this.stateRecipeService.imageFile.set(null);

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
