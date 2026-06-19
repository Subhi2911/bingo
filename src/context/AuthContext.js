// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "../config/backend";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return null;

      const response = await fetch(`${BACKEND_URL}/api/auth/getUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      })

      const json = await response.json();
      console.log(json);
      setUser(json);
      return json;         
    } catch (error) {
      console.log("Error fetching user:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, fetchUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);