"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShieldAlert, ShieldCheck, CheckCircle, Upload } from "lucide-react"
import {VerificationResultSectionProps } from '@/lib/types'
import ForgeryAnalysisTab from './ForgeryAnalysisTab'
import { formatDate } from '@/lib/frontend-function'
import { Skeleton } from "@/components/ui/skeleton"
import renderUserHierarchy from './UserHierarchy'

const VerificationResultSection: React.FC<VerificationResultSectionProps> = ({
  verificationResult,
  uploaderHierarchy,
  onResetVerification,
  forgeryResult
}) => {

  const renderHierarchySkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
  const isVerifiedAndNotForged = verificationResult.verified && forgeryResult && !forgeryResult.isManipulated
  const StatusBadge = () => {
    let badgeText = "";

    if (verificationResult.verified && forgeryResult && !forgeryResult.isManipulated) {
      badgeText = "VERIFIED";
    } else if (verificationResult.verified && forgeryResult?.isManipulated) {
      badgeText = "TAMPERED";
    } else {
      badgeText = "NOT VERIFIED";
    }

    return (
      <Badge
        variant={badgeText === "VERIFIED" ? "secondary" : "destructive"}
        className="animate-pulse text-sm md:text-base py-1 px-2 md:px-3"
      >
        {badgeText}
      </Badge>
    );
  };


  const StatusIcon = () => (
    isVerifiedAndNotForged
      ? <ShieldCheck className="w-8 h-8 md:w-12 md:h-12 text-green-500" />
      : <ShieldAlert className="w-8 h-8 md:w-12 md:h-12 text-destructive" />
  )
  const StatusMessage = () => {
    let title = "";
    let message = "";

    if (verificationResult.verified && forgeryResult && !forgeryResult.isManipulated) {
      title = "Certified Original Content";
      message = "This content has been verified as authentic and unaltered.";
    } else if (verificationResult.verified && forgeryResult?.isManipulated) {
      title = "Tampering Detected";
      message = "This content has been verified, but potential tampering was detected.";
    } else {
      title = "Content Not Verified";
      message = "This content has not been uploaded by any verified creator.";
    }

    return (
      <div className="text-center md:text-left mb-8">
        <h3 className="font-semibold text-base md:text-lg lg:text-xl mb-1">
          {title}
        </h3>
        <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
          {message}
        </p>
      </div>
    );
  };


  const renderDetailsContent = () => {
    if (!verificationResult.status && !uploaderHierarchy?.name && !uploaderHierarchy?.dateOfUpload) {
      return <p className="text-sm md:text-base">Incomplete data.<br></br> All fields are required to display details.</p>
    }

    return (
      <ul className="space-y-2 md:space-y-3 lg:space-y-4">
        <li className="flex dark:bg-primary/10 items-start gap-2 md:p-2 p-0.5">
          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-1" />
          <div className="flex-grow">
            <span className="font-medium text-xs md:text-sm lg:text-base">Status:</span>
            {verificationResult.status ? (
              <span className="text-xs md:text-sm lg:text-base text-muted-foreground block capitalize">
                {verificationResult.status}
              </span>
            ) : (
              <Skeleton className="h-4 w-3/4 mt-1" />
            )}
          </div>
        </li>
        <li className="flex dark:bg-primary/10 items-start gap-2 md:p-2 p-0.5">
          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-1" />
          <div className="flex-grow">
            <span className="font-medium text-xs md:text-sm lg:text-base">Uploader:</span>
            {uploaderHierarchy?.name ? (
              <span className="text-xs md:text-sm lg:text-base text-muted-foreground block">
                {uploaderHierarchy.name}
              </span>
            ) : (
              <Skeleton className="h-4 w-1/2 mt-1" />
            )}
          </div>
        </li>
        <li className="flex dark:bg-primary/10 items-start gap-2 md:p-2 p-0.5">
          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-1" />
          <div className="flex-grow">
            <span className="font-medium text-xs md:text-sm lg:text-base">Date:</span>
            {uploaderHierarchy?.dateOfUpload ? (
              <span className="text-xs md:text-sm lg:text-base text-muted-foreground block">
                {formatDate(new Date(uploaderHierarchy.dateOfUpload).toLocaleString())}
              </span>
            ) : (
              <Skeleton className="h-4 w-2/3 mt-1" />
            )}
          </div>
        </li>
      </ul>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[95%] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-2 sm:px-4 lg:px-6"
    >
      <Card className="backdrop-blur-sm bg-background/30 shadow-xl border-primary/20">
        <CardHeader className="justify-between items-center flex flex-row ">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl text-center md:text-left mt-[3px]">Verification Status</CardTitle>
          <StatusBadge />
        </CardHeader>
        <CardContent className="">
          <motion.div
            className={`flex flex-col md:flex-row items-center gap-3 md:gap-4 p-3 md:p-4 lg:p-6 mb-6 rounded-lg ${isVerifiedAndNotForged ? 'bg-green-500/30' : 'bg-destructive/30'}`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <StatusIcon />
            <StatusMessage />
          </motion.div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-lg bg-background p-1 my-2">
              {['details', 'hierarchy', 'forgery'].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-md px-3 py-2 text-sm font-medium transition-all
                       data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                       data-[state=active]:shadow-sm"
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="details">
              <ScrollArea className="h-[180px] sm:h-[220px] lg:h-[260px] xl:h-[300px] rounded-md border p-3 md:p-4 bg-background/50">
                {renderDetailsContent()}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="hierarchy">
              <ScrollArea className="h-[180px] sm:h-[220px] lg:h-[260px] xl:h-[300px] rounded-md border p-3 md:p-4 bg-background/50 flex flex-col">
                {uploaderHierarchy ? renderUserHierarchy(uploaderHierarchy) : renderHierarchySkeleton()}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="forgery">
              <ScrollArea className="h-[180px] sm:h-[220px] lg:h-[260px] xl:h-[300px] rounded-md border p-3 md:p-4 bg-background/50">
                <ForgeryAnalysisTab forgeryResult={forgeryResult} />
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-4">
            <Button onClick={onResetVerification} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default VerificationResultSection