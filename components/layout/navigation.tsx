"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconBraces, IconDatabase, IconFileCode, IconAdjustments } from "@tabler/icons-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "JSON Viewer", href: "/json-viewer", icon: IconBraces },
  { name: "SQL Placeholder", href: "/sql-placeholder", icon: IconDatabase },
  { name: "Properties Converter", href: "/properties-converter", icon: IconAdjustments },
  { name: "Record to Protobuf", href: "/record-protobuf", icon: IconFileCode },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-xl font-bold">
          CodelessShipMore
        </Link>
        <div className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center space-x-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
      <ThemeToggle />
    </nav>
  )
}