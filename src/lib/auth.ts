import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Use this for server components
export async function getSession() {
  return await getServerSession(authOptions);
}

// Use this for server components to get the current user
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

// Use this for server components to require authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Not authenticated");
  }
  
  return user;
}
