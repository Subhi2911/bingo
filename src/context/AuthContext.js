// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "../config/backend";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 YOUR LOGIC (moved to context)
  useEffect(() => {
    const getMyUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }

        console.log("Auth Token:", token);

        const response = await fetch(
          `${BACKEND_URL}/api/auth/getUser`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": token,
            },
          }
        );

        const json = await response.json();
        setUser(json);
        console.log("My user data:", json);
      } catch (error) {
        console.error("Error fetching my user data:", error);
      } finally {
        setLoading(false);
      }
    };

    getMyUserData();
  }, []);

  // optional logout
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);