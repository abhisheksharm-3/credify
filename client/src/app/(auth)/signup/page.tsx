"use client";
import React, { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import Layout from "@/components/Layout/Layout";
import { getLoggedInUser, signUpWithEmail } from "@/lib/server/appwrite";
import { signUpWithGoogle } from "@/lib/server/oauth";
import { useRouter } from "next/navigation";
import SignUPLoginInCard from "@/components/ui/SignUPLoginInCard";
import { RotateCw } from "lucide-react";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm();
  const router = useRouter();
  React.useEffect(() => {
    const checkUser = async () => {
      const user = await getLoggedInUser();
      if (user) {
        router.push("/user/dashboard");
      }
    };

    checkUser();
  }, [router]);

  const onSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await signUpWithEmail(formData);
      if (result.success) {
        router.push("/user/dashboard");
      }
    });
  };

  return (
    <Layout className="min-h-screen flex justify-center items-center">
      <div className="flex  w-full border-b-2 m-2  ">
        <div className="border-r-2 hidden md:flex w-full">
          <SignUPLoginInCard />
        </div>
        <div className=" w-full flex items-center justify-center">
          <Card className="w-[350px] mb-4
          dark:bg-gray-400 dark:rounded-md dark:bg-clip-padding dark:backdrop-filter dark:backdrop-blur-sm dark:bg-opacity-10 
            ">
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Create a new account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    onSubmit(formData);
                  }}
                  className="space-y-8"
                >
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
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
                          <Input placeholder="name@example.com" {...field} />
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
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex  items-center justify-center gap-2 text-md">
                        <RotateCw className="animate-rotate" />Please Wait
                      </div>
                    ) : "Sign Up"}
                  </Button>
                </form>
              </Form>
              <form action={signUpWithGoogle} className="mt-4">
                <Button variant="outline" className="w-full flex gap-2" type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  className="w-6 h-6 fill-black dark:fill-[rgba(230,230,230,1)] " width="16" height="16"><path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z"></path></svg>
                  Sign up with Google
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex items-center justify-center">
              <Link href="/login">Already have an account? Login</Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
