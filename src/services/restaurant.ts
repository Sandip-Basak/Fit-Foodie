/**
 * Represents a food item from a restaurant.
 */
export interface Restaurant {
  /**
   * The ID of the restaurant.
   */
  restaurantId: string;
  /**
   * The name of the restaurant.
   */
  name: string;
  /**
   * The cuisine of the restaurant
   */
  cuisine: string;
}

/**
 * Represents a food item from a restaurant.
 */
export interface FoodItem {
  /**
   * The ID of the food item.
   */
  foodItemId: string;
  /**
   * The name of the food item.
   */
  name: string;
  /**
   * A description of the food item.
   */
  description: string;
  /**
   * Nutritional information for the food item, including calories, macros and ingredients.
   */
  nutrition: string;
}

/**
 * Asynchronously retrieves a list of restaurants based on cuisine.
 *
 * @param cuisine The type of cuisine for the restaurant (e.g. Italian, Chinese).
 * @returns A promise that resolves to a list of Restaurants.
 */
export async function getRestaurantsByCuisine(cuisine: string): Promise<Restaurant[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      restaurantId: '1',
      name: 'Delicious Delights',
      cuisine: cuisine,
    },
    {
      restaurantId: '2',
      name: 'Flavorful Feast',
      cuisine: cuisine,
    },
  ];
}

/**
 * Asynchronously retrieves a specific food item from a restaurant
 *
 * @param restaurantId The id of the restaurant.
 * @param foodItemId The id of the food item.
 * @returns A promise that resolves to a FoodItem.
 */
export async function getFoodItem(restaurantId: string, foodItemId: string): Promise<FoodItem> {
  // TODO: Implement this by calling an API.

  return {
    foodItemId: '1',
    name: 'Steak',
    description: 'A juicy steak.',
    nutrition: 'High in protein.',
  };
}
