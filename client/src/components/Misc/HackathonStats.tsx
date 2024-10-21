import React from 'react';
import { BookOpenIcon, LightbulbIcon, UsersIcon, TargetIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import Marquee from "@/components/ui/marquee";
import NumberTicker from "@/components/ui/number-ticker";
import { BackgroundBeams } from '../ui/background-beams';
import FlickeringGrid from '../ui/flickering-grid';
import Ripple from '../ui/ripple';

const FILES = [
    { name: "registrations.csv", body: "38,000+ students registered" },
    { name: "ideas.json", body: "800+ innovative ideas across 16 different categories." },
    { name: "teams.yaml", body: "3,300+ teams formed." },
    { name: "challenges.md", body: "16 industry-sponsored problem statements identified." },
];

const FEATURES = [
    {
        Icon: BookOpenIcon,
        name: "Student Registrations",
        description: "38,000+ students registered",
        href: "#",
        cta: "View Demographics",
        className: "col-span-3 lg:col-span-1",
        background: (
            <Marquee
                pauseOnHover
                className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]"
            >
                {FILES.map((file, idx) => (
                    <figure
                        key={idx}
                        className={cn(
                            "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
                            "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                            "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                            "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
                        )}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <figcaption className="text-sm font-medium dark:text-white">
                                {file.name}
                            </figcaption>
                        </div>
                        <blockquote className="mt-2 text-xs">{file.body}</blockquote>
                    </figure>
                ))}
            </Marquee>
        ),
    },
    {
        Icon: LightbulbIcon,
        name: "Innovative Ideas",
        description: "800+ ideas across 16 categories",
        href: "#",
        cta: "Explore Ideas",
        className: "col-span-3 lg:col-span-2",
        background: (
            <div className="absolute inset-0 flex items-center justify-center">
                <BackgroundBeams className="absolute inset-0 opacity-50" />
                <div className="relative z-10 flex items-center justify-center">
                    <p className="text-6xl font-bold text-primary items-center flex">
                        <NumberTicker value={800} /> <span className="text-4xl">+</span>
                    </p>
                </div>
            </div>
        ),
    },
    {
        Icon: UsersIcon,
        name: "Collaborative Teams",
        description: "3,300+ teams formed.",
        href: "#",
        cta: "Team Breakdown",
        className: "col-span-3 lg:col-span-2",
        background: (
            <div className="absolute inset-0 flex items-center justify-center">
                <FlickeringGrid
                    className="z-0 absolute inset-0 size-full"
                    squareSize={4}
                    gridGap={6}
                    color="#6B7280"
                    maxOpacity={0.5}
                    flickerChance={0.1}
                />
                <div className="relative z-10 flex items-center justify-center">
                    <p className="text-6xl font-bold text-primary items-center flex">
                        <NumberTicker value={3300} /> <span className="text-4xl">+</span>
                    </p>
                </div>
            </div>
        ),
    },
    {
        Icon: TargetIcon,
        name: "Problem Statements",
        description: "16 industry-sponsored challenges",
        className: "col-span-3 lg:col-span-1",
        href: "#",
        cta: "View Challenges",
        background: (
            <div className="absolute inset-0 flex items-center justify-center">
                <Ripple />
                <div className="relative z-10 flex items-center justify-center">
                    <p className="text-6xl font-bold text-primary items-center flex">
                        <NumberTicker value={16} />
                    </p>
                </div>
            </div>
        ),
    },
];

export function HackathonStats() {
    return (
        <BentoGrid>
            {FEATURES.map((feature, idx) => (
                <BentoCard key={idx} {...feature} />
            ))}
        </BentoGrid>
    );
}