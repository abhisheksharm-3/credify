"use client"
import { useEffect, useState } from 'react'
import LoggedInLayout from '@/components/Layout/LoggedInLayout'
import TrustStatistics from '@/components/ProfileDetails/TrustStatistics'
import TrustScoreTrend from '@/components/ProfileDetails/TrustScoreTrends'
import VerifiedVideos from '@/components/ProfileDetails/UserVideos'
import { useUser } from '@/hooks/useUser'
import UserHeader from '@/components/ProfileDetails/UserHeader'
import { FileInfo } from '@/lib/types'

const TrustDashboard = () => {
  const { user, loading } = useUser()
  const [files, setFiles] = useState<FileInfo[]>([])
  const [verifiedCount, setVerifiedCount] = useState(0)
  const [unverifiedCount, setUnverifiedCount] = useState(0)
  const [tamperedCount, setTamperedCount] = useState(0)
  const [trustScore, setTrustScore] = useState(0)

  const getFiles = async () => {
    const response = await fetch('/api/content/get')
    const data = await response.json()
    return data.files
  }

  // Normalize files and count statuses
  const processFiles = (files: FileInfo[]) => {
    let verified = 0
    let unverified = 0
    let tampered = 0
    const normalizedFiles = files.map(file => {
      if (file.tampered) {
        tampered++
      } else if (file.verified) {
        verified++
      } else {
        unverified++
      }
      return {
        ...file,
        tampered: !!file.tampered, // Normalize tampered status to boolean
        verified: !!file.verified,  // Normalize verified status to boolean
      }
    })

    // Set counts and trust score
    const totalFiles = verified + unverified + tampered
    const trustScore = totalFiles > 0 ? parseFloat(((verified / totalFiles) * 5).toFixed(1)) : 0

    setVerifiedCount(verified)
    setUnverifiedCount(unverified)
    setTamperedCount(tampered)
    setTrustScore(trustScore)
    setFiles(normalizedFiles)
  }
  
  useEffect(() => {
    const fetchAndProcessFiles = async () => {
      const files = await getFiles()
      processFiles(files)
    }

    fetchAndProcessFiles()
  }, [])

  if (loading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="loader "></div>
    </div>
  }

  return (
    <LoggedInLayout>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <UserHeader verifiedCount={verifiedCount} user={user} trustScore={trustScore} />
        <main className="container mx-auto px-4 py-16 relative z-10">
          <TrustStatistics
            verifiedCount={verifiedCount}
            unverifiedCount={unverifiedCount}
            tamperedCount={tamperedCount}
          />
          <TrustScoreTrend />
          <VerifiedVideos files={files} /> 
        </main>
      </div>
    </LoggedInLayout>
  )
}

export default TrustDashboard
