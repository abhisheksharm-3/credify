"use client"
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ShieldCheck, ShieldAlert, ChevronRight, Copy, Eye } from "lucide-react";
import LoggedInLayout from "@/components/Layout/LoggedInLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDocumentsByHash, getUserById } from "@/lib/server/appwrite";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, VerificationResultType } from "@/lib/types";
import { formatDate } from "@/lib/frontend-function";
import { ImageIcon, VideoIcon, CalendarIcon } from "lucide-react";
import renderUserHierarchy from "@/components/PublicComponents/UserHierarchy";
import GeminiAnalysisTab from "@/components/PublicComponents/GeminiAnalysisTab";
import VerificationTabVerify from "@/components/PublicComponents/VerificationTabVerify";
import Footer from "@/components/Layout/Footer";

const VerifyContent: React.FC = () => {
  const params = useParams();
  const contentHash = params?.id as string;
  const [verificationData, setVerificationData] = useState<VerificationResultType | null>(null);
  const [uploaderHierarchy, setUploaderHierarchy] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [isTampered, setIsTampered] = useState<string>("fetching");
  const [factCheck, setFactCheck] = useState<string>("");

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
        // Step 1: Check Appwrite first
        const appwriteResult = await getDocumentsByHash(contentHash);

        if (appwriteResult?.documents && appwriteResult.documents.length > 0) {
          setIsTampered(appwriteResult.documents[0].isManipulated);
          setFactCheck(appwriteResult.documents[0].fact_check);
          console.log(appwriteResult.documents[0].fact_check);


        } else {
          console.log("No documents found or appwriteResult is undefined.");
        }


        if (!appwriteResult.success || !appwriteResult.documents || appwriteResult.documents.length === 0) {
          setError("No verified records found for this content");
          setIsLoading(false);
          return;
        }

        const appwriteDoc = appwriteResult.documents[0];

        // Step 2: Only if Appwrite succeeds, fetch lineage
        console.log("Fetching lineage data");
        const response = await fetch(`/api/content/get-lineage/${contentHash}`);
        if (!response.ok) {
          throw new Error('Failed to fetch lineage data');
        }

        const lineageData = await response.json();

        // Combine data
        const combinedVerificationData: VerificationResultType = {
          ...lineageData.verificationResult,
          verificationDate: appwriteDoc.verificationDate,
          userId: appwriteDoc.userId,
        };

        setVerificationData(combinedVerificationData);

        // Step 3: Process hierarchy if available
        if (lineageData.uploaderHierarchy) {
          const updatedHierarchy = await fetchUsernames(lineageData.uploaderHierarchy);
          setUploaderHierarchy(updatedHierarchy);
        }

        setShareableLink(`${window.location.origin}/verify/${contentHash}`);

      } catch (error) {
        console.error("Error in verification process:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unexpected error occurred during verification");
        }
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
      dateOfUpload: hierarchy.dateOfUpload,
      children: [],
    };
    for (const child of hierarchy.children) {
      updatedUser.children.push(await fetchUsernames(child));
    }
    return updatedUser;
  };

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
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
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
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
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
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
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
                    className={`animate-pulse text-lg py-1 px-3 ${isTampered
                      ? 'bg-destructive text-white'
                      : 'bg-green-500 text-white'
                    }`}
                  >
                    {isTampered ? "TAMPERED" : "VERIFIED"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <motion.div
                    className={`flex items-center gap-4 p-6 rounded-lg ${isTampered ? 'bg-destructive/20' : 'bg-green-500/10'}`}
                    initial={{ x: -20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ duration: 0.3 }}
                  >
                    {isTampered ? (
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
                  <Tabs defaultValue="Details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 rounded-lg bg-background p-1 my-2">
                      {['Details', 'Hierarchy', 'Gemini Insights'].map((tab) => (
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
                    <TabsContent value="Details">
                      <ScrollArea className="h-[250px] rounded-md border p-4 bg-background/50">
                        <VerificationTabVerify result={verificationData} />
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="Hierarchy">
                      <ScrollArea className="h-[250px] rounded-md border p-4 bg-background/50">
                        {uploaderHierarchy ? (
                          renderUserHierarchy({
                            user: uploaderHierarchy,
                            copyrightUserId: "hello"
                          })
                        ) : (
                          <p>No uploader hierarchy available.</p>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="Gemini Insights">
                      <ScrollArea className="h-[250px] rounded-md border p-4 bg-background/50">
                        {factCheck && (
                          <GeminiAnalysisTab geminiAnalysis={factCheck} />
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
      <Footer />
    </LoggedInLayout>
  );
};

export default VerifyContent;