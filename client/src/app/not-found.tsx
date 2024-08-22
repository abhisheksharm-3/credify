import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RiHomeOfficeLine } from "@remixicon/react";
import Layout from "@/components/Layout/Layout";

function NotFound() {
  return (
    <Layout>
      <div className="flex items-center justify-center flex-col gap-4">
        <Image
          src={"/illustrations/404.svg"}
          width={600}
          height={900}
          alt="Image of Broken Robot"
        />
        <span>Houston, we have a problem!</span>
        <span>
          It seems you&apos;re lost. Let&apos;s navigate back to home.
        </span>
        <Button asChild>
          <Link href="/"><RiHomeOfficeLine />&nbsp;Home</Link>
        </Button>
      </div>
    </Layout>
  );
}

export default NotFound;