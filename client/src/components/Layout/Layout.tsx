"use client"
import { cn } from "@/lib/utils";
import { ReactNode, useState, useEffect } from "react";
import NavbarComponent from "./Navbar";
import NavbarLoggedIn from "./NavbarLoggedIn";
import Footer from "./Footer";

const Layout = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("/api/auth/status");
        const { isLoggedIn } = await response.json();
        setIsLoggedIn(isLoggedIn);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <div
      className={cn(
        "w-screen flex  flex-col justify-between font-poppins",
        className
      )}
    >
      {isLoggedIn ? <NavbarLoggedIn /> : <NavbarComponent />}
      {children}
      <Footer />
    </div>
  );
};

export default Layout;