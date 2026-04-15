"use client"

import Image from "next/image"
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
  { title: "Dashboard", url: "/", icon: LayoutDashboardIcon },
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
      <SidebarHeader className="flex items-center justify-center p-4 group-data-[collapsible=icon]:p-1">
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/logo-fintrack.png"
            alt="FinTrack"
            width={140}
            height={40}
            className="group-data-[collapsible=icon]:hidden"
            priority
          />
          <Image
            src="/logo-fintrack-shape.png"
            alt="FinTrack"
            width={40}
            height={40}
            className="hidden group-data-[collapsible=icon]:block"
            priority
          />
        </Link>
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
