"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { removeCookie } from "./utils";
import { useRouter } from "next/navigation";

type User = {
  _id: string;
  email: string;
  role: string;
};
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSystemAdmin: boolean;
  isAgentAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { data: userData, isLoading: userLoading } = trpc.auth.getMe.useQuery();

  useEffect(() => {
    if (userLoading) return;
    if (userData?.user) {
      const user: User = {
        _id: userData.user._id.toString(),
        email: userData.user.email,
        role: userData.user.role,
      };
      setUser(user);
    } else {
      setUser(null);
      removeCookie("postEditAccessToken");
      router.push("/login");
    }
    setIsLoading(userLoading);
  }, [userData, userLoading]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSystemAdmin: user?.role === "system_admin",
    isAgentAdmin: user?.role === "agent_admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
