'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Copy, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  MousePointer,
  Users,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { EditUrlModal } from '@/components/edit-url-modal'

interface ShortUrl {
  id: string
  shortCode: string
  originalUrl: string
  shortUrl: string
  title?: string
  description?: string
  isActive: boolean
  createdAt: string
  totalClicks: number
}

interface UrlsResponse {
  success: boolean
  data: ShortUrl[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [urls, setUrls] = useState<ShortUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<UrlsResponse['pagination'] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard')
    }
  }, [status, router])

  // Fetch user URLs
  const fetchUrls = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/urls?page=${page}&limit=10`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch URLs')
      }
      
      const data: UrlsResponse = await response.json()
      
      if (data.success) {
        setUrls(data.data)
        setPagination(data.pagination)
        setCurrentPage(page)
      } else {
        toast.error('Failed to load your URLs')
      }
    } catch (error) {
      console.error('Error fetching URLs:', error)
      toast.error('Failed to load your URLs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUrls()
    }
  }, [status])

  // Copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy URL:', error)
      toast.error('Failed to copy URL')
    }
  }

  // Delete URL
  const deleteUrl = async (shortCode: string) => {
    if (!confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/urls/${shortCode}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('URL deleted successfully')
        fetchUrls(currentPage) // Refresh the list
      } else {
        toast.error('Failed to delete URL')
      }
    } catch (error) {
      console.error('Error deleting URL:', error)
      toast.error('Failed to delete URL')
    }
  }

  // Filter URLs based on search term
  const filteredUrls = urls.filter(url =>
    url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return null // Redirecting...
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your shortened URLs and view analytics
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/">
            <Plus className="w-4 h-4 mr-2" />
            Create New URL
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              URLs in your account
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {urls.reduce((sum, url) => sum + url.totalClicks, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all your URLs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active URLs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {urls.filter(url => url.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search URLs, short codes, or titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* URLs List */}
      <div className="space-y-4">
        {filteredUrls.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ExternalLink className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No URLs found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? "No URLs match your search criteria." 
                  : "You haven't created any short URLs yet."
                }
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href="/">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First URL
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredUrls.map((url) => (
            <Card key={url.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* URL Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-lg truncate">
                        {url.title || url.shortCode}
                      </h3>
                      <Badge variant={url.isActive ? "default" : "secondary"}>
                        {url.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Short URL:</span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {url.shortUrl}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(url.shortUrl)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Original:</span>
                        <span className="text-sm text-gray-800 truncate max-w-md">
                          {url.originalUrl}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(url.originalUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(url.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointer className="h-4 w-4" />
                        {url.totalClicks} clicks
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/analytics/${url.shortCode}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Analytics
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // TODO: Implement edit functionality
                        toast.info('Edit functionality coming soon!')
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteUrl(url.shortCode)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUrls(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUrls(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
