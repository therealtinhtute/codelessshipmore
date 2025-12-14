"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  IconBraces,
  IconDatabase,
  IconFileCode,
  IconAdjustments
} from "@tabler/icons-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"

const navigation = [
  { name: "JSON Viewer", href: "/json-viewer", icon: IconBraces },
  { name: "SQL Placeholder", href: "/sql-placeholder", icon: IconDatabase },
  { name: "Properties Converter", href: "/properties-converter", icon: IconAdjustments },
  { name: "Record to Protobuf", href: "/record-protobuf", icon: IconFileCode },
]

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/" className="flex flex-col items-start gap-2 py-2">
            <Image src="/pepe.svg" alt="Pepe" width={48} height={48} className="size-12" />
            <div className="text-start">
              <div className="font-semibold text-sm">CodelessShipMore</div>
              <div className="text-xs text-muted-foreground">Dev Tools</div>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Developer Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      className="data-active:bg-primary/10 data-active:text-primary data-active:font-medium hover:bg-accent"
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-end">
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          {/* You can add additional header items here if needed */}
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}