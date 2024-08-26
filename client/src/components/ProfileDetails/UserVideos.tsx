import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Eye } from "lucide-react"

const mockVideos = [
  { title: "Trusted Content 1", trustScore: 98, views: "10.5K" },
  { title: "Verified Video 2", trustScore: 97, views: "8.2K" },
  { title: "Authentic Clip 3", trustScore: 99, views: "15.3K" },
  { title: "Reliable Content 4", trustScore: 96, views: "7.8K" },
  { title: "Credible Video 5", trustScore: 98, views: "12.1K" },
  { title: "Trustworthy Footage 6", trustScore: 97, views: "9.6K" },
]

const VerifiedVideos = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="mb-16"
    >
      <h2 className="text-4xl font-bold mb-10 text-center">Verified Videos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {mockVideos.map((video, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="group"
          >
            <Card className="overflow-hidden border hover:shadow-2xl transition-all duration-300 bg-card/70 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="relative">
                  <img
                    src={`/api/placeholder/350/200?text=Video+${index + 1}`}
                    alt={`Video ${index + 1}`}
                    className="w-full h-56 object-cover rounded-lg shadow-md"
                  />
                  <div className="absolute top-3 right-3 bg-green-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Verified
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mt-6 mb-3 group-hover:text-primary transition-colors duration-300">{video.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  <span className="mr-4 font-medium">Trust Score: {video.trustScore}</span>
                  <Eye className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="font-medium">{video.views} views</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default VerifiedVideos