'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldAlert, ShieldCheck, CheckCircle, Upload, ChevronRight } from "lucide-react";
import { VerificationResult, User } from '@/lib/types';

interface VerificationResultSectionProps {
  verificationResult: VerificationResult;
  uploaderHierarchy: User | null;
  onResetVerification: () => void;
}

export default function VerificationResultSection({
  verificationResult,
  uploaderHierarchy,
  onResetVerification
}: VerificationResultSectionProps) {
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

            {!verificationResult.isTampered && (
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
              <Button onClick={onResetVerification} variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Verify Another Content
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}