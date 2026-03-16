import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id?: string;
  email: string;
  name: string;
  role: "admin" | "customer";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<"success" | "mfa_required" | "failed">;
  verifyOTP: (otp: string) => Promise<boolean>;
  resendOTP: () => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingMFAToken, setPendingMFAToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("siegma_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<"success" | "mfa_required" | "failed"> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (!response.ok) return "failed";

      // Admin MFA required
      if (result.requiresMFA && result.tempToken) {
        setPendingMFAToken(result.tempToken);
        return "mfa_required";
      }

      // Regular login success
      const loggedInUser: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      };
      setUser(loggedInUser);
      localStorage.setItem("siegma_user", JSON.stringify(loggedInUser));
      localStorage.setItem("siegma_token", result.token);
      return "success";
    } catch (error) {
      console.error("Login failed:", error);
      return "failed";
    }
  };

  const verifyOTP = async (otp: string): Promise<boolean> => {
    if (!pendingMFAToken) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: pendingMFAToken, otp }),
      });

      const result = await response.json();
      if (!response.ok) return false;

      const loggedInUser: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      };
      setUser(loggedInUser);
      localStorage.setItem("siegma_user", JSON.stringify(loggedInUser));
      localStorage.setItem("siegma_token", result.token);
      setPendingMFAToken(null);
      return true;
    } catch (error) {
      console.error("OTP verification failed:", error);
      return false;
    }
  };

  const resendOTP = async (): Promise<boolean> => {
    if (!pendingMFAToken) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: pendingMFAToken }),
      });

      const result = await response.json();
      if (!response.ok) return false;

      return true;
    } catch (error) {
      console.error("Resend OTP failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setPendingMFAToken(null);
    localStorage.removeItem("siegma_user");
    localStorage.removeItem("siegma_token");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, verifyOTP, resendOTP, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
