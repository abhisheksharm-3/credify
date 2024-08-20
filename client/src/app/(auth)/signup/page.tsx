"use client";
import React, { startTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from 'next/link';
import Layout from '@/components/Layout/Layout';
import { getLoggedInUser, signUpWithEmail } from "@/lib/server/appwrite";
import { signUpWithGoogle } from '@/lib/server/oauth';
import { useRouter } from 'next/navigation';

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
    <Layout className='min-h-screen flex justify-center items-center'>
      <Card className="w-[350px] my-20">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account.</CardDescription>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </Form>
          <form action={signUpWithGoogle} className="mt-4">
          <Button variant="outline" className="w-full" type='submit'>
              Sign up with Google
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Link href="/login">Already have an account? Login</Link>
        </CardFooter>
      </Card>
    </Layout>
  );
};

export default Signup;
