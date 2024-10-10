import React, { useEffect } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useUser } from '@/hooks/useUser';
import { createCopyrightDocument, getMediaByHashAndUser } from "@/lib/server/appwrite";
import { VerificationResult } from '@/lib/frontend-types';

interface ExistingContentAlertProps {
    result: VerificationResult;
}

const CopyrightPrompt = ({ result }: ExistingContentAlertProps) => {
    const { user } = useUser();

    const getMediaId = async (hash: string, userId: string): Promise<string | null> => {
        try {
            const res = await getMediaByHashAndUser(hash, userId);
            if (res && res.mediaId) {
                console.log(res);
                return res.mediaId;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching media:", error);
            return null;
        }
    };

    useEffect(() => {
        const hash = result.image_hash || result.video_hash;
        if (hash && user?.$id) {
            getMediaId(hash, user.$id);
        }
    }, [result, user?.$id]);

    const handleClaimCopyright = async () => {
        const hash = result.image_hash || result.video_hash;
        if (user) {
            const mediaId = await getMediaId(hash || "", user?.$id);
            if (mediaId) {
                const result = await createCopyrightDocument(user?.$id, mediaId);
                console.log("result",result);
            } else {
                console.log("No media ID found or media does not exist.");
            }
        }
    };

    return (
        <Card className={`w-full border-dashed `}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between space-x-4">
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
