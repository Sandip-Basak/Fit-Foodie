/**
 * Represents a food recipe.
 */
export interface Recipe {
  /**
   * The ID of the recipe.
   */
  recipeId: string;
  /**
   * The name of the recipe.
   */
  name: string;
  /**
   * A description of the recipe.
   */
  description: string;
  /**
   * A list of ingredients of the recipe.
   */
  ingredients: string[];
  /**
   * A list of steps to prepare the recipe.
   */
  steps: string[];
  /**
   * Nutritional information for the recipe, including calories, macros and ingredients.
   */
  nutrition: string;
}

/**
 * Asynchronously retrieves a recipe by id.
 *
 * @param recipeId The id of the recipe.
 * @returns A promise that resolves to a Recipe.
 */
export async function getRecipe(recipeId: string): Promise<Recipe> {
  // TODO: Implement this by calling an API.

  return {
    recipeId: '1',
    name: 'Healthy Salad',
    description: 'A delicious and healthy salad.',
    ingredients: ['Lettuce', 'Tomato', 'Cucumber'],
    steps: ['Cut vegetables', 'Mix vegetables', 'Add dressing'],
    nutrition: 'Low in calories, high in vitamins.',
  };
}
