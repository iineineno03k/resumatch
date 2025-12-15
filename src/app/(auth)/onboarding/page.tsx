import { createCompany, OnboardingForm } from "@/features/companies";

async function handleCreateCompany(
  name: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  const result = await createCompany({ name });
  if (result.success) {
    return { success: true };
  }
  return { success: false, error: result.error };
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <OnboardingForm onSubmit={handleCreateCompany} />
    </div>
  );
}
