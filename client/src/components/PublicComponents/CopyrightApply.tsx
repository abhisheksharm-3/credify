import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Check } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from '@/hooks/useUser';
import { createCopyrightDocument } from "@/lib/server/appwrite";
import { VerificationResult } from '@/lib/frontend-types';
import { toast } from 'sonner';

interface ExistingContentAlertProps {
    result: VerificationResult;
}

const CopyrightPrompt = ({ result }: ExistingContentAlertProps) => {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [copyrightClaimed, setCopyrightClaimed] = useState(false);


    const handleClaimCopyright = async () => {
        setIsLoading(true);
        const hash = result.image_hash || result.video_hash;
        if (user && hash) {
            try {
                const response = await createCopyrightDocument(user.$id, hash);
                if (response.success) {
                    setCopyrightClaimed(true);
                    toast.success("Copyright claimed successfully");
                } else {
                    toast.error("Error claiming copyright");
                }
            } catch (error) {
                console.error("Error claiming copyright:", error);
                toast.error("Error claiming copyright");
            }
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <Card className="w-full border-dashed">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between space-x-4">
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (copyrightClaimed) {
        return (
            <Card className="w-full border-solid border-green-200 bg-green-50">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-col md:flex-row space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <ShieldCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-green-800">Copyright Claimed Successfully</h3>
                                <p className="text-sm text-green-600">
                                    This content is now protected under your copyright
                                </p>
                            </div>
                        </div>
                        <div className="bg-green-100 p-2 rounded-full">
                            <Check className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-dashed">
            <CardContent className="p-4">
                <div className="flex items-center justify-between flex-col md:flex-row space-x-4 gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                            <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                This Content is not protected by copyright
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            size="sm"
                            className="space-x-2"
                            onClick={handleClaimCopyright}
                        >
                            <ShieldCheck className="h-4 w-4" />
                            <span>Claim Copyright</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CopyrightPrompt;
