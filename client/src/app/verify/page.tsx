"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CheckCircle, AlertCircle, Clock, PlayCircle, ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react"
import Layout from "@/components/Layout/Layout"

// Mock data for demonstration
const verificationData = {
  status: "in-progress", // Can be "pending", "in-progress", or "complete"
  title: "Product Showcase Video",
  duration: "2:35",
  submissionDate: "2023-05-15",
  progress: 65,
  detectedIssues: [
    { type: "tampering", description: "Potential frame manipulation detected at 1:45", severity: "high" },
    { type: "deepfake", description: "Possible voice synthesis in audio track", severity: "medium" },
    { type: "metadata", description: "Inconsistent creation date in metadata", severity: "low" },
  ],
  isOriginal: false,
  verificationSteps: [
    { name: "Initial scan", status: "complete" },
    { name: "Metadata analysis", status: "complete" },
    { name: "Visual tampering detection", status: "in-progress" },
    { name: "Audio analysis", status: "pending" },
    { name: "Final verification", status: "pending" },
  ],
}

export default function VerifyContent() {
  const [isVerifying, setIsVerifying] = useState(verificationData.status === "in-progress")

  const getStatusIcon = () => {
    switch (verificationData.status) {
      case "pending":
        return <Clock className="w-6 h-6 text-muted-foreground" />
      case "in-progress":
        return <AlertCircle className="w-6 h-6 text-blue-500" />
      case "complete":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      default:
        return null
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-blue-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
<Layout>    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Video Verification Details</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Video preview */}
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <PlayCircle className="w-16 h-16 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{verificationData.title}</h2>
              <p className="text-muted-foreground">Duration: {verificationData.duration}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Verification details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                Verification Status: {verificationData.status.charAt(0).toUpperCase() + verificationData.status.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Submission Date: {verificationData.submissionDate}</p>
              
              {isVerifying && (
                <div className="mb-4">
                  <p className="mb-2">Verification Progress</p>
                  <Progress value={verificationData.progress} className="w-full" />
                </div>
              )}

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="verification-steps">
                  <AccordionTrigger>Verification Steps</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {verificationData.verificationSteps.map((step, index) => (
                        <li key={index} className="flex items-center gap-2">
                          {step.status === "complete" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : step.status === "in-progress" ? (
                            <Clock className="w-4 h-4 text-blue-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className={step.status === "complete" ? "line-through" : ""}>{step.name}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {verificationData.status === "complete" && (
                <>
                  <Accordion type="single" collapsible className="w-full mt-4">
                    <AccordionItem value="detection-results">
                      <AccordionTrigger>Detection Results</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {verificationData.detectedIssues.map((issue, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <ShieldAlert className={`w-5 h-5 mt-1 ${getSeverityColor(issue.severity)}`} />
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {issue.type}
                                </Badge>
                                <p className="text-sm">{issue.description}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <div className="flex items-center gap-2 p-3 mt-4 rounded-md bg-muted">
                    {verificationData.isOriginal ? (
                      <>
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                        <span className="font-semibold">Certified Original Video</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                        <span className="font-semibold">Video Authenticity Compromised</span>
                      </>
                    )}
                  </div>
                </>
              )}

              {!isVerifying && (
                <Button className="w-full mt-4" onClick={() => setIsVerifying(true)}>
                  Start Verification
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div></Layout>
  )
}