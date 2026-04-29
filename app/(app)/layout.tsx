import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageTransition } from "@/components/layout/PageTransition";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        title="Finwise"
        userEmail={user.email}
      />
      <PageTransition>
        <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4">
          {children}
        </main>
      </PageTransition>
      <BottomNav />
    </div>
  );
}
