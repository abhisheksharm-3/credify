import React, { ReactElement } from 'react';
import Link from 'next/link';
import { RiTwitterXLine, RiGithubLine, RiLinkedinBoxLine, RiVideoLine, RiShieldCheckLine, RiQuestionLine, RiCodeSSlashLine, RiInformationLine } from "@remixicon/react";
import { NavigationItem } from '@/lib/frontend-types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from 'next/image';

const navigation: {
  main: NavigationItem[]
  social: NavigationItem[]
  developers: NavigationItem[]
} = {
  main: [
    { name: 'Analyze Video', href: '/public/analyze', icon: <RiVideoLine /> },
    { name: 'Our Technology', href: '/', icon: <RiShieldCheckLine /> },
    { name: "About", href: "/about",  icon: <RiInformationLine />},
    { name: 'Support', href: 'https://github.com/abhisheksharm-3/credify', icon: <RiQuestionLine /> },
  ],
  social: [
    {
      name: 'Twitter',
      href: 'https://twitter.com/',
      icon: <RiTwitterXLine aria-hidden="true" />,
    },
    {
      name: 'GitHub',
      href: 'https://github.com/',
      icon: <RiGithubLine aria-hidden="true" />,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/in',
      icon: <RiLinkedinBoxLine aria-hidden="true" />,
    },
  ],
  developers: [
    { name: 'Abhishek Sharma', href: 'https://www.abhisheksharma.tech/' },
    { name: 'Arnav Arora', href: 'https://github.com/arnav-03' },
    { name: 'Garvit Nag', href: 'https://github.com/Garvit-Nag' },
  ],
}

const Footer: React.FC = () => {
  const renderIcon = (icon: React.ReactNode, className: string) => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as ReactElement, { className });
    }
    return null;
  };

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center text-2xl font-bold mb-4">
            <Image src="/images/logo.png" alt="Credify Logo" width={170} height={20} />
            </Link>
            <p className="mb-4">
              Empowering truth in the digital age: Detecting tampered videos and tracing them back to their origins.
            </p>
            <div className="flex space-x-4 mt-4">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  {renderIcon(item.icon, "w-6 h-6")}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-3">
              {navigation.main.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="hover:text-primary transition-colors duration-200 flex items-center"
                >
                  {renderIcon(item.icon, "w-5 h-5 mr-2")}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Amazing Developers</h3>
            <nav className="flex flex-col space-y-3">
              {navigation.developers.map((dev) => (
                <a
                  key={dev.name}
                  href={dev.href}
                  className="hover:text-primary transition-colors duration-200 flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <RiCodeSSlashLine className="w-5 h-5 mr-2" />
                  <span>{dev.name}</span>
                </a>
              ))}
            </nav>
            <p className="text-sm mt-4 italic">Crafted with ❤️ and dedication!</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="mb-4">Subscribe to our newsletter for the latest updates and features.</p>
            <form className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
              />
              <Button type="submit">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t">
          <p className="text-center text-sm">
            &copy; {new Date().getFullYear()} Credify. All rights reserved. | 
            <Link href="/privacy-policy" className="ml-1 hover:underline">Privacy Policy</Link> | 
            <Link href="/terms-of-service" className="ml-1 hover:underline">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer