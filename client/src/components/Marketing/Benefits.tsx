import React from 'react'
import { LockIcon, AnchorIcon, ShieldCheckIcon } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BenefitItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, title, description }) => (
  <Card className="transition-all duration-300 hover:shadow-lg">
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
  <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div className="container px-4 md:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr,400px] items-center">
        <div className="space-y-8">
          <div className="space-y-2">
            <Badge variant="secondary" className="mb-2">Benefits</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why Choose Credify?
            </h2>
            <p className="max-w-[600px] text-muted-foreground">
              Ensure your video content is trustworthy, secure, and authentic in the digital age.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <BenefitItem
              icon={<ShieldCheckIcon className="h-6 w-6 text-primary" />}
              title="Trustworthy Content"
              description="Rigorous verification for authentic content your audience can trust."
            />
            <BenefitItem
              icon={<LockIcon className="h-6 w-6 text-primary" />}
              title="Secure Platform"
              description="State-of-the-art security measures protect your valuable video data."
            />
            <BenefitItem
              icon={<AnchorIcon className="h-6 w-6 text-primary" />}
              title="Authentic Verification"
              description="Cutting-edge techniques guarantee 100% content authenticity."
            />
          </div>
        </div>
        <div className="relative aspect-video">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl transform rotate-2"></div>
          <img
            src="/images/image2.png"
            alt="Benefits of Credify"
            className="relative z-10 w-full h-full object-cover rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </div>
  </section>
)