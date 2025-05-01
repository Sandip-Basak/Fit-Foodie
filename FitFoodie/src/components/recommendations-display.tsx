"use client";

import React, { useState, useEffect } from 'react';
import { foodRecommendation, FoodRecommendationOutput } from '@/ai/flows/food-recommendation';
import { useUserProfile } from '@/context/user-profile-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Utensils, ChefHat, Info, Building, ScrollText, Sparkles } from 'lucide-react';

export function RecommendationsDisplay() {
  const { profile, isProfileComplete } = useUserProfile();
  const [recommendations, setRecommendations] = useState<FoodRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!isProfileComplete || !profile) {
      setError("Please complete your profile first to get recommendations.");
      setRecommendations(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations(null); // Clear previous recommendations

    try {
      const dietChartString = `Macros: Protein ${profile.protein}g, Carbs ${profile.carbs}g, Fat ${profile.fat}g. Restrictions: ${profile.restrictions || 'None'}`;
      const result = await foodRecommendation({
        dietChart: dietChartString,
        fitnessGoals: profile.fitnessGoal,
      });
      setRecommendations(result);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to fetch recommendations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recommendations when the profile is updated and complete
  useEffect(() => {
    if (isProfileComplete) {
      fetchRecommendations();
    } else {
        // Clear recommendations if profile becomes incomplete
        setRecommendations(null);
        setError("Please complete your profile to see recommendations.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, isProfileComplete]); // Depend on profile and its completeness


  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-secondary mb-6 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-accent" /> Your Personalized Recommendations
      </h2>

      {!isProfileComplete && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Profile Incomplete</AlertTitle>
          <AlertDescription>
            Please complete your profile in the 'Profile' tab to receive personalized recommendations.
          </AlertDescription>
        </Alert>
      )}

       {isProfileComplete && (
        <Button onClick={fetchRecommendations} disabled={isLoading} variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? "Refreshing..." : "Refresh Recommendations"}
        </Button>
       )}


      {isLoading && <LoadingSkeleton />}

      {error && !isLoading && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recommendations && !isLoading && (
        <div className="space-y-6">
          {/* Recommended Recipes */}
          {recommendations.recommendedRecipes && recommendations.recommendedRecipes.length > 0 && (
            <Card className="bg-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-secondary">
                  <ChefHat className="h-5 w-5" /> Recommended Recipes
                </CardTitle>
                <CardDescription>Cook these healthy and delicious meals at home.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {recommendations.recommendedRecipes.map((recipe, index) => (
                    <AccordionItem value={`recipe-${index}`} key={recipe.recipeId || index}>
                      <AccordionTrigger className="text-base font-medium hover:text-accent">
                        {recipe.name}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pl-4 border-l-2 border-accent ml-2">
                        <p className="text-muted-foreground">{recipe.description}</p>
                         <div className="space-y-2">
                           <h4 className="font-semibold text-sm flex items-center gap-1"><Info className="h-4 w-4 text-accent"/>Why Recommended:</h4>
                           <p className="text-sm text-muted-foreground italic">{recipe.reason}</p>
                         </div>
                         <div className="space-y-2">
                           <h4 className="font-semibold text-sm flex items-center gap-1"><ScrollText className="h-4 w-4 text-accent"/>Ingredients:</h4>
                           <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                             {recipe.ingredients.map((ingredient, i) => <li key={i}>{ingredient}</li>)}
                           </ul>
                         </div>
                         <div className="space-y-2">
                           <h4 className="font-semibold text-sm flex items-center gap-1"><ChefHat className="h-4 w-4 text-accent"/>Steps:</h4>
                           <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                             {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
                           </ol>
                         </div>
                         <div className="space-y-1">
                           <h4 className="font-semibold text-sm flex items-center gap-1">Nutrition Info:</h4>
                           <p className="text-sm text-muted-foreground">{recipe.nutrition}</p>
                         </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Recommended Restaurants */}
          {recommendations.recommendedRestaurants && recommendations.recommendedRestaurants.length > 0 && (
             <Card className="bg-secondary/5">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-xl text-secondary">
                   <Building className="h-5 w-5" /> Recommended Restaurants & Items
                 </CardTitle>
                 <CardDescription>Healthy options when eating out.</CardDescription>
               </CardHeader>
               <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {recommendations.recommendedRestaurants.map((restaurant, index) => (
                      <AccordionItem value={`restaurant-${index}`} key={restaurant.restaurantId || index}>
                        <AccordionTrigger className="text-base font-medium hover:text-accent">
                          {restaurant.name} ({restaurant.cuisine})
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pl-4 border-l-2 border-accent ml-2">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-1"><Info className="h-4 w-4 text-accent"/>Why Recommended:</h4>
                            <p className="text-sm text-muted-foreground italic">{restaurant.reason}</p>
                          </div>
                           {restaurant.foodItems && restaurant.foodItems.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-1"><Utensils className="h-4 w-4 text-accent"/>Recommended Food Items:</h4>
                                {restaurant.foodItems.map((item, itemIndex) => (
                                    <div key={item.foodItemId || itemIndex} className="p-3 border rounded-md bg-card">
                                        <h5 className="font-medium">{item.name}</h5>
                                        <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
                                        <p className="text-xs text-muted-foreground mb-2"><span className="font-semibold">Nutrition:</span> {item.nutrition}</p>
                                        <p className="text-xs text-muted-foreground italic"><span className="font-semibold">Reason:</span> {item.reason}</p>
                                    </div>
                                ))}
                            </div>
                           )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
               </CardContent>
             </Card>
          )}

          {/* No recommendations found message */}
           {recommendations.recommendedRecipes?.length === 0 && recommendations.recommendedRestaurants?.length === 0 && (
               <Alert>
                 <Info className="h-4 w-4" />
                 <AlertTitle>No Recommendations Found</AlertTitle>
                 <AlertDescription>
                   We couldn't find specific recommendations matching your current profile. Try adjusting your profile settings.
                 </AlertDescription>
               </Alert>
           )}
        </div>
      )}
    </div>
  );
}

// Skeleton loader component
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Recipe Skeleton */}
      <Card className="bg-secondary/5">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
      {/* Restaurant Skeleton */}
      <Card className="bg-secondary/5">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
