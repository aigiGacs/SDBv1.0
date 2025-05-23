import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          return false;
        }
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      setUser(userData);
      return true;
    } catch (err) {
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      });

      const userData = await response.json();
      setUser(userData);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.firstName}!`,
      });
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login");
      toast({
        title: "Login failed",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/login");
    } catch (err: any) {
      toast({
        title: "Logout failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading, checkAuth } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function verifyAuth() {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        setLocation("/login");
      }
    }

    if (!isLoading && !user) {
      verifyAuth();
    }
  }, [user, isLoading, checkAuth, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export function AdminOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
