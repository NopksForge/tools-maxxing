import { Suspense } from "react";
import { NavServer } from "@/components/nav-server";
import { NavClient } from "@/components/nav-client";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<NavClient profile={null} />}>
        <NavServer />
      </Suspense>
      <main className="page-body">{children}</main>
    </>
  );
}
