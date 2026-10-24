import { UsersIcon } from "lucide-react";
import { MembersPage } from "@/components/members/members-page.tsx";
import { ThemeToggle } from "@/components/theme-toggle.tsx";
import { Toaster } from "@/components/ui/sonner";

export function App() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2 font-heading font-semibold">
            <UsersIcon className="size-5" />
            Members
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <MembersPage />
      </main>

      <Toaster />
    </div>
  );
}
