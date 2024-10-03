import React from 'react'
import { RiTwitterXLine, RiGithubLine, RiLinkedinBoxLine, RiVideoLine, RiSearchEyeLine, RiShieldCheckLine, RiQuestionLine, RiCodeSSlashLine } from "@remixicon/react";
import { NavigationItem } from '@/lib/frontend-types';

const navigation: {
  main: NavigationItem[]
  social: NavigationItem[]
  developers: NavigationItem[]
} = {
  main: [
    { name: 'Analyze Video', href: '/public/analyze', icon: <RiVideoLine /> },
    { name: 'Source Tracing', href: '/public/analyze', icon: <RiSearchEyeLine /> },
    { name: 'Our Technology', href: '/', icon: <RiShieldCheckLine /> },
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
    { name: 'Abhishek Sharma', href: 'https://abhisheksharma.tech' },
    { name: 'Arnav Arora', href: 'https://github.com/arnav-03' },
    { name: 'Garvit Nag', href: 'https://github.com/Garvit-Nag' },
  ],
}

const Footer: React.FC = () => {
  return (
    <footer className="w-full">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <RiShieldCheckLine className="mr-2 text-ruby-500" />
              Credify
            </h2>
            <p className="text-sm mb-4">
              Detecting tampered videos and tracing them back to the original poster.
            </p>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2">Quick Links</h3>
            <nav className="flex flex-col space-y-1">
              {navigation.main.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm hover:text-ruby-600 transition-colors duration-200 flex items-center"
                >
                  {item.icon}
                  <span className="ml-1">{item.name}</span>
                </a>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2">Our Amazing Developers</h3>
            <nav className="flex flex-col space-y-1">
              {navigation.developers.map((dev) => (
                <a
                  key={dev.name}
                  href={dev.href}
                  className="text-sm hover:text-ruby-600 transition-colors duration-200 flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <RiCodeSSlashLine className="mr-1 text-ruby-500" />
                  <span>{dev.name}</span>
                </a>
              ))}
            </nav>
            <p className="text-xs mt-2 text-gray-600">Crafted with love and dedication!</p>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-2">Connect With Us</h3>
            <div className="flex space-x-3">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-ruby-600 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Credify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer