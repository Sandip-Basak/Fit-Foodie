import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/profile-form";
import { RecommendationsDisplay } from "@/components/recommendations-display";
import { FoodRecognition } from "@/components/food-recognition";
import { UserProfileProvider } from "@/context/user-profile-context";
import { Salad, Utensils, Camera } from 'lucide-react';

export default function Home() {
  return (
    <UserProfileProvider>
      <div className="container mx-auto py-10 px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 text-secondary">FitFoodie Guide</h1>
          <p className="text-lg text-muted-foreground">Your Personalized Path to Healthy Eating</p>
        </header>

        <Tabs defaultValue="profile" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted p-1 rounded-lg">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm">
              <Salad className="h-5 w-5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm">
              <Utensils className="h-5 w-5" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="recognition" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm">
              <Camera className="h-5 w-5" />
              Food Cam
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <CardWithBorder>
              <ProfileForm />
            </CardWithBorder>
          </TabsContent>

          <TabsContent value="recommendations">
            <CardWithBorder>
              <RecommendationsDisplay />
            </CardWithBorder>
          </TabsContent>

          <TabsContent value="recognition">
            <CardWithBorder>
              <FoodRecognition />
            </CardWithBorder>
          </TabsContent>
        </Tabs>
      </div>
    </UserProfileProvider>
  );
}

// Helper component to wrap content in a Card with consistent styling
function CardWithBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      {children}
    </div>
  );
}
