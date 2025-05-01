"use client";

import React, { useState, useRef, useCallback } from 'react';
import { analyzeFoodImage, AnalyzeFoodImageOutput } from '@/ai/flows/food-image-analysis';
import { useUserProfile } from '@/context/user-profile-context';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image';
import { Camera, Upload, Info, CheckCircle, XCircle, Sparkles } from 'lucide-react';

export function FoodRecognition() {
  const { profile, isProfileComplete } = useUserProfile();
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null); // Renamed from imageBase64
  const [analysisResult, setAnalysisResult] = useState<AnalyzeFoodImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string); // Set photoDataUri
        setAnalysisResult(null); // Reset analysis when new image is selected
        setError(null);
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
        setPhotoDataUri(null); // Clear photoDataUri
      }
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!photoDataUri) { // Check photoDataUri
      setError("Please select an image first.");
      return;
    }
    if (!isProfileComplete || !profile) {
       setError("Please complete your profile before analyzing food.");
       return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
       const dietChartString = `Macros: Protein ${profile.protein}g, Carbs ${profile.carbs}g, Fat ${profile.fat}g. Restrictions: ${profile.restrictions || 'None'}`;
       const result = await analyzeFoodImage({
         photoDataUri, // Pass photoDataUri
         diet: dietChartString,
         fitnessGoal: profile.fitnessGoal,
       });
       setAnalysisResult(result);
    } catch (err) {
       console.error("Error analyzing food image:", err);
       // Check if error is an instance of Error and has a message
       let errorMessage = "Failed to analyze the food image. Please try again.";
       if (err instanceof Error && err.message) {
           errorMessage += ` Details: ${err.message}`;
       }
       setError(errorMessage);
       setAnalysisResult(null); // Clear potentially partial results on error
    } finally {
       setIsLoading(false);
    }
  };

   // Simple check based on common positive keywords from the updated prompt
   const isRecommended = analysisResult?.recommendation?.toLowerCase().includes("aligns");

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-secondary mb-6 flex items-center gap-2">
        <Camera className="h-6 w-6 text-accent" /> Food Cam Analysis
      </h2>

      {!isProfileComplete && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Profile Incomplete</AlertTitle>
          <AlertDescription>
            Please complete your profile in the 'Profile' tab for personalized food analysis.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-secondary/5">
        <CardHeader>
          <CardTitle>Upload Food Image</CardTitle>
          <CardDescription>Upload a picture of your meal to get analysis and recommendations based on your goals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hidden file input */}
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload Button */}
          <Button onClick={triggerFileInput} variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" /> Choose Image
          </Button>

          {/* Image Preview */}
          {photoDataUri && ( // Use photoDataUri
            <div className="mt-4 border rounded-lg overflow-hidden shadow-sm w-full max-w-md mx-auto aspect-video relative bg-muted">
               <Image
                   src={photoDataUri} // Use photoDataUri
                   alt="Selected food"
                   layout="fill"
                   objectFit="cover"
                   data-ai-hint="food meal plate"
               />
            </div>
          )}

          {/* Analyze Button */}
          {photoDataUri && isProfileComplete && ( // Check photoDataUri
            <Button onClick={handleAnalyze} disabled={isLoading || !isProfileComplete} variant="secondary" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? "Analyzing..." : <> <Sparkles className="mr-2 h-4 w-4" /> Analyze Food </>}
            </Button>
          )}

          {error && !isLoading && (
            <Alert variant="destructive" className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {isLoading && <AnalysisSkeleton />}

      {analysisResult && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-secondary">
              Analysis Result: {analysisResult.foodName}
            </CardTitle>
            <CardDescription>{analysisResult.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">Estimated Nutrition:</h4>
              <p className="text-sm text-muted-foreground">{analysisResult.nutrition}</p>
            </div>
             <div className={`p-4 rounded-md ${isRecommended ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'}`}>
               <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                 {isRecommended ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> : <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />}
                 Recommendation:
               </h4>
               <p className={`text-sm ${isRecommended ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                 {analysisResult.recommendation}
               </p>
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Skeleton loader for analysis result
function AnalysisSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}
