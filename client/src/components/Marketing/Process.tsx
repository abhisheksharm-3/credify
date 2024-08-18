import React from 'react'
import { Video, Shield, Award } from 'lucide-react'

interface ProcessStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ icon, title, description, step }) => (
  <div className="flex flex-col items-center justify-start space-y-4 text-center relative">
    <div className="absolute top-0 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
      {step}
    </div>
    <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
      {icon}
    </div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
)

export const Process: React.FC = () => (
  <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-gray-50 dark:to-gray-900">
    <div className="container px-4 md:px-6 mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
        <p className="mt-4 text-lg text-muted-foreground">Secure your video content in three simple steps</p>
      </div>
      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary hidden lg:block" aria-hidden="true"></div>
        <ProcessStep
          icon={<Video className="h-10 w-10 text-primary" />}
          title="Video Capture"
          description="Securely upload or record your video content using Credify's platform."
          step={1}
        />
        <ProcessStep
          icon={<Shield className="h-10 w-10 text-primary" />}
          title="Verification"
          description="Our advanced AI algorithms analyze the video for authenticity and tampering."
          step={2}
        />
        <ProcessStep
          icon={<Award className="h-10 w-10 text-primary" />}
          title="Certification"
          description="Receive a Credify digital certificate to prove your video's authenticity."
          step={3}
        />
      </div>
    </div>
  </section>
)