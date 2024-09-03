"use client"

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, AlertCircle, Clock, ShieldCheck, ShieldAlert, ChevronRight, Link as LinkIcon } from "lucide-react";
import LoggedInLayout from "@/components/Layout/LoggedInLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUserById } from "@/lib/server/appwrite";
import { toast } from "sonner";

interface VerificationResult {
  video_hash: string;
  collective_audio_hash: string;
  image_hash: string;
  audio_hash: string;
  frame_hash: string;
  is_tampered: boolean;
}

interface User {
  userId: string;
  name: string;
  uploadTimestamp: number;
  children: User[];
}

const VerifyContent: React.FC = () => {
  const params = useParams();
  const contentHash = params?.id as string;
  const [verificationData, setVerificationData] = useState<VerificationResult | null>(null);
  const [uploaderHierarchy, setUploaderHierarchy] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!contentHash) {
        setError("No content hash provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/content/get-lineage/${contentHash}`);
        console.log(response)
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setVerificationData(data.verificationResult);
        console.log(data);

        const updatedHierarchy = await fetchUsernames(data.uploaderHierarchy);
        setUploaderHierarchy(updatedHierarchy);

        setShareableLink(`${window.location.origin}/verify/${contentHash}`);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [contentHash]);

  const handleCreatorClick = (userId: string) => {
    router.push(`/verify/creator/${userId}`);
  };

  const fetchUsernames = async (hierarchy: User): Promise<User> => {
    const result = await getUserById(hierarchy.userId);
    const updatedUser: User = {
      userId: hierarchy.userId,
      name: result.success ? result.user?.name ?? 'Unknown User' : 'Unknown User',
      uploadTimestamp: hierarchy.uploadTimestamp,
      children: [],
    };

    for (const child of hierarchy.children) {
      updatedUser.children.push(await fetchUsernames(child));
    }

    return updatedUser;
  };

  const renderUserHierarchy = (user: User) => (
    <div className="ml-4">
      <p
        className="cursor-pointer hover:text-primary transition-colors"
        onClick={() => handleCreatorClick(user.userId)}
      >
        {user.name}
      </p>
      {user.children.length > 0 && user.children.map((child, index) => (
        <div key={index} className="ml-4 mt-2">
          <ChevronRight className="inline w-4 h-4 mr-2" />
          {renderUserHierarchy(child)}
        </div>
      ))}
    </div>
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink)
      .then(() => toast.success("Verification link copied to clipboard"))
      .catch((err) => console.error('Failed to copy: ', err));
  };

  if (isLoading) {
    return (
      <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-background to-secondary/20">
        <div className="container max-w-2xl mx-auto p-6">
          <Skeleton className="w-[250px] h-[40px] mb-8" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </LoggedInLayout>
    );
  }

  if (error) {
    return (
      <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-background to-secondary/20">
        <div className="container max-w-2xl mx-auto p-6">
          <Card className="backdrop-blur-sm bg-background/30 shadow-xl border-primary/20">
            <CardContent className="p-6">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-center mb-2">Error</h2>
              <p className="text-center text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </LoggedInLayout>
    );
  }

  if (!verificationData) {
    return (
      <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-background to-secondary/20">
        <div className="container max-w-2xl mx-auto p-6">
          <Card className="backdrop-blur-sm bg-background/30 shadow-xl border-primary/20">
            <CardContent className="p-6">
              <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-center mb-2">No Data Found</h2>
              <p className="text-center text-muted-foreground">No verification data found for this content.</p>
            </CardContent>
          </Card>
        </div>
      </LoggedInLayout>
    );
  }

  return (
    <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-2xl mx-auto p-6">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Content Verification
        </motion.h1>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-sm bg-background/30 shadow-xl border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Verification Details</span>
                  <Badge variant={verificationData.is_tampered ? "destructive" : "default"} className="animate-pulse">
                    {verificationData.is_tampered ? "TAMPERED" : "VERIFIED"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                    {verificationData.is_tampered ? (
                      <>
                        <ShieldAlert className="w-6 h-6 text-destructive" />
                        <span className="font-semibold">Content Authenticity Compromised</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                        <span className="font-semibold">Certified Original Content</span>
                      </>
                    )}
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="verification-results">
                      <AccordionTrigger>Verification Results</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          <li>Video Hash: {verificationData.video_hash}</li>
                          <li>Collective Audio Hash: {verificationData.collective_audio_hash}</li>
                          <li>Image Hash: {verificationData.image_hash}</li>
                          <li>Audio Hash: {verificationData.audio_hash}</li>
                          <li>Frame Hash: {verificationData.frame_hash}</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="uploader-hierarchy">
                      <AccordionTrigger>Uploader Hierarchy</AccordionTrigger>
                      <AccordionContent>
                        {uploaderHierarchy ? (
                          renderUserHierarchy(uploaderHierarchy)
                        ) : (
                          <p>No uploader hierarchy available.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div>
                    <h3 className="font-semibold mb-2">Share Verification</h3>
                    <div className="flex gap-2">
                      <Input value={shareableLink} readOnly className="bg-muted" />
                      <Button onClick={handleCopyLink} variant="secondary">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </LoggedInLayout>
  );
};

export default VerifyContent;