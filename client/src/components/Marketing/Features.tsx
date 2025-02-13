import React from 'react';
import { FingerprintIcon, MonitorCheckIcon, CopyrightIcon, ShieldCheckIcon } from 'lucide-react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, comingSoon }) => (
  <Card className="group relative overflow-hidden border bg-background transition-all hover:shadow-xl">
    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <CardHeader className="space-y-4 pb-4">
      <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
        {React.cloneElement(icon as React.ReactElement, {
          className: "w-6 h-6 text-primary"
        })}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold tracking-tight text-xl">{title}</h3>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </CardContent>
  </Card>
);

export const Features: React.FC = () => (
  <section className="w-full py-16 md:py-24 lg:py-32">
    <div className="container px-4 md:px-6">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
          Safeguard Your Digital Content
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground text-lg">
          Explore how Credify empowers you to protect and authenticate your digital creations with our comprehensive toolkit
        </p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon={<FingerprintIcon />}
          title="Video Fingerprinting"
          description="Generate unique digital signatures for your content, creating a verifiable link back to you as the original creator."
        />
        <FeatureCard
          icon={<MonitorCheckIcon />}
          title="Tampering Detection"
          description="Utilize advanced algorithms to identify potential alterations in your content, helping you maintain its integrity."
        />
        <FeatureCard
          icon={<CopyrightIcon />}
          title="Creator Authentication"
          description="Enhance your credibility with our robust three-step verification system, designed to protect your identity as a content creator."
        />
        <FeatureCard
          icon={<ShieldCheckIcon />}
          title="Copyright Management"
          description="Access powerful tools to manage and enforce your intellectual property rights across various media platforms."
          comingSoon={true}
        />
      </div>
    </div>
  </section>
);