"use client"
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RotateCw, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Layout from "@/components/Layout/Layout";
import { useTheme } from "next-themes";
import Particles from "@/components/magicui/particles";
import { toast } from "sonner";

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm();
  const router = useRouter();
  const { theme } = useTheme();
  const [color, setColor] = useState("#ffffff");

  React.useEffect(() => {
    setColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    // Simulate password reset request
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Password reset email sent", {
        description: "Check your inbox for instructions to reset your password.",
        action: {
          label: "Dismiss",
          onClick: () => console.log("Dismissed"),
        },
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="h-full md:min-h-screen flex flex-col md:flex-row border-b">
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          color={color}
          refresh
        />
        {/* Left side - Branding and Information */}
        <div className="w-full z-30 md:w-1/2 bg-gradient-to-br from-primary to-secondary p-12 hidden md:flex flex-col justify-center items-center text-white">
          <h1 className="text-4xl font-bold mb-6">Credify</h1>
          <p className="text-xl mb-8 text-center">Reset Your Password</p>
          <div className="w-64 h-64 bg-white/10 rounded-full mb-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm opacity-75 max-w-md text-center">
            Don&apos;t worry, it happens to the best of us. Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {/* Right side - Forgot Password Form */}
        <div className="w-full md:w-1/2 bg-background flex items-center justify-center p-12">
          <div className="w-full max-w-md z-30">
            <h2 className="text-3xl font-bold mb-6 text-center">Forgot Your Password?</h2>
            <Form {...form}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onSubmit(formData);
              }} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input type="email" placeholder="name@example.com" {...field} className="bg-secondary/10 pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <motion.div
                  whileTap={{ scale: 0.95 }}
                >
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 transition-all duration-300" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RotateCw className="animate-spin" />
                        Sending Reset Link...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Mail size={18} />
                        Send Reset Link
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="font-medium text-primary hover:text-primary/80 flex items-center justify-center gap-2">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;