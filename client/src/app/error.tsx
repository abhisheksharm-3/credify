"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleGoBack = () => {
    router.push("/");
  };

  return (
    <div className={cn("flex flex-col items-center justify-center h-screen")}>
      <img
        src="/illustrations/Error.svg"
        alt="Error Illustration"
        className="mb-8 max-w-[300px]"
      />
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-8">
        We apologize for the inconvenience. Please try again.
      </p>
      <Button onClick={handleGoBack}>Click Here to Go Back</Button>
    </div>
  );
}