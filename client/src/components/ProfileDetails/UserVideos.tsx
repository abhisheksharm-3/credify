import { useState } from 'react'
import { motion } from 'framer-motion'
import { CircleCheck, XCircle, ClipboardCheck, Clipboard } from 'lucide-react'
import { FC } from 'react'

interface IconProps {
  className?: string
  width?: number
  height?: number
}

interface VideoMetadata {
  title: string
  trustScore: number
  verified: boolean
  tampered: boolean
  copied: boolean  // Add this field to manage the copied state
}

const mockVideos: VideoMetadata[] = [
  { title: "Trusted Content 1", trustScore: 98, verified: true, tampered: false, copied: false },
  { title: "Verified Video 2", trustScore: 97, verified: false, tampered: true, copied: false },
  { title: "Authentic Clip 3", trustScore: 99, verified: true, tampered: false, copied: false },
  { title: "Reliable Content 4", trustScore: 96, verified: false, tampered: true, copied: false },
  { title: "Credible Video 5", trustScore: 98, verified: true, tampered: false, copied: false },
  { title: "Trustworthy Footage 6", trustScore: 97, verified: false, tampered: true, copied: false },
]

const VerifiedVideos = () => {
  const [videoStates, setVideoStates] = useState(mockVideos)

  // Handle the copy action for a specific video
  const handleCopy = (index: number) => {
    setVideoStates(prevStates =>
      prevStates.map((video, i) =>
        i === index ? { ...video, copied: !video.copied } : video
      )
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className=" mt-24"
    >
      <h2 className="text-4xl font-bold mb-10 text-center">All Videos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {videoStates.map((video, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="group"
          >
            <div className="bg-card text-card-foreground border-2  rounded-xl p-3 pl-5">
              <div>
                <div className="flex flex-col items-start gap-4">
                  <div className="flex flex-row items-center gap-4 justify-start">
                    <div className="bg-card-foreground/20 rounded-full p-2 shadow-lg">
                      <VideoIcon className="w-12 h-12 text-card-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{video.title}</h3>
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-2">
                        {/* Verified Status */}
                        <div className="flex items-center gap-2">
                          {video.verified ? (
                            <CircleCheck className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span>{video.verified ? "Verified" : "Not Verified"}</span>
                        </div>
                        {/* Tampered Status */}
                        <div className="flex items-center gap-2">
                          {video.tampered ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CircleCheck className="w-4 h-4 text-green-500" />
                          )}
                          <span>{video.tampered ? "Tampered" : "Not Tampered"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-end justify-end">
                    <button
                      className='bg-primary hover:bg-purple-900 text-white py-2 text-center px-3 rounded text-sm flex flex-row items-center gap-2 justify-center'
                      onClick={() => handleCopy(index)} // Update state on click
                    >
                      Verification Link
                      {video.copied ? (
                        <ClipboardCheck className="w-4 h-4" />
                      ) : (
                        <Clipboard className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default VerifiedVideos

const VideoIcon: FC<IconProps> = ({ className, width = 24, height = 24 }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </svg>
)
