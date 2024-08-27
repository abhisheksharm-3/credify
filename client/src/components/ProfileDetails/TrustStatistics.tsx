import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Video, ThumbsUp, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const statistics = [
  { icon: Shield, label: "Trust Score", value: "98/100", color: "#4CAF50" },
  { icon: Video, label: "Verified Videos", value: "250", color: "#2196F3" },
  { icon: ThumbsUp, label: "Avg. Trust Rating", value: "4.8", color: "#FFC107" },
  { icon: Eye, label: "Total Views", value: "10.5M", color: "#9C27B0" },
]

const TrustStatistics = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      <h2 className="text-4xl font-bold mb-10 text-center">Trust Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {statistics.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
          >
            <Card className="bg-card/70 backdrop-blur-lg border-none shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden group">
              <CardContent className="p-6 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
                  className="mb-4"
                  style={{ color: stat.color }}
                >
                  <stat.icon className="w-12 h-12" />
                </motion.div>
                <p className="text-xl font-semibold mb-1 text-foreground">{stat.label}</p>
                <p className="text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <div 
                  className="absolute -bottom-1 -right-1 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                  style={{ color: stat.color }}
                >
                  <stat.icon size={80} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default TrustStatistics