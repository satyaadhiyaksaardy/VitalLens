import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function getServerAuthSession() {
  return await getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getServerAuthSession()
  
  if (!session?.user) {
    throw new Error("Authentication required")
  }
  
  return session
}