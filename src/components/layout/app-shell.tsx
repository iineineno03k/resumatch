import type { ReactNode } from "react";
import { Header, type HeaderUser } from "./header";

interface AppShellProps {
  children: ReactNode;
  user: HeaderUser;
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  );
}
