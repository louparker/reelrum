import React from "react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { Home, Plus, Search } from "lucide-react"

export default async function PropertiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const isAuthenticated = !!session?.user

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-1">
            Find the perfect location for your next shoot
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/properties">
              <Search className="mr-2 h-4 w-4" />
              Browse
            </Link>
          </Button>
          
          {isAuthenticated && (
            <Button variant="rum" size="sm" asChild>
              <Link href="/properties/list">
                <Plus className="mr-2 h-4 w-4" />
                List Property
              </Link>
            </Button>
          )}
          
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
      </div>
      
      {children}
    </div>
  )
}
