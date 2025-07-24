'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BarChart3, Home, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      description: 'Create shortened URLs'
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View URL performance'
    }
  ]

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <LinkIcon className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Bitlytics</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                              (item.href === '/analytics' && pathname.startsWith('/analytics'))
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "flex items-center space-x-2",
                    isActive && "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  <Link href={item.href} title={item.description}>
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
