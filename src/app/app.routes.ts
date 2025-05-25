import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { SignupComponent } from './authentification/signup/signup.component';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SettingsComponent } from './header/user-menu/settings/settings.component';
import { MembersPageComponent } from './pages/members-page/members-page.component';
import { RecipesPageComponent } from './pages/recipes-page/recipes-page.component';
import { RecipePageComponent } from './pages/recipes-page/recipe-page/recipe-page.component';
import { NewRecipeComponent } from './pages/recipes-page/new-recipe/new-recipe.component';
import { IngredientsPageComponent } from './pages/ingredients-page/ingredients-page.component';
import { ManageIngredientCategoriesPageComponent } from './pages/manage-ingredient-categories-page/manage-ingredient-categories-page.component';
import { IngredientCategoriesPageComponent } from './pages/ingredient-categories-page/ingredient-categories-page.component';
import { CuisineComponent } from './pages/recipes-page/cuisine/cuisine.component';
import { ManageCuisinePageComponent } from './pages/manage-cuisine-page/manage-cuisine-page.component';
import { MealCategoryPageComponent } from './pages/meal-category-page/meal-category-page.component';
import { ManageMealCategoriesPageComponent } from './pages/manage-meal-categories-page/manage-meal-categories-page.component';
import { ManageRecipeCategoriesPageComponent } from './pages/manage-recipe-categories-page/manage-recipe-categories-page.component';
import { ManageIngredientsPageComponent } from './pages/manage-ingredients-page/manage-ingredients-page.component';
import { TabDefinitionComponent } from './pages/recipes-page/new-recipe/tab-definition/tab-definition.component';
import { TabIngredientsComponent } from './pages/recipes-page/new-recipe/tab-ingredients/tab-ingredients.component';
import { TabInstructionsComponent } from './pages/recipes-page/new-recipe/tab-instructions/tab-instructions.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'home', component: HomePageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'members', component: MembersPageComponent },
  {
    path: 'new-recipe',
    component: NewRecipeComponent,
    data: {
      title: 'Enter New Recipe',
      showDropdown: true,
      dropdownOptions: [
        {
          label: 'Manage meal categories',
          icon: 'fa-solid fa-cake-candles',
          url: 'manage-meal-categories',
        },
        {
          label: 'Manage cuisines',
          icon: 'fa-solid fa-flag',
          url: 'manage-cuisines',
        },
        {
          label: 'Manage recipe categories',
          icon: 'fa-solid fa-tag',
          url: 'manage-recipe-categories',
        },
        {
          label: 'Manage ingredient categories',
          icon: 'fa-solid fa-tag',
          url: 'manage-ingredient-categories',
        },
        {
          label: 'Manage ingredients',
          icon: 'fa-solid fa-carrot',
          url: 'manage-ingredients',
        },
      ],
    },
  },
  {
    path: 'recipes',
    component: RecipesPageComponent,
    data: { title: 'Recipes' },
  },
  {
    path: 'meal-category',
    component: MealCategoryPageComponent,
    data: { title: 'Meal Category', showBackIcon: true },
  },
  {
    path: 'manage-meal-categories',
    component: ManageMealCategoriesPageComponent,
    data: { title: 'Manage Meal Categories', showBackIcon: true },
  },
  {
    path: 'cuisine',
    component: CuisineComponent,
    data: { title: 'Cuisine', showBackIcon: true },
  },
  {
    path: 'manage-cuisines',
    component: ManageCuisinePageComponent,
    data: { title: 'Manage Cuisines', showBackIcon: true },
  },
  {
    path: 'manage-recipe-categories',
    component: ManageRecipeCategoriesPageComponent,
    data: { title: 'Manage recipe Categories', showBackIcon: true },
  },
  { path: 'recipes/:recipeId', component: RecipePageComponent },
  {
    path: 'ingredients',
    component: IngredientsPageComponent,
    data: { title: 'Ingredients', showHomeIcon: false, showBackIcon: true },
  },
  {
    path: 'manage-ingredients',
    component: ManageIngredientsPageComponent,
    data: {
      title: 'Manage ingredients',
      showHomeIcon: false,
      showBackIcon: true,
    },
  },
  {
    path: 'manage-ingredient-categories',
    component: ManageIngredientCategoriesPageComponent,
    data: {
      title: 'Manage ingredient categories',
      showHomeIcon: false,
      showBackIcon: true,
    },
  },
  {
    path: 'ingredient-categories',
    component: IngredientCategoriesPageComponent,
    data: {
      title: 'Ingredient categories',
      showHomeIcon: false,
      showBackIcon: true,
    },
  },
  { path: 'settings', component: SettingsComponent },
  { path: '**', component: NotFoundComponent },
];
