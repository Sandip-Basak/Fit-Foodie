"use client";

import React from "react"; // Added React import
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/context/user-profile-context";
import { Save } from 'lucide-react';

// Define the schema for the profile form using Zod
const profileFormSchema = z.object({
  protein: z.coerce.number().min(0, "Protein must be non-negative."),
  carbs: z.coerce.number().min(0, "Carbs must be non-negative."),
  fat: z.coerce.number().min(0, "Fat must be non-negative."),
  restrictions: z.string().optional().describe("e.g., gluten-free, dairy-free, vegetarian"),
  fitnessGoal: z.enum(["lose weight", "gain muscle", "maintain"], {
    required_error: "You need to select a fitness goal.",
  }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { profile, updateProfile } = useUserProfile();
  const { toast } = useToast();

  // Initialize the form with react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profile || { // Use profile from context or default empty values
      protein: 0,
      carbs: 0,
      fat: 0,
      restrictions: "",
      fitnessGoal: undefined,
    },
    mode: "onChange", // Validate on change
  });

   // Update form defaults when profile context changes
   React.useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  // Handle form submission
  function onSubmit(data: ProfileFormValues) {
    updateProfile(data); // Update profile in context
    toast({
      title: "Profile Updated",
      description: "Your diet chart and fitness goals have been saved.",
      variant: "default", // Use default toast style
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h2 className="text-2xl font-semibold text-secondary mb-6">Your Profile</h2>

        {/* Macros Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-secondary/5">
          <h3 className="text-lg font-medium mb-2">Daily Macros (grams)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="protein"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protein</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 150" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carbs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbohydrates</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fat</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 70" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Dietary Restrictions Section */}
         <FormField
          control={form.control}
          name="restrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., gluten-free, dairy-free, vegetarian, vegan, allergies..."
                  className="resize-none" // Prevent manual resizing
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List any dietary restrictions or allergies, separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fitness Goal Section */}
        <FormField
          control={form.control}
          name="fitnessGoal"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Fitness Goal</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="lose weight" />
                    </FormControl>
                    <FormLabel className="font-normal">Lose Weight</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="gain muscle" />
                    </FormControl>
                    <FormLabel className="font-normal">Gain Muscle</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="maintain" />
                    </FormControl>
                    <FormLabel className="font-normal">Maintain Weight</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" variant="secondary" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          <Save className="mr-2 h-4 w-4" /> Save Profile
        </Button>
      </form>
    </Form>
  );
}
