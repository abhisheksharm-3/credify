"use client"

import React from "react";
import Image from "next/image";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Link
} from "@nextui-org/react";
import { RiVideoLine, RiShieldCheckLine, RiSearchEyeLine, RiCustomerServiceLine, RiLoginBoxLine } from "@remixicon/react";
import { ModeToggle } from "../ThemeSwitcher";

export default function NavbarComponent() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { name: "Analyze Video", icon: <RiVideoLine />, href: "/public/analyze" },
    { name: "Our Technology", icon: <RiShieldCheckLine />, href: "/technology" },
    { name: "Support", icon: <RiCustomerServiceLine />, href: "/support" },
  ];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} isBordered className="py-2">
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <Link href="/">
          <NavbarBrand as="a" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Credify Logo" width={200} height={40} />
          </NavbarBrand>
        </Link>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.name}>
            <Link href={item.href}>
              <a className="flex items-center gap-1 text-sm">
                {item.icon}
                <span>{item.name}</span>
              </a>
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Link href="/signup">
            <Button as="a" color="primary" variant="shadow">
              Get Started
            </Button>
          </Link>
        </NavbarItem>
        <ModeToggle />
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link href={item.href}>
              <a className="flex items-center gap-2 w-full">
                {item.icon}
                <span>{item.name}</span>
              </a>
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Link href="/login">
            <a className="flex items-center gap-2 w-full">
              <RiLoginBoxLine />
              <span>Login</span>
            </a>
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}