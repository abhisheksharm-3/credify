"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LineChart, XAxis, YAxis, Line } from "recharts"
import { TooltipProvider, Tooltip } from "@/components/ui/tooltip"

export default function Component() {
  const [data, setData] = useState([
    { name: "Jan", score: 90 },
    { name: "Feb", score: 92 },
    { name: "Mar", score: 94 },
    { name: "Apr", score: 95 },
    { name: "May", score: 96 },
    { name: "Jun", score: 97 },
  ])
  return (
    <div className="w-full bg-background">
      <div className="container mx-auto py-8 md:py-12 lg:py-16">
        <div className="bg-primary rounded-lg p-6 md:p-8 lg:p-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary-foreground rounded-full w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center">
              <img
                src="/placeholder.svg"
                width={80}
                height={80}
                alt="User Avatar"
                className="rounded-full"
                style={{ aspectRatio: "80/80", objectFit: "cover" }}
              />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground">John Doe</h2>
              <div className="flex items-center gap-2 text-sm md:text-base lg:text-lg text-primary-foreground">
                <StarIcon className="w-5 h-5" />
                <span>Trust Score: 4.8</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base lg:text-lg text-primary-foreground mt-2">
                <UsersIcon className="w-5 h-5" />
                <span>Verified Videos: 124</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
              Edit Profile
            </Button>
            <Button
              variant="solid"
              size="sm"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8 md:mt-12 lg:mt-16">
          <Card className="bg-card text-card-foreground">
            <CardContent className="flex items-center gap-4">
              <div className="bg-card-foreground/20 rounded-full p-3">
                <StarIcon className="w-6 h-6 text-card-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Trust Score</h3>
                <p className="text-2xl font-bold">4.8</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card text-card-foreground">
            <CardContent className="flex items-center gap-4">
              <div className="bg-card-foreground/20 rounded-full p-3">
                <VideoIcon className="w-6 h-6 text-card-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Verified Videos</h3>
                <p className="text-2xl font-bold">124</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card text-card-foreground">
            <CardContent className="flex items-center gap-4">
              <div className="bg-card-foreground/20 rounded-full p-3">
                <StarIcon className="w-6 h-6 text-card-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Avg. Trust Rating</h3>
                <p className="text-2xl font-bold">4.6</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card text-card-foreground">
            <CardContent className="flex items-center gap-4">
              <div className="bg-card-foreground/20 rounded-full p-3">
                <ThumbsUpIcon className="w-6 h-6 text-card-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Total Likes</h3>
                <p className="text-2xl font-bold">78,901</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 md:mt-12 lg:mt-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 lg:mb-8">Trust Score Over Time</h2>
          <Card className="bg-card text-card-foreground">
            <CardContent>
              <div>
                <LineChart data={data}>
                  <TooltipProvider>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis type="number" domain={[80, 100]} tickLine={false} axisLine={false} />
                    <Tooltip content={<div />} />
                    <Line type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                  </TooltipProvider>
                </LineChart>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 md:mt-12 lg:mt-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 lg:mb-8">Verified Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Card className="bg-card text-card-foreground">
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-card-foreground/20 rounded-full p-5 shadow-lg">
                    <VideoIcon className="w-10 h-10 text-card-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Video Title 1</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UsersIcon className="w-4 h-4" />
                      <span>1.2K Verified Viewers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ThumbsUpIcon className="w-4 h-4" />
                      <span>4.8K Likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <StarIcon className="w-4 h-4" />
                      <span>Trust Score: 4.8</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card text-card-foreground">
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-card-foreground/20 rounded-full p-3">
                    <VideoIcon className="w-6 h-6 text-card-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Video Title 2</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UsersIcon className="w-4 h-4" />
                      <span>2.4K Verified Viewers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ThumbsUpIcon className="w-4 h-4" />
                      <span>7.2K Likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <StarIcon className="w-4 h-4" />
                      <span>Trust Score: 4.9</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card text-card-foreground">
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-card-foreground/20 rounded-full p-3">
                    <VideoIcon className="w-6 h-6 text-card-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Video Title 3</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UsersIcon className="w-4 h-4" />
                      <span>800 Verified Viewers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ThumbsUpIcon className="w-4 h-4" />
                      <span>2.1K Likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <StarIcon className="w-4 h-4" />
                      <span>Trust Score: 4.2</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card text-card-foreground">
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-card-foreground/20 rounded-full p-3">
                    <VideoIcon className="w-6 h-6 text-card-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Video Title 4</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UsersIcon className="w-4 h-4" />
                      <span>1.5K Verified Viewers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ThumbsUpIcon className="w-4 h-4" />
                      <span>4.2K Likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <StarIcon className="w-4 h-4" />
                      <span>Trust Score: 4.6</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function StarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}


function ThumbsUpIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}


function UsersIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}


function VideoIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </svg>
  )
}