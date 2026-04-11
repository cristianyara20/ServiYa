import { createServerSupabaseClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar user={user} />
      <main className="flex-1 w-full bg-black">{children}</main>
    </div>
  );
}