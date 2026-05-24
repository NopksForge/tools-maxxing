import { Suspense } from "react";
import { OnboardingGate } from "./onboarding-gate";

export const metadata = {
  title: "Pick a handle — Toolsmaxxing",
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingGate />
    </Suspense>
  );
}
