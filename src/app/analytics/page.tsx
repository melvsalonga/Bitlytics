import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth-utils';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics - Bitlytics',
  description: 'View detailed analytics and performance metrics for your shortened URLs',
};

export default async function AnalyticsPage() {
  // Check if user is authenticated
  const user = await getAuthUser();
  
  if (!user) {
    // Redirect to sign in with callback URL
    redirect('/auth/signin?callbackUrl=/analytics');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnalyticsDashboard />
    </div>
  );
}
