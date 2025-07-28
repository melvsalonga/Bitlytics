'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, MapPin } from 'lucide-react';

interface AnalyticsAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortCode: string;
}

export function AnalyticsAccessModal({ isOpen, onClose, shortCode }: AnalyticsAccessModalProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignIn = () => {
    router.push(`/auth/signin?callbackUrl=/analytics`);
  };

  const handleRegister = () => {
    router.push('/auth/register');
  };

  const handleViewAnalytics = () => {
    router.push('/analytics');
    onClose();
  };

  // If user is authenticated, go directly to analytics
  if (session) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Analytics Ready
            </DialogTitle>
            <DialogDescription>
              Your shortened URL has been created! View detailed analytics to track its performance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={handleViewAnalytics} className="w-full">
              View Analytics
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If user is not authenticated, show auth prompt
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Unlock Powerful Analytics
          </DialogTitle>
          <DialogDescription className="text-base">
            Get detailed insights into your URL's performance with advanced analytics.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-medium text-sm">Click Tracking</h4>
            <p className="text-xs text-gray-600">Monitor every click in real-time</p>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium text-sm">Visitor Insights</h4>
            <p className="text-xs text-gray-600">Understand your audience</p>
          </div>
          <div className="text-center">
            <MapPin className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-medium text-sm">Geographic Data</h4>
            <p className="text-xs text-gray-600">See where clicks come from</p>
          </div>
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <h4 className="font-medium text-sm">Detailed Reports</h4>
            <p className="text-xs text-gray-600">Export and analyze data</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handleSignIn} className="w-full">
            Sign In to View Analytics
          </Button>
          <Button variant="outline" onClick={handleRegister} className="w-full">
            Create Free Account
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full text-sm">
            Skip for Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
