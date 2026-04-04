"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  IconBraces,
  IconDatabase,
  IconFileCode,
  IconAdjustments,
  IconSparkles,
  IconSettings,
  IconLogin,
  IconLogout,
  IconKey,
} from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  PageHeaderProvider,
  usePageHeader,
} from "@/components/layout/page-header-context";
import { useAuth } from "@/contexts/auth-context";
import { LoginDialog } from "@/components/auth/login-dialog";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { cn } from "@/lib/utils";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "JSON Viewer", href: "/json-viewer", icon: IconBraces },
  { name: "SQL Placeholder", href: "/sql-placeholder", icon: IconDatabase },
  {
    name: "Properties Converter",
    href: "/properties-converter",
    icon: IconAdjustments,
  },
  { name: "Record to Protobuf", href: "/record-protobuf", icon: IconFileCode },
  { name: "TOTP Generator", href: "/totp-generator", icon: IconKey },
];

const protectedNavigation = [
  { name: "Enhance Prompt", href: "/enhance-prompt", icon: IconSparkles },
  { name: "Settings", href: "/settings", icon: IconSettings },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, logout, isLoading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <PageHeaderProvider>
      <SidebarProvider>
        <SidebarContentInner
          pathname={pathname}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          logout={logout}
          setLoginOpen={setLoginOpen}
        >
          {children}
        </SidebarContentInner>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </SidebarProvider>
    </PageHeaderProvider>
  );
}

function SidebarContentInner({
  pathname,
  isAuthenticated,
  isLoading,
  logout,
  setLoginOpen,
  children,
}: {
  pathname: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  setLoginOpen: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader
          className={cn(
            "flex md:pt-3.5",
            isCollapsed
              ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
              : "flex-row items-center justify-between"
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <Image
              src="/pepe.svg"
              alt="Pepe"
              width={32}
              height={32}
              className="size-8"
            />
            {!isCollapsed && (
              <span className="font-semibold text-black dark:text-white">
                CodelessShipMore
              </span>
            )}
          </Link>

          <motion.div
            key={isCollapsed ? "header-collapsed" : "header-expanded"}
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <NotificationsPopover />
            <SidebarTrigger />
          </motion.div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[0.688rem] font-medium">
              Developer Tools
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      className="data-active:bg-primary/10 data-active:text-primary data-active:font-semibold hover:bg-accent font-normal"
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span className="text-xs">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {!isLoading && isAuthenticated && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[0.688rem] font-medium">
                Pro Features
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {protectedNavigation.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        className="data-active:bg-primary/10 data-active:text-primary data-active:font-bold hover:bg-accent"
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span className="text-xs">
                            {item.name}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center justify-between">
            {!isLoading &&
              (isAuthenticated ? (
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary hover:font-bold transition-all"
                >
                  <IconLogout className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Logout
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary hover:font-bold transition-all"
                >
                  <IconLogin className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Login
                  </span>
                </button>
              ))}
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInsetContent>{children}</SidebarInsetContent>
    </>
  );
}

function SidebarInsetContent({ children }: { children: React.ReactNode }) {
  const { title, description } = usePageHeader();

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-4 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        {title && (
          <div className="flex-1">
            <h1 className="text-base font-semibold">{title}</h1>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </header>
      <div className="flex flex-1 flex-col p-4">{children}</div>
    </SidebarInset>
  );
}
