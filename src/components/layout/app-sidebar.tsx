'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  Target,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavUser } from './nav-user'
import type { Profile } from '@/lib/db/schema'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, enabled: true },
  { href: '/accounts', label: 'Cuentas', icon: Wallet, enabled: true },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight, enabled: true },
  { href: '/budgets', label: 'Presupuesto', icon: PieChart, enabled: true },
  { href: '/goals', label: 'Metas', icon: Target, enabled: false },
]

interface AppSidebarProps {
  profile: Profile
}

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
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
          width={32}
          height={32}
          className="hidden group-data-[collapsible=icon]:block"
          priority
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <SidebarMenuItem key={item.href}>
                    {item.enabled ? (
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        tooltip={item.label}
                        className="opacity-40 cursor-not-allowed"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <NavUser profile={profile} />
      </SidebarFooter>
    </Sidebar>
  )
}
