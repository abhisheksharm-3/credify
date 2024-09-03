"use client"

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Clock, ShieldCheck, ShieldAlert, ChevronRight, Link as LinkIcon, Copy, Eye } from "lucide-react";
import LoggedInLayout from "@/components/Layout/LoggedInLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUserById } from "@/lib/server/appwrite";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink)
      .then(() => toast.success("Verification link copied to clipboard"))
      .catch((err) => console.error('Failed to copy: ', err));
  };
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
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setVerificationData(data.verificationResult);

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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-2 py-2"
    >
      <Avatar className="h-8 w-8 ring-2 ring-primary ring-offset-2 ring-offset-background">
        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p
          className="cursor-pointer hover:text-primary transition-colors font-medium"
          onClick={() => handleCreatorClick(user.userId)}
        >
          {user.name}
        </p>
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

  // ... (keep the existing helper functions)

  if (isLoading) {
    return (
      <LoggedInLayout className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container max-w-3xl mx-auto p-6">
          <Skeleton className="w-[250px] h-[40px] mb-8 mx-auto" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </LoggedInLayout>
    );
  }

  if (error) {
    return (
      <LoggedInLayout className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container max-w-3xl mx-auto p-6">
          <Card className="backdrop-blur-sm bg-background/30 shadow-xl border-primary/20">
            <CardContent className="p-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              </motion.div>
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
      <LoggedInLayout className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container max-w-3xl mx-auto p-6">
          <Card className="backdrop-blur-sm bg-background/30 shadow-xl border-primary/20">
            <CardContent className="p-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-center mb-2">No Data Found</h2>
              <p className="text-center text-muted-foreground">No verification data found for this content.</p>
            </CardContent>
          </Card>
        </div>
      </LoggedInLayout>
    );
  }

  return (
    <LoggedInLayout className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-3xl mx-auto p-6">
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
                  <span>Verification Status</span>
                  <Badge
                    variant={verificationData.is_tampered ? "destructive" : "secondary"}
                    className="animate-pulse text-lg py-1 px-3"
                  >
                    {verificationData.is_tampered ? "TAMPERED" : "VERIFIED"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <motion.div
                    className={`flex items-center gap-4 p-6 rounded-lg ${
                      verificationData.is_tampered ? 'bg-destructive/20' : 'bg-secondary/20'
                    }`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {verificationData.is_tampered ? (
                      <>
                        <ShieldAlert className="w-12 h-12 text-destructive" />
                        <div>
                          <h3 className="font-semibold text-xl mb-1">Content Authenticity Compromised</h3>
                          <p className="text-sm text-muted-foreground">This content may have been altered or tampered with.</p>
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

                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="details" className="text-lg py-2">Verification Details</TabsTrigger>
                      <TabsTrigger value="hierarchy" className="text-lg py-2">Uploader Hierarchy</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                      <ScrollArea className="h-[250px] rounded-md border p-4 bg-background/50">
                        <ul className="space-y-3">
                          {Object.entries(verificationData).map(([key, value]) => (
                            <motion.li
                              key={key}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4 text-primary" />
                              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span className="text-sm text-muted-foreground break-all">{String(value)}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="hierarchy">
                      <ScrollArea className="h-[250px] rounded-md border p-4 bg-background/50">
                        {uploaderHierarchy ? (
                          renderUserHierarchy(uploaderHierarchy)
                        ) : (
                          <p>No uploader hierarchy available.</p>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>

                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Share Verification</h3>
                    <div className="flex gap-2">
                      <Input value={shareableLink} readOnly className="bg-muted flex-grow text-sm" />
                      <Button onClick={handleCopyLink} variant="secondary" className="gap-2">
                        <Copy className="w-4 h-4" />
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