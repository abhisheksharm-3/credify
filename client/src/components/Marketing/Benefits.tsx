import React from 'react'
import { LockIcon, AnchorIcon, ShieldCheckIcon } from 'lucide-react'
import { BenefitItemProps } from '@/lib/frontend-types'

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, title, description }) => (
  <li className="flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105">
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </li>
)

export const Benefits: React.FC = () => (
  <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
    <div className="container px-4 md:px-6 mx-auto">
      <div className="grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <div className="space-y-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Benefits of Credify
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-[600px]">
              Ensure your video content is trustworthy, secure, and authentic in the digital age.
            </p>
          </div>
          <ul className="grid gap-6">
            <BenefitItem
              icon={<ShieldCheckIcon className="h-6 w-6 text-primary" />}
              title="Trustworthy Content"
              description="Our rigorous verification process ensures your video content is authentic and can be trusted by your audience."
            />
            <BenefitItem
              icon={<LockIcon className="h-6 w-6 text-primary" />}
              title="Secure Platform"
              description="Your valuable video data is protected by state-of-the-art security measures on the Credify platform."
            />
            <BenefitItem
              icon={<AnchorIcon className="h-6 w-6 text-primary" />}
              title="Authentic Verification"
              description="Cutting-edge techniques guarantee 100% authenticity for your video content, building trust with your viewers."
            />
          </ul>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl transform rotate-3"></div>
          <img
            src="/images/image2.png"
            width={550}
            height={310}
            alt="Benefits of Credify"
            className="relative z-10 w-full h-auto max-w-full rounded-3xl shadow-2xl"
          />
        </div>
      </div>
    </div>
  </section>
)