import React from 'react'
import { FingerprintIcon, MonitorCheckIcon, CopyrightIcon } from 'lucide-react'
import { FeatureCardProps } from '@/lib/frontend-types'

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
    <div className="p-3 bg-primary/10 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground text-center">{description}</p>
  </div>
)

export const Features: React.FC = () => (
  <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-gray-50 dark:to-gray-950">
    <div className="container px-4 md:px-6 mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Key Features</h2>
        <p className="mt-4 text-lg text-muted-foreground">Discover how Credify protects your digital content</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={<FingerprintIcon className="h-10 w-10 text-primary" />}
          title="Video Fingerprinting"
          description="Create unique digital signatures to detect any tampering or manipulation of your content."
        />
        <FeatureCard
          icon={<MonitorCheckIcon className="h-10 w-10 text-primary" />}
          title="Tampering Detection"
          description="Utilize advanced algorithms to identify and alert you of any unauthorized changes to your video content."
        />
        <FeatureCard
          icon={<CopyrightIcon className="h-10 w-10 text-primary" />}
          title="Creator Authentication"
          description="Verify and protect the identity of content creators to ensure source authenticity and build trust."
        />
      </div>
    </div>
  </section>
)