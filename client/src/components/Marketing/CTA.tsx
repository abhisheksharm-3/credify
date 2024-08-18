import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const CallToAction: React.FC = () => (
  <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b  dark:from-gray-800">
    <div className="container px-4 md:px-6 text-center">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Ready to Ensure <span className="text-primary">Authenticity</span>?
        </h2>
        <p className="text-xl text-muted-foreground md:text-2xl">
          Discover how Credify can safeguard your digital content and build trust with your audience.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="#"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-lg font-medium text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Request a Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="#"
            className="inline-flex h-12 items-center justify-center rounded-md border border-primary px-8 text-lg font-medium text-primary shadow-sm transition-all hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  </section>
)