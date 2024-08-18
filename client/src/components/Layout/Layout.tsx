import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import NavbarComponent from "./Navbar";
import Footer from "./Footer";

const Layout = ({
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
      <NavbarComponent />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;