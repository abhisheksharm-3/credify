import React from 'react'
import { LockIcon, AnchorIcon, ShieldCheckIcon, TrendingUpIcon } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BenefitItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, title, description }) => (
  <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <CardContent className="flex items-start space-x-4 pt-6">
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
)

export const Benefits: React.FC = () => (
  <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background via-background to-background/50 overflow-hidden">
    <div className="container px-4 md:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr,450px] items-center">
        <div className="space-y-8">
          <div className="space-y-2">
            <Badge variant="secondary" className="mb-2">Why Credify</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Empower Your Digital Content
            </h2>
            <p className="max-w-[600px] text-muted-foreground">
              Experience unparalleled security, authenticity, and trust for your video content in the digital landscape.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <BenefitItem
              icon={<ShieldCheckIcon className="h-6 w-6 text-primary" />}
              title="Trustworthy Content"
              description="Establish credibility with rigorously verified and authentic content your audience can rely on."
            />
            <BenefitItem
              icon={<LockIcon className="h-6 w-6 text-primary" />}
              title="Secure Platform"
              description="Protect your valuable video assets with state-of-the-art security measures and encryption."
            />
            <BenefitItem
              icon={<AnchorIcon className="h-6 w-6 text-primary" />}
              title="Authentic Verification"
              description="Leverage cutting-edge techniques to guarantee 100% content authenticity and origin."
            />
            <BenefitItem
              icon={<TrendingUpIcon className="h-6 w-6 text-primary" />}
              title="Enhanced Engagement"
              description="Boost viewer trust and interaction with verifiably authentic and tamper-proof content."
            />
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl transform -rotate-6 group-hover:rotate-6 transition-transform duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl transform rotate-2 group-hover:-rotate-2 transition-transform duration-300"></div>
          <div className="relative">
            <img
              src="/images/benefits.png"
              alt="Benefits of Credify"
              className="w-full h-auto object-cover rounded-2xl shadow-xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-2xl shadow-inner"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
)