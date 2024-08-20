"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <Dropdown className="bg-popover shadow-lg rounded-md border text-popover-foreground min-w-[8rem] overflow-hidden">
      <DropdownTrigger>
      <Button variant="outline" size="icon">
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Theme Options"
        
      >
        <DropdownItem
          key="light"
          className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          onClick={() => setTheme("light")}
        >
          Light
        </DropdownItem>
        <DropdownItem
          key="dark"
          className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          onClick={() => setTheme("dark")}
        >
          Dark
        </DropdownItem>
        <DropdownItem
          key="system"
          className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          onClick={() => setTheme("system")}
        >
          System
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}