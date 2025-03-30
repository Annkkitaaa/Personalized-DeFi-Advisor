import React, { createContext, useContext, useState, useEffect } from 'react';

const UserProfileContext = createContext();

export const useUserProfile = () => useContext(UserProfileContext);

export const UserProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    riskTolerance: 5,
    timeHorizon: 12,
    capital: 10000,
    experience: 'beginner',
    investmentGoals: []
  });
  
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    // Load profile from localStorage if available
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
        setIsProfileComplete(true);
      } catch (err) {
        console.error("Error parsing saved profile:", err);
      }
    }
  }, []);

  const updateProfile = (newProfile) => {
    const updatedProfile = { ...profile, ...newProfile };
    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    // Check if profile has all required fields
    const { riskTolerance, timeHorizon, capital, experience } = updatedProfile;
    if (riskTolerance && timeHorizon && capital && experience) {
      setIsProfileComplete(true);
    }
  };

  const getRiskProfile = () => {
    const { riskTolerance } = profile;
    if (riskTolerance <= 3) return 'conservative';
    if (riskTolerance <= 7) return 'moderate';
    return 'aggressive';
  };

  const clearProfile = () => {
    setProfile({
      riskTolerance: 5,
      timeHorizon: 12,
      capital: 10000,
      experience: 'beginner',
      investmentGoals: []
    });
    setIsProfileComplete(false);
    localStorage.removeItem('userProfile');
  };

  return (
    <UserProfileContext.Provider value={{
      profile,
      updateProfile,
      clearProfile,
      isProfileComplete,
      riskProfile: getRiskProfile()
    }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export default UserProfileContext;