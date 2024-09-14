import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ChevronDown, ChevronUp, Mail, X, CircleCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button"

interface EmailVerificationProps {
    emailVerified: "yes" | "no" | "send" | string;
    openStep: number | null; 
    toggleStep: (step: number) => void;
    handleAction: (action: number) => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
    emailVerified,
    openStep,
    toggleStep,
    handleAction,
}) => {
    return (
        <div className="mb-2">
            <button
                className="w-full outline-none flex items-center justify-between text-left py-2"
                onClick={() => toggleStep(0)}
            >
                <div className="flex items-center space-x-2">
                    {emailVerified === "yes" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                        <X className="w-5 h-5 text-red-500" />
                    )}
                    <span
                        className={`text-sm ${emailVerified === "yes" ? "text-green-500" : "text-red-500"
                            }`}
                    >
                        Email Verification
                    </span>
                </div>
                {openStep === 0 ? (
                    <ChevronUp className="text-gray-400" />
                ) : (
                    <ChevronDown className="text-gray-400" />
                )}
            </button>
            <AnimatePresence>
                {openStep === 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-2"
                    >
                        {emailVerified === "yes" && (
                            <div className="flex w-full flex-col items-center justify-center">
                                <CircleCheckIcon className="size-10 text-green-500" />
                                <p className="text-sm mb-2 font-bold text-black dark:text-white w-full text-center">
                                    Email Verified
                                </p>
                                <p className="flex text-center w-full text-sm mb-2 text-black dark:text-white ">
                                    Congratulations! Your email has been successfully verified.
                                </p>
                            </div>
                        )}
                        {emailVerified === "no" && (
                            <>
                                <p className="text-sm mb-2 text-gray-400">
                                    Verify your email address
                                </p>
                                <Button
                                    onClick={() => handleAction(0)}
                                    className="w-full bg-blue-500 text-white"
                                >
                                    Send Verification Email
                                </Button>
                            </>
                        )}
                        {emailVerified === "send" && (
                            <div className="flex flex-col items-center justify-center w-full">
                                <Mail className="h-10 w-auto" />
                                <p className="text-black dark:text-white font-bold text-sm">
                                    Verify your email address
                                </p>
                                <div className="text-xs text-black dark:text-white">
                                    We&apos;ve sent a verification link to your email. Please
                                    check your email and click the link to verify your account.
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmailVerification;
