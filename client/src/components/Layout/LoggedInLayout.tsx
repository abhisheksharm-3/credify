import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Footer from "./Footer";
import NavbarLoggedIn from "./NavbarLoggedIn";

const LoggedInLayout = ({
  className,
  children,
  active,
}: {
  className?: string;
  children: ReactNode;
  active?: string;
}) => {
  return (
    <div
      className={cn(
        "w-screen flex flex-col justify-between font-poppins",
        className
      )}
    >
      {/* TODO: use context to avoid prop drilling */}
      <NavbarLoggedIn />
      {children}
      <Footer />
    </div>
  );
};

export default LoggedInLayout;