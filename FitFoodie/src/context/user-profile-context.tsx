"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import type { ProfileFormValues } from '@/components/profile-form'; // Use type import

interface UserProfileContextType {
  profile: ProfileFormValues | null;
  updateProfile: (newProfile: ProfileFormValues) => void;
  isProfileComplete: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'fitfoodie_profile';

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization

  // Load profile from local storage on initial mount (client-side only)
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error("Failed to load profile from local storage:", error);
      // Optionally clear corrupted storage
      // localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
        setIsInitialized(true); // Mark as initialized after attempting load
    }
  }, []);

  // Save profile to local storage whenever it changes (client-side only)
  useEffect(() => {
    // Only save if initialized and profile is not null
    if (isInitialized && profile) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
      } catch (error) {
        console.error("Failed to save profile to local storage:", error);
      }
    }
    // If profile becomes null after initialization (e.g., user clears data), remove from storage
    else if (isInitialized && profile === null) {
         try {
           localStorage.removeItem(LOCAL_STORAGE_KEY);
         } catch (error) {
           console.error("Failed to remove profile from local storage:", error);
         }
    }
  }, [profile, isInitialized]); // Depend on profile and initialization status


  const updateProfile = (newProfile: ProfileFormValues) => {
    setProfile(newProfile);
  };

  // Determine if the profile is complete
  const isProfileComplete = useMemo(() => {
     return !!profile &&
            profile.fitnessGoal !== undefined &&
            profile.protein >= 0 && // Ensure macros are non-negative
            profile.carbs >= 0 &&
            profile.fat >= 0;
            // Restrictions are optional, so not checked here
  }, [profile]);


  // Only render children after initialization attempt
  if (!isInitialized) {
    // Optional: Render a loading indicator while initializing
    return null; // Or a loading spinner, etc.
  }


  return (
    <UserProfileContext.Provider value={{ profile, updateProfile, isProfileComplete }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
