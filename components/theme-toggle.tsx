"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle({ onToggle }: { onToggle: () => void }) {
  const { setTheme, theme } = useTheme()

  const handleToggle = (newTheme: string) => {
    setTheme(newTheme)
    onToggle()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" onClick={() => handleToggle(theme === "light" ? "dark" : "light")}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">テーマを切り替える</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        <DropdownMenuItem onClick={() => handleToggle("light")} className="cursor-pointer">
          <Sun className="mr-2 h-4 w-4" />
          <span>ライト</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggle("dark")} className="cursor-pointer">
          <Moon className="mr-2 h-4 w-4" />
          <span>ダーク</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggle("system")} className="cursor-pointer">
          <Laptop className="mr-2 h-4 w-4" />
          <span>システム設定</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 