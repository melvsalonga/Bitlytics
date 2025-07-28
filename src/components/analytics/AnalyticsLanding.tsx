import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AnalyticsLanding() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold">Unlock Advanced Analytics</h1>
      <p className="mt-4 text-lg text-gray-600">
        Get insights into your URL performance and track engagement across your campaigns.
      </p>
      <div className="mt-8 flex flex-col md:flex-row justify-center gap-4">
        <Button onClick={() => router.push('/auth/signin?callbackUrl=/analytics')}>Sign In</Button>
        <Button variant="outline" onClick={() => router.push('/auth/register')}>Register</Button>
      </div>
    </div>
  );
}

