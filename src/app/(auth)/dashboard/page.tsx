import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">ResuMatch Dashboard</h1>
        <UserButton />
      </header>
      <main>
        <p>Welcome to ResuMatch!</p>
        <p className="text-gray-500 mt-2">User ID: {userId}</p>
      </main>
    </div>
  );
}
