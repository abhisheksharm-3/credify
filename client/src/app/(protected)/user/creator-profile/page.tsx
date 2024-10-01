"use client";

import { Suspense } from 'react';
import LoggedInLayout from '@/components/Layout/LoggedInLayout';
import TrustStatistics from '@/components/ProfileDetails/TrustStatistics';
import TrustScoreTrend from '@/components/ProfileDetails/TrustScoreTrends';
import VerifiedVideos from '@/components/ProfileDetails/UserVideos';
import { useUser } from '@/hooks/useUser';
import UserHeader from '@/components/ProfileDetails/UserHeader';
import { useFiles } from '@/hooks/useFiles';
import { Loader2 } from 'lucide-react';

const TrustDashboard = () => {
  const { user, loading: userLoading } = useUser();
  const { files, verifiedCount, unverifiedCount, tamperedCount, monthlyData } = useFiles();

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <LoggedInLayout>
      <div className="min-h-screen bg-background">
        <UserHeader user={user} />
        <main className="container mx-auto px-4 py-8 space-y-8">
          <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
            <TrustStatistics
              verifiedCount={verifiedCount}
              unverifiedCount={unverifiedCount}
              tamperedCount={tamperedCount}
            />
          </Suspense>
          <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
            <TrustScoreTrend monthlyData={monthlyData} />
          </Suspense>
          <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
            <VerifiedVideos files={files} />
          </Suspense>
        </main>
      </div>
    </LoggedInLayout>
  );
};

export default TrustDashboard;