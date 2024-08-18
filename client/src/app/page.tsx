import Layout from '@/components/Layout/Layout'
import { Hero } from '../components/Marketing/Hero'
import { Features } from '../components/Marketing/Features'
import { Process } from '../components/Marketing/Process'
import { Benefits } from '../components/Marketing/Benefits'
import { CallToAction } from '../components/Marketing/CTA'

const Home = () => {
  return (
    <Layout>
      <div className="flex flex-col min-h-[100dvh]">
        <main className="flex-1">
          <Hero />
          <Features />
          <Process />
          <Benefits />
          <CallToAction />
        </main>
      </div>
    </Layout>
  )
}

export default Home