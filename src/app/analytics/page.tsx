import { Metadata } from 'next';
import { getAuthUser } from '@/lib/auth-utils';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import AnalyticsLanding from '@/components/analytics/AnalyticsLanding';

export const metadata: Metadata = {
  title: 'Analytics - Bitlytics',
  description: 'View detailed analytics and performance metrics for your shortened URLs',
};

export default async function AnalyticsPage() {
  // Check if user is authenticated
  const user = await getAuthUser();
  
  if (!user) {
    // Show analytics landing page for anonymous users
    return <AnalyticsLanding />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnalyticsDashboard />
    </div>
  );
}
