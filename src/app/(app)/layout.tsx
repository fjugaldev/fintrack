import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { getProfile } from "@/lib/db/actions/profile.actions"
import { ThemeSync } from "./_components/theme-sync"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()

  if (!profile) redirect("/auth/login")
  if (!profile.onboardingCompleted) redirect("/onboarding")

  return (
    <SidebarProvider>
      <ThemeSync theme={profile.theme} />
      <AppSidebar profile={profile} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
        </header>
        <main className="flex-1 p-4 md:p-6 pb-6 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
