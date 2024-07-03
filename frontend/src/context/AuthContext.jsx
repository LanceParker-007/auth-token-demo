import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const newToken = await refreshToken();
        if (newToken) {
          const decodedToken = jwtDecode(newToken);
          setUser({ token: newToken, userId: decodedToken.userId });
        }
      } catch (error) {
        console.error("Initial auth error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          username,
          password,
        },
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      const decodedToken = jwtDecode(accessToken);
      setUser({ token: accessToken, userId: decodedToken.userId });
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        username,
        email,
        password,
      });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      return accessToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      setUser(null);
      return null;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
