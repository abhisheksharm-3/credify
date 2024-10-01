"use client";
import React, { useState} from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@nextui-org/react";
import { ModeToggle } from "../ThemeSwitcher";
import { useRouter } from "next/navigation";
import {
  RiDashboardLine,
  RiEyeLine,
  RiShieldCheckLine,
  RiUserLine,
  RiLogoutBoxLine,
} from "@remixicon/react";
import Image from "next/image";

export default function NavbarLoggedIn() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (response.ok) {
        setIsLoggedIn(false);
        router.push("/login");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const menuItems = [
    { name: "Analytics Dashboard", icon: <RiDashboardLine />, href: "/user/dashboard" },
    { name: "Content Management", icon: <RiEyeLine />, href: "/content/manage" },
    { name: "Your Details", icon: <RiUserLine />, href: "/user/creator-profile" },
  ];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} className="" isBordered>
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
        {menuItems.map((item, index) => (
          <NavbarItem key={item.name}>
            <Link href={item.href}>{item.name}</Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions" variant="flat">
              <DropdownItem key="settings" href="/user/profile">
                <div className="flex gap-1 items-center"><RiUserLine className="mr-2" />
                <p>Profile Settings</p></div>
              </DropdownItem>
              <DropdownItem key="help_and_feedback" href="/help">
                <div className="flex gap-1 items-center"><RiShieldCheckLine className="mr-2" />
                <p>Help & Feedback</p></div>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleSignOut}>
                <div className="flex gap-1 items-center"><RiLogoutBoxLine className="mr-2" />
                <p>Log Out</p></div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
        <NavbarItem>
          <ModeToggle />
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link href={item.href} size="lg">
              {item.icon}
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}