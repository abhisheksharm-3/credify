import { LandingPieChart } from '@/components/LandingPieChart'
import Layout from '@/components/Layout/Layout'
import { AnchorIcon, BadgeCheckIcon, CopyrightIcon, FingerprintIcon, Link2Icon, LockIcon, MonitorCheckIcon, ScanIcon, StepForwardIcon, UploadIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { BarChart } from "recharts"

const Home = () => {
  return (
    <Layout>
       <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[url('/hero-bg.jpg')] bg-cover bg-center">
          <div className="container px-4 md:px-6 text-center">
            <div className="max-w-2xl mx-auto space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Ensure Authenticity with Credify
              </h1>
              <p className="text-lg md:text-xl">Advanced video verification techniques to protect your content</p>
              <Link
                href="#"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                prefetch={false}
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <FingerprintIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Video Fingerprinting</h3>
                <p className="text-muted-foreground">
                  Unique digital signatures to detect any tampering or manipulation.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <MonitorCheckIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Tampering Detection</h3>
                <p className="text-muted-foreground">
                  Advanced algorithms to identify any unauthorized changes to video content.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <CopyrightIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Creator Authentication</h3>
                <p className="text-muted-foreground">
                  Verify the identity of content creators to ensure source authenticity.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <StepForwardIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Video Capture</h3>
                <p className="text-muted-foreground">Capture video content using Credify&apos;s secure platform.</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Link2Icon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Verification</h3>
                <p className="text-muted-foreground">Our advanced algorithms analyze the video for authenticity.</p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <StepForwardIcon className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Certification</h3>
                <p className="text-muted-foreground">
                  Receive a Credify certification to ensure your video&apos;s authenticity.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">How Credify Works</h2>
                  <p className="text-muted-foreground md:text-xl">
                    A step-by-step guide to ensuring video authenticity.
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4">
                    <UploadIcon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-bold">Upload Video</h3>
                      <p className="text-muted-foreground">Submit your video content to the Credify platform.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <ScanIcon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-bold">Analyze Content</h3>
                      <p className="text-muted-foreground">
                        Credify&apos;s advanced algorithms will verify the video&apos;s authenticity.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <BadgeCheckIcon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-bold">Receive Certification</h3>
                      <p className="text-muted-foreground">
                        Get a Credify seal of approval to showcase your verified content.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <LandingPieChart />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Benefits of Credify</h2>
                  <p className="text-muted-foreground md:text-xl">
                    Ensure your video content is trustworthy, secure, and authentic.
                  </p>
                </div>
                <ul className="grid gap-4 py-6">
                  <li className="flex items-start gap-4">
                    <LockIcon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-bold">Trustworthy Content</h3>
                      <p className="text-muted-foreground">
                        Credify&apos;s verification process ensures your video content is authentic and can be trusted.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <LockIcon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-bold">Secure Platform</h3>
                      <p className="text-muted-foreground">
                        Your video data is kept safe and secure on the Credify platform.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <AnchorIcon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="text-lg font-bold">Authentic Verification</h3>
                      <p className="text-muted-foreground">
                        Credify&apos;s advanced techniques ensure your video content is 100% authentic.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="/placeholder.svg"
                  width="550"
                  height="310"
                  alt="Benefits"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Ensure Authenticity?</h2>
              <p className="text-muted-foreground md:text-xl">
                Get in touch with our team to learn more about Credify and how it can benefit your business.
              </p>
              <Link
                href="#"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                prefetch={false}
              >
                Request a Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
    </Layout>
  )
}

export default Home