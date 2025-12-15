"use client";

import { ClerkProvider, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

type AuthContextValue = {
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * 認証コンテキストを使用するフック
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

/**
 * モック認証プロバイダー（Clerk 不要）
 */
function MockAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const signOut = useCallback(async () => {
    router.push("/sign-in");
  }, [router]);

  const value = useMemo(() => ({ signOut }), [signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Clerk 認証プロバイダー
 */
function ClerkAuthProviderInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const clerk = useClerk();

  const signOut = useCallback(async () => {
    await clerk.signOut();
    router.push("/sign-in");
  }, [clerk, router]);

  const value = useMemo(() => ({ signOut }), [signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function ClerkAuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ClerkAuthProviderInner>{children}</ClerkAuthProviderInner>
    </ClerkProvider>
  );
}

/**
 * 認証プロバイダー
 * モックモードの場合は Clerk を使わない
 */
type AuthProviderProps = {
  children: ReactNode;
  mockMode?: boolean;
};

export function AuthProvider({ children, mockMode = false }: AuthProviderProps) {
  if (mockMode) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }
  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
}
