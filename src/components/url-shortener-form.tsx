'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { toast } from 'sonner'
import { Copy, Link, Loader2 } from 'lucide-react'

const urlFormSchema = z.object({
  originalUrl: z.string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL'),
  customCode: z.string()
    .optional()
    .refine((code) => !code || /^[a-zA-Z0-9-]{3,20}$/.test(code), {
      message: 'Custom code must be 3-20 characters, alphanumeric and hyphens only'
    })
})

type UrlFormData = z.infer<typeof urlFormSchema>

interface ShortenedUrlResult {
  shortCode: string
  shortUrl: string
  originalUrl: string
}

export function UrlShortenerForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ShortenedUrlResult | null>(null)

  const form = useForm<UrlFormData>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      originalUrl: '',
      customCode: ''
    }
  })

  const onSubmit = async (data: UrlFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to shorten URL')
      }

      const result = await response.json()
      
      setResult({
        shortCode: result.data.shortCode,
        shortUrl: `${window.location.origin}/${result.data.shortCode}`,
        originalUrl: result.data.originalUrl
      })

      toast.success('URL shortened successfully!')
      form.reset()
    } catch (error) {
      console.error('Error shortening URL:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to shorten URL')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const createNewUrl = () => {
    setResult(null)
    form.reset()
  }

  if (result) {
    return (
      <Card className=\"w-full max-w-2xl mx-auto\">
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Link className=\"h-5 w-5\" />
            Your Shortened URL
          </CardTitle>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          <div className=\"space-y-2\">
            <label className=\"text-sm font-medium text-gray-700\">Short URL:</label>
            <div className=\"flex gap-2\">
              <Input 
                value={result.shortUrl} 
                readOnly 
                className=\"font-mono bg-gray-50\"
              />
              <Button 
                variant=\"outline\" 
                size=\"icon\"
                onClick={() => copyToClipboard(result.shortUrl)}
              >
                <Copy className=\"h-4 w-4\" />
              </Button>
            </div>
          </div>
          
          <div className=\"space-y-2\">
            <label className=\"text-sm font-medium text-gray-700\">Original URL:</label>
            <Input 
              value={result.originalUrl} 
              readOnly 
              className=\"bg-gray-50 text-sm\"
            />
          </div>

          <div className=\"flex gap-2 pt-4\">
            <Button onClick={createNewUrl} variant=\"outline\" className=\"flex-1\">
              Create Another
            </Button>
            <Button asChild className=\"flex-1\">
              <a href={`/analytics/${result.shortCode}`}>
                View Analytics
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className=\"w-full max-w-2xl mx-auto\">
      <CardHeader>
        <CardTitle className=\"flex items-center gap-2\">
          <Link className=\"h-5 w-5\" />
          Shorten Your URL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=\"space-y-6\">
            <FormField
              control={form.control}
              name=\"originalUrl\"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL to Shorten</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder=\"https://example.com/very-long-url\" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name=\"customCode\"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Code (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder=\"my-custom-link\" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Create a custom short code for your URL (3-20 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type=\"submit\" 
              className=\"w-full\" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />
                  Shortening...
                </>
              ) : (
                'Shorten URL'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
