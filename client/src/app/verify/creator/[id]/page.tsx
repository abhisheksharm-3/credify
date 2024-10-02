'use client';
import React, { useEffect, useState } from 'react';
import { getUserById } from '@/lib/server/appwrite';
import { useParams } from 'next/navigation';
import Loading from '@/app/loading';
import Layout from '@/components/Layout/Layout';
import { AppwriteUser, FileInfo } from '@/lib/types';
import CreatorHeader from '@/components/PublicComponents/CreatorHeader';
import UserNotFound from '@/components/PublicComponents/UserNotFound';
import { normalizeFile, processMonthlyData } from '@/lib/frontend-function';
import { MonthlyData } from '@/lib/frontend-types';
import TrustStatistics from '@/components/ProfileDetails/TrustStatistics';
import TrustScoreTrend from '@/components/ProfileDetails/TrustScoreTrends';

const CreatorView: React.FC = () => {
  const params = useParams();
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [tamperedCount, setTamperedCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  // Function to fetch user files
  const fetchUserFiles = async (userId: string) => {
    try {
      const response = await fetch(`/api/content/get-files-by-id?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user files');
      }
      const data = await response.json();
      return data.files;
    } catch (error) {
      console.error('Error fetching files:', error);
      return [];
    }
  };


  useEffect(() => {
    async function fetchUserData() {
      try {
        const userId = Array.isArray(params.id) ? params.id[0] : params.id;

        // Fetch user data
        const result = await getUserById(userId);
        if (result.success && result.user) {
          setUser(result.user as AppwriteUser);

          // Fetch user files
          const userFiles = await fetchUserFiles(userId);
          const normalizedFiles = userFiles.map(normalizeFile);
          setFiles(normalizedFiles);

          // Compute counts
          const verified = normalizedFiles.filter((file: { verified: any; }) => file.verified).length;
          const tampered = normalizedFiles.filter((file: { tampered: any; }) => file.tampered).length;
          const unverified = normalizedFiles.filter((file: { verified: any; tampered: any; }) => !file.verified && !file.tampered).length;

          setVerifiedCount(verified);
          setTamperedCount(tampered);
          setUnverifiedCount(unverified);

          // Generate monthly data
          const processedMonthlyData = processMonthlyData(normalizedFiles);
          setMonthlyData(processedMonthlyData);

        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user or files:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [params.id]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <UserNotFound />;
  }

  return (
    <Layout>
      <CreatorHeader user={user} />
      <main className="container mx-auto px-4 py-16 relative z-10">
        <TrustStatistics
          verifiedCount={verifiedCount}
          unverifiedCount={unverifiedCount}
          tamperedCount={tamperedCount}
        />
        <TrustScoreTrend monthlyData={monthlyData} />
      </main>
    </Layout>
  );
};

export default CreatorView;