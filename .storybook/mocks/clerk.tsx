import type { ReactNode } from "react";

// Mock UserButton component for Storybook
export function UserButton() {
  return (
    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
      U
    </div>
  );
}

// Mock ClerkProvider
export function ClerkProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Mock hooks
export function useUser() {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: "mock-user-id",
      firstName: "Test",
      lastName: "User",
      emailAddresses: [{ emailAddress: "test@example.com" }],
    },
  };
}

export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: "mock-user-id",
    sessionId: "mock-session-id",
  };
}

export function useClerk() {
  return {
    signOut: () => Promise.resolve(),
  };
}

// Mock SignIn/SignUp components
export function SignIn() {
  return <div>SignIn Mock</div>;
}

export function SignUp() {
  return <div>SignUp Mock</div>;
}

// Mock auth helper
export function auth() {
  return {
    userId: "mock-user-id",
    sessionId: "mock-session-id",
  };
}

export function currentUser() {
  return Promise.resolve({
    id: "mock-user-id",
    firstName: "Test",
    lastName: "User",
    emailAddresses: [{ emailAddress: "test@example.com" }],
  });
}
