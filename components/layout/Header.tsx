"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon, BellIcon, SunIcon, MoonIcon } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
  userEmail?: string | null | undefined;
}

export function Header({ title, userEmail }: HeaderProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  };

  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : "FW";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/80 px-4 backdrop-blur-sm">
      <h1 className="flex-1 text-base font-semibold">{title}</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          title="Toggle theme"
        >
          {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
        <Button variant="ghost" size="icon-sm">
          <BellIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleSignOut}
          title="Sign out"
        >
          <LogOutIcon />
        </Button>
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
