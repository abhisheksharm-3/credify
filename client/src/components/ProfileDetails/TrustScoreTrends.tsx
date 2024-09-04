import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const mockTrustData = [
  { name: 'Jan', score: 85 },
  { name: 'Feb', score: 88 },
  { name: 'Mar', score: 90 },
  { name: 'Apr', score: 92 },
  { name: 'May', score: 95 },
  { name: 'Jun', score: 97 },
  { name: 'Jul', score: 98 },
]

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/80 backdrop-blur-md p-4 rounded-lg shadow-lg border border-border">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-primary">Trust Score: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const TrustScoreTrend = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="mb-16 shadow-custom rounded-xl pt-4"
    >
      <h2 className="text-3xl font-bold mb-6 text-center">Trust Score Trend</h2>
      <Card className="bg-card backdrop-blur-lg border-none    transition-all duration-300 ">
        <CardContent className="p-8">
          <div className="h-[300px] ">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrustData}
                onMouseMove={(e: any) => {
                  if (e.activeTooltipIndex !== undefined) {
                    setActiveIndex(e.activeTooltipIndex);
                  }
                }}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis domain={[80, 100]} stroke="#888888" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <p className="text-2xl font-semibold text-primary">
              {mockTrustData[activeIndex].name}: Trust Score {mockTrustData[activeIndex].score}
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.section>
  )
}

export default TrustScoreTrend