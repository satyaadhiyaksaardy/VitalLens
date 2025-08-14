"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut()}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  )
}