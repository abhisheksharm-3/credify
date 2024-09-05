"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, ShieldCheck, ShieldAlert, ChevronRight, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadDropzone } from '@/lib/uploadthing';
import Layout from '@/components/Layout/Layout';

interface VerificationResult {
  verified: boolean;
  status: string;
  message: string;
  uploader?: string;
  timestamp?: string;
  isTampered: boolean;
}

interface User {
  userId: string;
  name: string;
  uploadTimestamp: number;
  children: User[];
}

export default function ContentVerificationPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [uploaderHierarchy, setUploaderHierarchy] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = async (res: { key: string; url: string; name: string }[]) => {
    if (res && res.length > 0) {
      setIsAnalyzing(true);
      setError(null);
      try {
        const contentId = res[0].key;
        const response = await fetch(`/api/content/analyze/${contentId}`, {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        
        // Update the verification result based on the API response
        const result: VerificationResult = {
          verified: data.status === 'found',
          status: data.status,
          message: data.message,
          uploader: data.verificationResult?.uploader,
          timestamp: data.verificationResult?.timestamp,
          isTampered: data.status === 'not_found' // Assume content is unverified if not found
        };
        
        setVerificationResult(result);
        setVerificationComplete(true);

        if (result.verified) {
          // Fetch lineage data only if the content is verified
          const lineageResponse = await fetch(`/api/content/get-lineage/${contentId}`);
          if (lineageResponse.ok) {
            const lineageData = await lineageResponse.json();
            setUploaderHierarchy(lineageData.uploaderHierarchy);
          }
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setError("Failed to verify content. Please try again later.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const renderUserHierarchy = (user: User) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-2 py-2"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(user.uploadTimestamp).toLocaleString()}
        </p>
      </div>
      {user.children.length > 0 && (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
      {user.children.length > 0 && (
        <div className="ml-4">
          {user.children.map((child, index) => (
            <div key={index}>{renderUserHierarchy(child)}</div>
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <Layout className="min-h-screen flex justify-start flex-col">
      <div className="container max-w-3xl mx-auto p-6">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Content Verification
        </motion.h1>

        {!verificationComplete && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <UploadDropzone
                endpoint="analyzeContent"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={(error: Error) => {
                  console.error("Upload error:", error);
                  setError("Failed to upload content. Please try again.");
                }}
                appearance={{
                  button: "ut-ready:bg-blue-600 ut-ready:hover:bg-blue-700 ut-ready:focus:ring-2 ut-ready:focus:ring-blue-500 ut-ready:focus:ring-offset-2 ut-ready:text-white ut-ready:font-semibold ut-ready:py-2 ut-ready:px-4 ut-ready:rounded-lg ut-ready:shadow-sm ut-ready:transition-all duration-200 cursor-pointer",
                }}
                className="border-[1px] transition-all border-gray-300 dark:border-gray-600 duration-500 hover:border-blue-500 dark:hover:border-blue-400"
              />
            </CardContent>
          </Card>
        )}

        {isAnalyzing && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Clock className="w-6 h-6 animate-spin text-primary" />
                <div>
                  <h3 className="font-semibold">Verifying Content</h3>
                  <p className="text-sm text-muted-foreground">Please wait while we verify your content.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <AlertCircle className="w-6 h-6 text-destructive" />
                <div>
                  <h3 className="font-semibold text-destructive">Error</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <AnimatePresence>
          {verificationComplete && verificationResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="backdrop-blur-sm bg-background/30 shadow-xl border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Verification Status</span>
                    <Badge
                      variant={verificationResult.isTampered ? "destructive" : "secondary"}
                      className="animate-pulse text-lg py-1 px-3"
                    >
                      {verificationResult.isTampered ? "UNVERIFIED" : "VERIFIED"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <motion.div
                      className={`flex items-center gap-4 p-6 rounded-lg ${
                        verificationResult.isTampered ? 'bg-destructive/20' : 'bg-secondary/20'
                      }`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {verificationResult.isTampered ? (
                        <>
                          <ShieldAlert className="w-12 h-12 text-destructive" />
                          <div>
                            <h3 className="font-semibold text-xl mb-1">Content Not Verified</h3>
                            <p className="text-sm text-muted-foreground">This content has not been uploaded by any verified creator.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-12 h-12 text-green-500" />
                          <div>
                            <h3 className="font-semibold text-xl mb-1">Certified Original Content</h3>
                            <p className="text-sm text-muted-foreground">This content has been verified as authentic and unaltered.</p>
                          </div>
                        </>
                      )}
                    </motion.div>

                    {verificationResult.verified && (
                      <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="details" className="text-lg py-2">Verification Details</TabsTrigger>
                          <TabsTrigger value="hierarchy" className="text-lg py-2">Uploader Hierarchy</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details">
                          <ScrollArea className="h-[200px] rounded-md border p-4 bg-background/50">
                            <ul className="space-y-3">
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                <span className="font-medium">Status:</span>
                                <span className="text-sm text-muted-foreground">{verificationResult.status}</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                <span className="font-medium">Uploader:</span>
                                <span className="text-sm text-muted-foreground">{verificationResult.uploader}</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                <span className="font-medium">Timestamp:</span>
                                <span className="text-sm text-muted-foreground">{verificationResult.timestamp}</span>
                              </li>
                            </ul>
                          </ScrollArea>
                        </TabsContent>
                        <TabsContent value="hierarchy">
                          <ScrollArea className="h-[200px] rounded-md border p-4 bg-background/50">
                            {uploaderHierarchy ? (
                              renderUserHierarchy(uploaderHierarchy)
                            ) : (
                              <p>No uploader hierarchy available.</p>
                            )}
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    )}

                    <div className="text-center">
                      <Button onClick={() => {setVerificationComplete(false); setVerificationResult(null);}} variant="outline" className="gap-2">
                        <Upload className="w-4 h-4" />
                        Verify Another Content
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}