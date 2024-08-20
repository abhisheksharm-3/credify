"use client";

import React, { startTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';
import { getLoggedInUser, loginWithEmail } from "@/lib/server/appwrite";;
import { signUpWithGoogle } from '@/lib/server/oauth';
import { useRouter } from 'next/navigation';

//TODO: Refactor it
const Login = () => {
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
      const result = await loginWithEmail(formData);
      if (result.success) {
        router.push("/user/dashboard");
      }
    });
  };

  

  return (
    <Layout className='h-screen flex justify-center items-center'>
      <Card className="w-[350px] my-20">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your email and password to login.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit(formData);
    }} className="space-y-8">
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
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
          <form action={signUpWithGoogle} className="mt-4">
            <Button variant="outline" className="w-full" type='submit'>
              Sign in with Google
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/signup">Create account</Link>
          <Link href="/forgot-password">Forgot password?</Link>
        </CardFooter>
      </Card>
    </Layout>
  );
};

export default Login;
