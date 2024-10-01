import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const GeminiIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const Hero: React.FC = () => (
  <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-secondary/10">
    <div className="container px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit">
            <svg fill="none" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
              <path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" fill="url(#prefix__paint0_radial_980_20147)" />
              <defs>
                <radialGradient id="prefix__paint0_radial_980_20147" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)">
                  <stop offset=".067" stopColor="#9168C0" />
                  <stop offset=".343" stopColor="#5684D1" />
                  <stop offset=".672" stopColor="#1BA1E3" />
                </radialGradient>
              </defs>
            </svg>
              Powered by Gemini
            </Badge>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Credify: Safeguarding Digital Truth
            </h1>
            <p className="max-w-[600px] text-muted-foreground text-lg sm:text-xl">
              Unleash advanced video verification to protect your content and preserve authenticity in the digital age.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#" className="group">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative mt-8 lg:mt-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl transform rotate-2"></div>
          <div className="relative overflow-hidden rounded-2xl aspect-video shadow-2xl">
            <img
              src="/images/hero.png"
              alt="Credify in action"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <Badge variant="secondary" className="text-sm backdrop-blur-sm bg-black/30">
                Verified Content
              </Badge>
              <Badge variant="secondary" className="text-sm backdrop-blur-sm bg-black/30">
              <svg fill="none" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
              <path d="M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z" fill="url(#prefix__paint0_radial_980_20147)" />
              <defs>
                <radialGradient id="prefix__paint0_radial_980_20147" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)">
                  <stop offset=".067" stopColor="#9168C0" />
                  <stop offset=".343" stopColor="#5684D1" />
                  <stop offset=".672" stopColor="#1BA1E3" />
                </radialGradient>
              </defs>
            </svg>
                Powered by Gemini
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)