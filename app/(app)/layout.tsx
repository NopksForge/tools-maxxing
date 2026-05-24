import { createClient } from "@/lib/supabase/server";
import { NavClient } from "@/components/nav-client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <>
      <NavClient profile={profile} />
      <main className="page-body">{children}</main>
    </>
  );
}
