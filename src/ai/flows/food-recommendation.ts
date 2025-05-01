'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized food and recipe recommendations based on user dietary restrictions and fitness goals.
 *
 * - foodRecommendation - A function that handles the food recommendation process.
 * - FoodRecommendationInput - The input type for the foodRecommendation function.
 * - FoodRecommendationOutput - The return type for the foodRecommendation function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Recipe} from '@/services/recipe';
import {Restaurant, FoodItem} from '@/services/restaurant';

const FoodRecommendationInputSchema = z.object({
  dietChart: z
    .string()
    .describe(
      'The user diet chart, including macros and restrictions. E.g., {protein: 150g, carbs: 200g, fat: 70g, restrictions: [gluten-free, dairy-free]}'
    ),
  fitnessGoals: z
    .string()
    .describe('The user fitness goals. E.g., lose weight, gain muscle, maintain weight'),
});
export type FoodRecommendationInput = z.infer<typeof FoodRecommendationInputSchema>;

const FoodRecommendationOutputSchema = z.object({
  recommendedRecipes: z.array(
    z.object({
      recipeId: z.string().describe('The ID of the recommended recipe (can be a placeholder like "recipe-1").'),
      name: z.string().describe('The name of the recommended recipe.'),
      description: z.string().describe('A short description of the recipe.'),
      ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
      steps: z.array(z.string()).describe('The steps to prepare the recipe.'),
      nutrition: z.string().describe('Estimated nutritional information for the recipe.'),
      reason: z.string().describe('Reason why this recipe is recommended based on the user input.'),
    })
  ).describe('An array of exactly 5 recommended recipes.'),
  recommendedRestaurants: z.array(
    z.object({
      restaurantId: z.string().describe('The ID of the recommended restaurant (can be a placeholder like "restaurant-1").'),
      name: z.string().describe('The name of the restaurant.'),
      cuisine: z.string().describe('The cuisine type of the restaurant.'),
      foodItems: z.array(
        z.object({
          foodItemId: z.string().describe('The ID of the food item (can be a placeholder like "item-1").'),
          name: z.string().describe('The name of the food item.'),
          description: z.string().describe('A short description of the food item.'),
          nutrition: z.string().describe('Estimated nutritional information for the food item.'),
          reason: z.string().describe('Reason why this food item is recommended based on the user input.'),
        })
      ).describe('An array of recommended food items from this restaurant.'),
      reason: z.string().describe('Reason why this restaurant (and its items) are recommended based on the user input.'),
    })
  ).describe('An array of exactly 5 recommended restaurants, each potentially including recommended food items.'),
});
export type FoodRecommendationOutput = z.infer<typeof FoodRecommendationOutputSchema>;

export async function foodRecommendation(input: FoodRecommendationInput): Promise<FoodRecommendationOutput> {
  return foodRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'foodRecommendationPrompt',
  input: {
    schema: z.object({
      dietChart: z
        .string()
        .describe(
          'The user diet chart, including macros and restrictions. E.g., {protein: 150g, carbs: 200g, fat: 70g, restrictions: [gluten-free, dairy-free]}'
        ),
      fitnessGoals: z
        .string()
        .describe('The user fitness goals. E.g., lose weight, gain muscle, maintain weight'),
    }),
  },
  output: {
    schema: FoodRecommendationOutputSchema,
  },
  prompt: `You are a personal nutrition assistant.

Based on the user's diet chart and fitness goals, recommend recipes and restaurants with food items that align with their needs.

Diet Chart: {{{dietChart}}}
Fitness Goals: {{{fitnessGoals}}}

Provide exactly 5 recommended recipes and exactly 5 recommended restaurants (which may include specific food items). Use placeholder IDs if actual IDs are not available.

Format your response as a JSON object conforming to the FoodRecommendationOutputSchema schema. Be brief but descriptive, and always include the reason for each recommendation. Ensure the output strictly adheres to the schema, providing exactly 5 items in each array.`,
});

const foodRecommendationFlow = ai.defineFlow<
  typeof FoodRecommendationInputSchema,
  typeof FoodRecommendationOutputSchema
>({
  name: 'foodRecommendationFlow',
  inputSchema: FoodRecommendationInputSchema,
  outputSchema: FoodRecommendationOutputSchema,
},
async input => {
  const {output} = await prompt(input);

  if (!output) {
      throw new Error("Failed to get recommendations from AI.");
  }

  // Ensure the AI provides the correct number of recommendations, trim or pad if necessary (though the prompt should handle this).
  // This is a fallback, ideally the prompt is strong enough.
  if (output.recommendedRecipes) {
     output.recommendedRecipes = output.recommendedRecipes.slice(0, 5);
     // Add placeholder recipes if less than 5 - Less ideal, rely on prompt first.
  } else {
      output.recommendedRecipes = []; // Ensure array exists
  }

  if (output.recommendedRestaurants) {
      output.recommendedRestaurants = output.recommendedRestaurants.slice(0, 5);
      // Add placeholder restaurants if less than 5 - Less ideal.
  } else {
      output.recommendedRestaurants = []; // Ensure array exists
  }


  return output;
});
