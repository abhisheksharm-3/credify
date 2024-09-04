"use client"
import React from "react";
import {
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle, 
  NavbarMenu, 
  NavbarMenuItem, 
  Link, 
  Button
} from "@nextui-org/react";
import { RiVideoLine, RiShieldCheckLine, RiSearchEyeLine, RiCustomerServiceLine, RiLoginBoxLine } from "@remixicon/react";
import { ModeToggle } from "../ThemeSwitcher";

export default function NavbarComponent() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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
      <Link href="/"><NavbarBrand className="">
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
          <Button as={Link} color="primary" href="/signup" variant="shadow">
            Get Started
          </Button>
        </NavbarItem>
        <ModeToggle />
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
        <NavbarMenuItem>
          <Link href="/login" size="lg">
            <RiLoginBoxLine />
            Login
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}