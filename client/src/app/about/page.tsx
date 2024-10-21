"use client"
import React from 'react';
import Layout from '@/components/Layout/Layout';
import { HackathonStats } from '@/components/Misc/HackathonStats';
import HeroWinning from '@/components/Misc/HeroWinning';
import HyperText from '@/components/ui/hyper-text';
import { Features } from '@/components/Marketing/Features';
import GitHubShowcase from '@/components/Misc/GitHubShowcase';

const IMAGE_PATHS = [
  '/winning/1.jpg',
  '/winning/2.jpg',
  '/winning/3.jpg',
  '/winning/4.jpg',
  '/winning/5.jpg',
  '/winning/6.jpg',
  '/winning/7.jpg',
  '/winning/8.jpg',
  '/winning/9.jpg',
  '/winning/10.jpg',
  '/winning/11.jpg',
  '/winning/12.jpg',
  '/winning/13.jpg',
  '/winning/14.jpg',
  '/winning/15.jpg',
  '/winning/16.jpg',
  '/winning/17.jpg',
  '/winning/18.jpg',
  '/winning/19.jpg',
];

const About = () => {
  return (
    <Layout>
      <HeroWinning imagePaths={IMAGE_PATHS} />
      <main className="container mx-auto mt-12 py-5">
        <div className="flex flex-col items-center justify-center gap-5">
          <HyperText
            text="About Google's"
            className="text-4xl font-bold text-center text-wrap"
            duration={5}
          />
          <HyperText
            text="GenAI Exchange"
            className="text-4xl font-bold text-center text-wrap"
            duration={5}
          />
          <HyperText
            text="Hackathon"
            className="text-4xl font-bold text-center text-wrap"
            duration={5}
          />
          <HackathonStats />
          <Features />
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            Our Hackathon Project
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-lg text-center">
            Discover the code behind our award-winning Google GenAI Exchange Hackathon project. See how we&apos;re innovating in AI-powered content verification.
          </p>
          <GitHubShowcase repoUrl="https://github.com/abhisheksharm-3/credify" />
        </div>
      </main>
    </Layout>
  );
};

export default About;