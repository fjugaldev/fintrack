"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  WalletIcon,
  ArrowLeftRightIcon,
  TagIcon,
  PieChartIcon,
  TargetIcon,
  TrendingUpIcon,
  Settings2Icon,
  SendIcon,
  RefreshCcwIcon,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import type { Profile } from "@/lib/db/schema"

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Cuentas", url: "/accounts", icon: WalletIcon },
  { title: "Transacciones", url: "/transactions", icon: ArrowLeftRightIcon },
  { title: "Recurrentes", url: "/recurring", icon: RefreshCcwIcon },
  { title: "Categorías", url: "/categories", icon: TagIcon },
]

const navPlanning = [
  { title: "Presupuesto", url: "/budgets", icon: PieChartIcon, enabled: true },
  { title: "Metas", url: "/goals", icon: TargetIcon, enabled: true },
  { title: "Precios", url: "/prices", icon: TrendingUpIcon, enabled: false },
]

const navBottom = [
  { title: "Configuración", url: "/settings", icon: Settings2Icon },
  { title: "Feedback", url: "/feedback", icon: SendIcon },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  profile: Profile
}

export function AppSidebar({ profile, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TrendingUpIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">FinTrack</span>
                <span className="truncate text-xs text-muted-foreground">Finanzas personales</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Principal — activo */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Planificación */}
        <SidebarGroup>
          <SidebarGroupLabel>Planificación</SidebarGroupLabel>
          <SidebarMenu>
            {navPlanning.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
              return (
                <SidebarMenuItem key={item.url}>
                  {item.enabled ? (
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="opacity-50 cursor-not-allowed"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                      <span className="ml-auto text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded group-data-[collapsible=icon]:hidden">
                        Próx.
                      </span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Secundario al fondo — patrón NavSecondary */}
        <NavSecondary
          items={navBottom.map((item) => ({
            title: item.title,
            url: item.url,
            icon: <item.icon />,
          }))}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser profile={profile} />
      </SidebarFooter>
    </Sidebar>
  )
}
