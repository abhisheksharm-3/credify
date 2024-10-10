import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";


const Copyright = () => {
    const currentYear = new Date().getFullYear();

    const copyrightText = `© ${currentYear}. All rights reserved.`;

    return (
        <Card className={`w-full transform transition-all duration-300 `}>
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                    <HoverCard>
                        <HoverCardTrigger>
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold">Legal Protection Notice</h4>
                            </div>
                        </HoverCardContent>
                    </HoverCard>

                    <div className="flex-1 text-center md:text-left">
                        <p className="text-sm font-medium leading-none">
                            {copyrightText}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Protected by international copyright laws
                        </p>
                    </div>

                    <Button variant="outline" className="space-x-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>File Dispute</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default Copyright;