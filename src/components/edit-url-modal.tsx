'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const editUrlSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
})

type EditUrlFormData = z.infer<typeof editUrlSchema>

interface EditUrlModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  url: {
    id: string
    shortCode: string
    title?: string
    description?: string
    isActive: boolean
    originalUrl: string
  }
}

export function EditUrlModal({ isOpen, onClose, onSuccess, url }: EditUrlModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EditUrlFormData>({
    resolver: zodResolver(editUrlSchema),
    defaultValues: {
      title: url.title || '',
      description: url.description || '',
      isActive: url.isActive,
    },
  })

  const onSubmit = async (data: EditUrlFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/urls/${url.shortCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update URL')
      }

      toast.success('URL updated successfully!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating URL:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update URL'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit URL</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* URL Info (Read-only) */}
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Short Code</label>
                <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {url.shortCode}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Original URL</label>
                <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded break-all">
                  {url.originalUrl}
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Give your URL a memorable title" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a description for this URL"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      When inactive, the URL will not redirect
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update URL'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
