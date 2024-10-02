'use client'
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, AlertCircle, CalendarDays, Mail } from 'lucide-react';
import { AppwriteUser } from '@/lib/types';
import verifiedIcon from '../../../public/images/verified.png'
import Image from 'next/image'
import { formatDate } from '@/lib/frontend-function';

interface CreatorHeaderProps {
    user: AppwriteUser;
}

const VerificationBadge = () => (
    <div className="flex items-center rounded-full">
        <Image src={verifiedIcon} alt="Verified" width={22} height={22} className="mr-1" />
        <span className="text-sm text-white">Verified Creator</span>
    </div>
);

const UnverifiedBadge = () => (
    <div className="flex items-center text-white/80">
        <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
        <span className="text-sm sm:text-base">Unverified Creator</span>
    </div>
);

const CreatorHeader: React.FC<CreatorHeaderProps> = ({ user }) => {
    const isVerifiedCreator = (user: AppwriteUser): boolean => {
        return (
            user.emailVerification &&
            user.prefs?.profilePhoto &&
            user.prefs?.idPhoto
        );
    };

    return (
        <header className="bg-gradient-to-tl from-white via-purple-300 via-purple-500 to-purple-700 dark:bg-gradient-to-r dark:from-black/50 dark:to-purple-600/30 backdrop-blur-lg shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                <div className="flex flex-row  items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <Avatar className="h-[125px] w-[125px] md:h-[150px] md:w-[150px] shrink-0">
                        {user.prefs?.profilePhoto ? (
                            <AvatarImage
                                className="h-full w-full object-cover"
                                src={user.prefs.profilePhoto}
                                alt={user.name}
                            />
                        ) : (
                            <AvatarFallback className="h-full w-full flex items-center justify-center bg-transparent shadow-lg p-2 border-2 border-white">
                                <UserIcon className="h-14 w-14 sm:h-20 sm:w-20" color='#ffffff' strokeWidth={1} />
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex flex-col mx-4 items-start flex-grow">
                        {isVerifiedCreator(user) && (
                            <div className="mb-2">
                                <VerificationBadge />
                            </div>
                        )}

                        <h1 className="text-3xl sm:text-4xl font-bold text-white text-left mb-2">
                            {user.name}
                        </h1>

                        <div className="flex flex-col space-y-2 items-start">
                            <div className="flex items-center text-white/80">
                                <Mail className="h-4 w-4 mr-2 shrink-0" />
                                <span className="text-sm sm:text-base">{user.email}</span>
                            </div>

                            <div className="flex items-center text-white/80">
                                <CalendarDays className="h-4 w-4 mr-2 shrink-0" />
                                <span className="text-sm sm:text-base">Joined on: {formatDate(user?.registration || "")}</span>
                            </div>
                            {!isVerifiedCreator(user) && (
                                <UnverifiedBadge />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CreatorHeader;