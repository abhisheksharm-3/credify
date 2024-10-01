import React from 'react'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'

export const CallToAction: React.FC = () => (
  <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b  dark:from-gray-800">
    <div className="container px-4 md:px-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 md:p-12 text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Elevate Your Content's <span className="text-primary">Credibility</span>
            </h2>
            <p className="text-xl text-muted-foreground mx-auto max-w-[700px]">
              Experience the power of Credify in safeguarding your digital assets and fostering audience trust.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/public/analyze" prefetch={false}>
                Start Analyzing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="#" prefetch={false}>
                Learn More
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center text-muted-foreground">
            <Zap className="mr-2 h-4 w-4" />
            <span className="text-sm">Start protecting your content in minutes</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
)