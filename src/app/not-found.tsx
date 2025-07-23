import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, Link as LinkIcon } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-2xl">URL Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            The short URL you're looking for doesn't exist or may have expired.
          </p>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-500">This could happen if:</p>
            <ul className="text-sm text-gray-500 text-left space-y-1">
              <li>• The URL was mistyped</li>
              <li>• The link has expired</li>
              <li>• The URL was deleted by its creator</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <LinkIcon className="mr-2 h-4 w-4" />
                Create Short URL
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
