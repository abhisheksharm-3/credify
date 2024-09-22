import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ShineBorder from '../magicui/shine-border'

export const Hero = () => (
  <section className="w-full container py-16 md:py-24 lg:py-32 xl:py-48">
    <div className="container px-4 md:px-6 mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Credify: Safeguarding Digital Truth
          </h1>
          <p className="text-lg md:text-xl max-w-[600px] text-gray-600 dark:text-gray-300">
            Unleash the power of advanced video verification to protect your content and preserve authenticity in the digital age.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              prefetch={false}
            >
              Get Started
            </Link>
            <Link
              href="#"
              className="inline-flex h-12 items-center justify-center rounded-md border border-gray-300 bg-white px-8 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              prefetch={false}
            >
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="mt-8 lg:mt-0 lg:ml-auto">
          <ShineBorder
             className="relative flex w-full flex-col aspect-video bg-muted shadow-xl items-center justify-center overflow-hidden rounded-lg md:shadow-xl"
             color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
           >
            <img
              src="/images/image1.png"
              alt="Credify in action"
              className="w-full h-full object-cover rounded-lg"
            />
          </ShineBorder>
        </div>
      </div>
    </div>
  </section>
)