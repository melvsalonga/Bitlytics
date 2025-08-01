'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { BarChart3, Home, Link as LinkIcon, User, LogOut, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnalyticsAccessModal } from '@/components/modals/AnalyticsAccessModal'
import { useState } from 'react'

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)

  const baseNavItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      description: 'Create shortened URLs',
      requiresAuth: false
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View URL performance',
      requiresAuth: false,
      isAnalytics: true
    }
  ]

  // Build navigation items based on authentication status
  const navigationItems = session?.user ? [
    ...baseNavItems,
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: User,
      description: 'Manage your URLs',
      requiresAuth: true
    },
    ...(session.user.role === 'ADMIN' ? [{
      href: '/admin',
      label: 'Admin',
      icon: Shield,
      description: 'Admin panel',
      requiresAuth: true
    }] : [])
  ] : baseNavItems


  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <LinkIcon className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Bitlytics</span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || 
                                (item.href === '/analytics' && pathname?.startsWith('/analytics')) ||
                                (item.href === '/dashboard' && pathname?.startsWith('/dashboard')) ||
                                (item.href === '/admin' && pathname?.startsWith('/admin'))
                
                // Handle analytics link specially for anonymous users
                if (item.isAnalytics && !session?.user) {
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowAnalyticsModal(true)}
                      className={cn(
                        "flex items-center space-x-2",
                        isActive && "bg-blue-600 text-white hover:bg-blue-700"
                      )}
                      title={item.description}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Button>
                  )
                }
                
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

            {/* Authentication Section */}
            <div className="flex items-center space-x-2">
              {status === 'loading' ? (
                <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full" />
              ) : session?.user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 hidden md:inline">
                    {session.user.name || session.user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link href="/auth/signin">
                      <User className="h-4 w-4 mr-1" />
                      Sign in
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                  >
                    <Link href="/auth/register">
                      Sign up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Analytics Access Modal */}
      <AnalyticsAccessModal 
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />
    </nav>
  )
}
