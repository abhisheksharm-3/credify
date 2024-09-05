// TrustDashboard.tsx
"use client"
import {FC} from 'react'
import LoggedInLayout from '@/components/Layout/LoggedInLayout'
import UserHeader from '@/components/ProfileDetails/UserHeader'
import TrustStatistics from '@/components/ProfileDetails/TrustStatistics'
import TrustScoreTrend from '@/components/ProfileDetails/TrustScoreTrends'
import VerifiedVideos from '@/components/ProfileDetails/UserVideos'
import { useUser } from '@/hooks/useUser'

const TrustDashboard = () => {
  const { user, loading } = useUser()

  if (loading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="loader "></div>
    </div>
  }

  return (
    <LoggedInLayout>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <UserHeader user={user} />
        <main className="container mx-auto px-4 py-16  relative z-10">
          <TrustStatistics />
          <TrustScoreTrend />
          <VerifiedVideos />
        </main>
      </div>
    </LoggedInLayout>
  )
}

export default TrustDashboard