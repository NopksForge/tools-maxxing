import { Suspense } from "react";
import { NavServer } from "@/components/nav-server";
import { NavSkeleton } from "@/components/nav-client";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<NavSkeleton />}>
        <NavServer />
      </Suspense>
      <main className="page-body">{children}</main>
    </>
  );
}
