import React, { createContext, useState, useContext, useEffect } from "react";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/admin/session");
        if (response.ok) {
          const sessionUser = await response.json();
          setUser(sessionUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);
  const login = (loginData) => {
    setUser({ 
      _id: loginData._id,
      login_name: loginData.login_name,
      first_name: loginData.first_name,
      last_name: loginData.last_name, });
  };
  const logout = () => {
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);