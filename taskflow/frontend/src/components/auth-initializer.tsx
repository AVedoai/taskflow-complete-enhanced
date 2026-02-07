"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth state on app load
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
