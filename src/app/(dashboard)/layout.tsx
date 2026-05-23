import { createServerSupabaseClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import { logoutAction } from "@/services/auth/auth.actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black transition-colors duration-300">
      <Navbar user={user} logoutAction={logoutAction} />
      <main className="flex-1 w-full bg-neutral-50 dark:bg-black transition-colors duration-300">{children}</main>
    </div>
  );
}