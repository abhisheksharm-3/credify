"use client";
import LoggedInLayout from '@/components/Layout/LoggedInLayout';
import TrustStatistics from '@/components/ProfileDetails/TrustStatistics';
import TrustScoreTrend from '@/components/ProfileDetails/TrustScoreTrends';
import VerifiedVideos from '@/components/ProfileDetails/UserVideos';
import UserHeader from '@/components/ProfileDetails/UserHeader';
import { useFiles } from '@/hooks/useFiles'; 
import { useUser } from '@/hooks/useUser'; // Add this if you are using a custom user hook

const TrustDashboard = () => {
  const { user, loading } = useUser();  // useUser is now imported
  const { files ,verifiedCount, unverifiedCount, tamperedCount, monthlyData } = useFiles(); 

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }
  
  return (
    <LoggedInLayout>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <UserHeader user={user} />
        <main className="container mx-auto px-4 py-16 relative z-10">
          <TrustStatistics
            verifiedCount={verifiedCount}
            unverifiedCount={unverifiedCount}
            tamperedCount={tamperedCount}
          />
          <TrustScoreTrend monthlyData={monthlyData} />
          <VerifiedVideos files={files} />
        </main>
      </div>
    </LoggedInLayout>
  );
};

export default TrustDashboard;
