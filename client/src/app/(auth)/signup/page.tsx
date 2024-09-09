"use client"
import React, { startTransition, useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RotateCw, Mail, Lock, User, CheckCircle } from "lucide-react";
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
import { getLoggedInUser, signUpWithEmail } from "@/lib/server/appwrite";
import { signUpWithGoogle } from "@/lib/server/oauth";
import Layout from "@/components/Layout/Layout";
import { useTheme } from "next-themes";
import Particles from "@/components/magicui/particles";
import { toast } from "sonner";
import PasswordStrengthBar from 'react-password-strength-bar';

const Signup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm();
  const router = useRouter();
  const { theme } = useTheme();
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    setColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  const password = useWatch({
    control: form.control,
    name: "password",
    defaultValue: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getLoggedInUser();
        if (user) {
          router.push("/user/dashboard");
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      }
    };

    checkUser();
  }, [router]);

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const result = await signUpWithEmail(formData);
        if (result.success) {
          toast.success("Account created successfully", {
            description: "Welcome to Credify. Redirecting you to your dashboard...",
            action: {
              label: "Dismiss",
              onClick: () => console.log("Dismissed"),
            },
          });
          setTimeout(() => router.push("/user/dashboard"), 2000);
        } else {
          throw new Error(result.error || "Failed to create account");
        }
      } catch (error) {
        console.error("Signup error:", error);
        toast.error("Error creating account", {
          description: "Please check your information and try again. If the problem persists, contact support.",
        });
      } finally {
        setIsLoading(false);
      }
    });
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
          <p className="text-xl mb-8 text-center">Join the Revolution in Digital Authenticity</p>
          <div className="w-64 h-64 bg-white/10 rounded-full mb-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32">
              <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
            </svg>
          </div>
          <p className="text-sm opacity-75 max-w-md text-center">
            Sign up now to join our community of content creators and guardians of digital integrity. Together, we&apos;re building a more trustworthy online world.
          </p>
        </div>

        {/* Right side - Signup Form */}
        <div className="w-full md:w-1/2 bg-background flex items-center justify-center p-12">
          <div className="w-full max-w-md z-30">
            <h2 className="text-3xl font-bold mb-6 text-center">Create Your Account</h2>
            <Form {...form}>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onSubmit(formData);
              }} className="space-y-4">
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input placeholder="John" {...field} className="bg-secondary/10 pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input placeholder="Doe" {...field} className="bg-secondary/10 pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input type="password" {...field} className="bg-secondary/10 pl-10" />
                        </div>
                      </FormControl>
                      <PasswordStrengthBar password={password} />
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
                        Creating Your Account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle size={18} />
                        Join Credify
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-gray-500">Or sign up with</span>
                </div>
              </div>
              <form action={signUpWithGoogle} className="mt-6">
                <Button variant="outline" className="w-full flex gap-2" type="submit">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z"></path>
                  </svg>
                  Sign up with Google
                </Button>
              </form>
            </div>
            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;