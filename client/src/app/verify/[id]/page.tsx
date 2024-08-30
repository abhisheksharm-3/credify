"use client"
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, AlertCircle, Clock, PlayCircle, ShieldCheck, ShieldAlert, ChevronRight, FileVideo, FileImage } from "lucide-react";
import LoggedInLayout from "@/components/Layout/LoggedInLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomPlayer from "@/components/Utils/CustomPlayer";
import { getUserById } from "@/lib/server/appwrite";

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
  children: User[];
}

export default function VerifyContent() {
  const params = useParams();
  const id = params?.id as string;
  const [verificationData, setVerificationData] = useState<VerificationResult | null>(null);
  const [uploaderHierarchy, setUploaderHierarchy] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"image" | "video" | null>(null);
  const [shareableLink, setShareableLink] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("No content ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/content/get-lineage/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setVerificationData(data.verificationResult);
        
        // Fetch usernames for the uploader hierarchy
        const updatedHierarchy = await fetchUsernames(data.uploaderHierarchy);
        setUploaderHierarchy(updatedHierarchy);

        // Generate shareable link
        setShareableLink(`${window.location.origin}/verify/${id}`);

        // Determine content type
        const contentResponse = await fetch(`https://utfs.io/f/${id}`, { method: 'HEAD' });
        const contentTypeHeader = contentResponse.headers.get('Content-Type
          
        
        );
        if (contentTypeHeader?.startsWith('image')) {
          setContentType('image');
        } else if (contentTypeHeader?.startsWith('video')) {
          setContentType('video');
        } else {
          setContentType(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchUsernames = async (hierarchy: User): Promise<User> => {
    const result = await getUserById(hierarchy.userId);
    const updatedUser: User = {
      userId: hierarchy.userId,
      name: result.success ? result.user?.name ?? 'Unknown User' : 'Unknown User',
      children: [],
    };

    for (const child of hierarchy.children) {
      updatedUser.children.push(await fetchUsernames(child));
    }

    return updatedUser;
  };

  const renderUserHierarchy = (user: User) => (
    <div className="ml-4">
      <p>{user.name} ({user.userId})</p>
      {user.children.length > 1 && user.children.map((child, index) => (
        <div key={index} className="ml-4 mt-2">
          <ChevronRight className="inline w-4 h-4 mr-2" />
          {renderUserHierarchy(child)}
        </div>
      ))}
    </div>
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink)
      .then(() => alert("Link copied to clipboard!"))
      .catch((err) => console.error('Failed to copy: ', err));
  };

  if (isLoading) {
    return (
      <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start">
        <div className="container mx-auto p-6">
          <Skeleton className="w-[250px] h-[40px] mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full" />
            <div className="space-y-6">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </div>
      </LoggedInLayout>
    );
  }

  if (error) {
    return (
      <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start">
        <div className="container mx-auto p-6">
          <Card className="p-6">
            <CardTitle className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              Error: {error}
            </CardTitle>
          </Card>
        </div>
      </LoggedInLayout>
    );
  }

  if (!verificationData) {
    return (
      <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start">
        <div className="container mx-auto p-6">
          <Card className="p-6">
            <CardTitle className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              No verification data found for this content.
            </CardTitle>
          </Card>
        </div>
      </LoggedInLayout>
    );
  }

  return (
    <LoggedInLayout className="min-h-screen flex flex-col items-center justify-start">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Content Verification Details</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Content preview */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {contentType === 'video' ? <FileVideo className="w-6 h-6" /> : <FileImage className="w-6 h-6" />}
                Content ID: {id}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {contentType === 'image' && (
                  <img src={`https://utfs.io/f/${id}`} alt="Content" className="max-w-full max-h-full object-contain" />
                )}
                {contentType === 'video' && (
                  <CustomPlayer url={`https://utfs.io/f/${id}`} />
                )}
                {!contentType && (
                  <div className="text-muted-foreground">
                    <PlayCircle className="w-16 h-16" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right side - Verification details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Verification Status: Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary">
                    <div className="flex items-center gap-2 p-3 mt-4 rounded-md bg-muted">
                      {verificationData.is_tampered ? (
                        <>
                          <ShieldAlert className="w-6 h-6 text-red-500" />
                          <span className="font-semibold">Video Authenticity Compromised</span>
                          <Badge variant="destructive">TAMPERED</Badge>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-6 h-6 text-green-500" />
                          <span className="font-semibold">Certified Original Video</span>
                          <Badge variant="default">VERIFIED</Badge>
                        </>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Share Verification</h3>
                      <div className="flex gap-2">
                        <Input value={shareableLink} readOnly />
                        <Button onClick={handleCopyLink}>Copy Link</Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="details">
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
                    </Accordion>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uploader Hierarchy</CardTitle>
              </CardHeader>
              <CardContent>
                {uploaderHierarchy ? (
                  renderUserHierarchy(uploaderHierarchy)
                ) : (
                  <p>No one else has uploaded this content.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LoggedInLayout>
  );
}