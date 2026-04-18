import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const id = localStorage.getItem("userId");
    return token ? { token, email, id } : null;
  });

  const login = (token, email) => {
    const decoded = jwtDecode(token);
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("userId", decoded.id); // ✅ store id
    setUser({ token, email, id: decoded.id });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);