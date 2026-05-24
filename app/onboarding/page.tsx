import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingClient } from "./onboarding-client";

export const metadata = {
  title: "Pick a handle — Toolsmaxxing",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // Already picked a username — send them home
  if (profile?.username) redirect("/browse");

  return <OnboardingClient userId={user.id} />;
}
