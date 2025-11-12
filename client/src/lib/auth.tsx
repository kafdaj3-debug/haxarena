import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, buildApiUrl } from "./queryClient";

interface User {
  id: string;
  username: string;
  email: string | null;
  profilePicture: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isApproved: boolean;
  role: string;
}

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await fetch(buildApiUrl("/api/auth/me"), {
          credentials: "include",
        });
        
        // 401 is expected when not logged in, silently return null
        if (response.status === 401) {
          return null;
        }
        
        if (!response.ok) {
          return null; // Silently fail for other errors too
        }
        
        return response.json();
      } catch (error) {
        // Silently catch all errors and return null
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await fetch(buildApiUrl("/api/auth/logout"), {
          method: "POST",
          credentials: "include",
        });
        // Don't throw on error, just proceed with logout
        return response.ok;
      } catch (error) {
        // Silently handle errors
        return false;
      }
    },
    onSuccess: () => {
      // Clear all queries and reset the cache
      queryClient.clear();
      // Force a full page reload to reset all state
      window.location.replace("/");
    },
    onError: () => {
      // Even on error, clear cache and redirect
      queryClient.clear();
      window.location.replace("/");
    },
  });

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // Error already handled in mutation onError
      console.log("Logout initiated");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
