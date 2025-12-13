import { createTeam } from "@/features/teams";
import { OnboardingForm } from "@/features/teams/components/onboarding-form";

async function handleCreateTeam(
  name: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  const result = await createTeam({ name });
  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.error };
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <OnboardingForm onSubmit={handleCreateTeam} />
    </div>
  );
}
