"use client";

import { UserButton } from "@clerk/nextjs";
import { Briefcase, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "求人", href: "/jobs", icon: Briefcase },
  { name: "応募者", href: "/applicants", icon: Users },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-8">
          <Link href="/jobs" className="flex items-center space-x-2">
            <span className="font-bold text-xl">ResuMatch</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-1 transition-colors hover:text-foreground/80",
                  isActive ? "text-foreground" : "text-foreground/60",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          <Link
            href="/settings"
            className={cn(
              "flex items-center space-x-1 text-sm transition-colors hover:text-foreground/80",
              pathname.startsWith("/settings")
                ? "text-foreground"
                : "text-foreground/60",
            )}
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">設定</span>
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
