import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import Navigation from "./src/navigation";
import { useAuthStore } from "./src/store/auth";
import * as SecureStore from 'expo-secure-store';

export default function App() {
  const setToken = useAuthStore(state => state.setToken);
  
  useEffect(() => {
    // Check for existing token on app start
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setToken(token);
        }
      } catch (error) {
        console.error('Error loading token:', error);
      }
    };
    
    initializeAuth();
  }, []);

  return <Navigation />;
}