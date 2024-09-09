"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Loader, XCircle } from 'lucide-react';

const EmailVerificationPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [verificationState, setVerificationState] = useState('verifying');


    useEffect(() => {
        const secret = searchParams.get('secret');
        const userId = searchParams.get('userId');
        const verifyEmail = async () => {
            if (secret && userId) {
                try {
                    const response = await fetch(`/api/auth/verifyEmail?userId=${userId}&secret=${secret}`, {
                        method: 'GET',
                    });
                    const data = await response.json();

                    if (data.success) {
                        setVerificationState('verified');
                        router.push('/user/profile-details')
                    } else {
                        setTimeout(() => {
                            setVerificationState('error');
                        }, 2000);
                        router.push('/user/profile-details')

                    }
                } catch (error) {
                    console.error('Email verification failed:', error);
                    setVerificationState('error');
                }
            } else {
                setVerificationState('error');
            }
        };

        verifyEmail();
    }, []);

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen bg-card   flex items-center justify-center px-4">
            <motion.div
                className="bg-white/80 rounded-lg  shadow-custom p-8 max-w-md w-full"
                initial="hidden"
                animate="visible"
                variants={contentVariants}
            >
                {verificationState === 'verifying' && (
                    <div className="text-center">
                        <Loader className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Your Email</h2>
                        <p className="text-gray-600">Please wait while we confirm your email address...</p>
                    </div>
                )}

                {verificationState === 'verified' && (
                    <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                        <p className="text-gray-600">Your email has been successfully verified. You&apos;ll be redirected shortly.</p>
                    </div>
                )}

                {verificationState === 'error' && (
                    <div className="text-center">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-4">We couldn&apos;t verify your email. The link may be invalid or expired.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default EmailVerificationPage;