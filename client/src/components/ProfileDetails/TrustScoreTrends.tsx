import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomTooltipProps, TrustScoreTrendProps } from '@/lib/frontend-types';

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/80 backdrop-blur-md p-4 rounded-lg shadow-lg border border-border">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-primary">Verified: {payload[0].value}</p>
        <p className="text-primary">Unverified: {payload[1].value}</p>
        <p className="text-primary">Tampered: {payload[2].value}</p>
      </div>
    );
  }
  return null;
};

const TrustScoreTrend: React.FC<TrustScoreTrendProps> = ({ monthlyData }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="mb-16 shadow-custom rounded-xl pt-4"
    >
      <h2 className="text-3xl font-bold mb-6 text-center">Video Status Trend</h2>
      <Card className="bg-card backdrop-blur-lg border-none transition-all duration-300">
        <CardContent className="p-8">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                onMouseMove={(e: any) => {
                  if (e.activeTooltipIndex !== undefined) {
                    setActiveIndex(e.activeTooltipIndex);
                  }
                }}
              >
                <defs>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUnverified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTampered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="verifiedCount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVerified)" />
                <Area type="monotone" dataKey="unverifiedCount" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorUnverified)" />
                <Area type="monotone" dataKey="tamperedCount" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTampered)" />
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
              {monthlyData[activeIndex]?.month}: 
              Verified {monthlyData[activeIndex]?.verifiedCount || 0}, 
              Unverified {monthlyData[activeIndex]?.unverifiedCount || 0}, 
              Tampered {monthlyData[activeIndex]?.tamperedCount || 0}
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.section>
  );
};

export default TrustScoreTrend;
