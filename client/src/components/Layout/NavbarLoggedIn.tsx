"use client";
import React, { useState, useEffect } from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@nextui-org/react";
import Image from "next/image";
import { ModeToggle } from "../ThemeSwitcher";
import { useRouter } from 'next/navigation';
import { RiVideoLine, RiShieldCheckLine, RiSearchEyeLine, RiCustomerServiceLine, RiLoginBoxLine } from "@remixicon/react";

export default function NavbarLoggedIn() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();


  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', { method: 'POST' });
      if (response.ok) {
        setIsLoggedIn(false);
        router.push('/login');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const menuItems = [
    { name: "Video Detection", icon: <RiVideoLine /> },
    { name: "Source Tracing", icon: <RiSearchEyeLine /> },
    { name: "Our Technology", icon: <RiShieldCheckLine /> },
    { name: "Support", icon: <RiCustomerServiceLine /> },
  ];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} className="" isBordered>
    <NavbarContent>
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />
      <Link href="/"><NavbarBrand className="text-white">
          <RiShieldCheckLine />
          <p>Credify</p>
          </NavbarBrand></Link>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={item.name}>
            <Link href="#">
              {item.name}
            </Link>
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
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="settings" href="/user/profile">Your Profile</DropdownItem>
              <DropdownItem key="help_and_feedback" href="/help">Help & Feedback</DropdownItem>
              <DropdownItem key="logout" color="danger" onPress={handleSignOut}>
                Log Out
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
            <Link href="#" size="lg">
              {item.icon}
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}