import React, { useEffect, useState } from 'react';
import { Shield, Gavel } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { fetchUserInfoByHash, updateIsDisputeByHash } from '@/lib/server/appwrite';
import { AppwriteUser } from '@/lib/types';

interface CopyrightProps {
    mediaHash: string;
}

const Copyright = ({ mediaHash }: CopyrightProps) => {
    const currentYear = new Date().getFullYear();
    const [user, setUser] = useState<AppwriteUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDisputeFiled, setIsDisputeFiled] = useState(false); // State to track dispute status
    
    const copyrightText = `© ${currentYear}. All rights reserved.`;
    
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            const userInfoResponse = await fetchUserInfoByHash(mediaHash);
            if (userInfoResponse.success) {
                setUser(userInfoResponse.user.user);
            } else {
                console.log(userInfoResponse.error || 'Failed to fetch user info.');
            }
            setIsLoading(false);
        };
        
        fetchUser();
    }, [mediaHash]);
    
    const handleCopyrightDispute = async () => {
        const result = await updateIsDisputeByHash(mediaHash);
        
        if (result.success) {
            toast.success('Dispute filed successfully.');
            setIsDisputeFiled(true); // Set dispute as filed
        } else {
            toast.error(result.error || 'Failed to file the dispute.');
        }
    };
    
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                    <Shield className="h-6 w-6" />
                    <h2 className="text-lg md:text-xl font-semibold">Legal Protection Notice</h2>
                </div>
                
                <div className="mt-4 space-y-2">
                    <p>{copyrightText}</p>
                    
                    {isLoading ? (
                        <Skeleton className="h-4 w-3/4" />
                    ) : user && (
                        <p>Owner: {user.name || 'Unknown'}</p>
                    )}
                    
                    <Button 
                        variant="outline"
                        className={`w-full mt-4 ${isDisputeFiled ? 'bg-red-500 text-white' : ''}`} // Change button background and text color
                        onClick={handleCopyrightDispute}
                        disabled={isDisputeFiled} // Disable button after dispute is filed
                    >
                        <Gavel className="h-4 w-4 mr-2" />
                        {isDisputeFiled ? 'Dispute Filed' : 'File Dispute'} {/* Change text when dispute is filed */}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default Copyright;
