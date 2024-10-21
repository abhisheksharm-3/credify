import React, { useState, useEffect, useCallback } from 'react';
import { Award, Code, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface HeroWinningProps {
  imagePaths: string[];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <Card className="bg-background/50 backdrop-blur-sm hover:bg-background/60 transition-all duration-300">
    <CardContent className="flex flex-col items-center p-4 text-center h-full">
      <div className="bg-primary p-2 rounded-full mb-4">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const HeroWinning: React.FC<HeroWinningProps> = ({ imagePaths }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
  }, [imagePaths.length]);

  useEffect(() => {
    const intervalId = setInterval(nextSlide, 5000);
    return () => clearInterval(intervalId);
  }, [nextSlide]);

  const features = [
    { icon: Award, title: "1st Place", description: "Triumphed over 100+ competing teams" },
    { icon: Code, title: "Innovative Tech", description: "Pioneering solution in media authenticity" },
    { icon: Users, title: "Network 18", description: "Solved problem statement for media giant" },
    { icon: Zap, title: "Rapid Development", description: "Conceptualized and built within 2 months" },
  ];

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0">
        {imagePaths.map((src, index) => (
          <Image
          key={src}
          src={src}
          alt={`Hero image ${index + 1}`}
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          quality={100}
          className={`transition-opacity duration-500 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/60" />
      <div className="relative z-10 flex items-center min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <Badge className="text-sm font-semibold" variant="secondary">
              Google&apos;s GenAI Exchange Hackathon Winner
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Safeguarding Digital Truth
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Our revolutionary AI-powered solution for Network 18&apos;s problem statement not only won first place but is set to transform the landscape of media integrity and authenticity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/">Discover Our Innovation</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="https://devfolio.co/google-genaiexchange/challenges#network18" target="_blank" rel="noopener noreferrer">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item, index) => (
              <FeatureCard key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroWinning;