'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  User, 
  Menu, 
  X, 
  Building, 
  LogIn, 
  LogOut,
  LayoutDashboard,
  HelpCircle,
  Home,
  Moon,
  Sun
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <Logo size="sm" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/properties" 
            className={`text-sm font-medium ${pathname === '/properties' || pathname.startsWith('/properties') && !pathname.includes('/list') ? 'text-amber-500' : 'text-foreground'}`}
          >
            Browse Properties
          </Link>
          <Link 
            href="/how-it-works" 
            className={`text-sm font-medium ${pathname === '/how-it-works' ? 'text-amber-500' : 'text-foreground'}`}
          >
            How It Works
          </Link>
          <Link 
            href="/dashboard" 
            className={`text-sm font-medium ${pathname === '/dashboard' || pathname.startsWith('/dashboard') ? 'text-amber-500' : 'text-foreground'}`}
          >
            Dashboard
          </Link>
          
          <Button variant="ghost" size="sm" asChild>
            <Link href="/search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Link>
          </Button>

          {!isLoading && user ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="mr-2">
                <Link href="/properties/list">List Property</Link>
              </Button>
              
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/properties/my-properties" className="cursor-pointer">
                      <Building className="h-4 w-4 mr-2" />
                      My Properties
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="mr-2">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
          
        {/* Mobile Navigation Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          
          {!isLoading && user ? (
            <Button asChild size="sm" variant="outline" className="px-3 py-1 h-8">
              <Link href="/properties/list">List Property</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="px-3 py-1 h-8">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-zinc-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl p-4 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <Logo size="sm" />
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-zinc-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="flex items-center p-2 rounded-md hover:bg-zinc-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5 mr-3" />
                Home
              </Link>
              <Link 
                href="/properties" 
                className="flex items-center p-2 rounded-md hover:bg-zinc-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <Building className="h-5 w-5 mr-3" />
                Browse Properties
              </Link>
              <Link 
                href="/search" 
                className="flex items-center p-2 rounded-md hover:bg-zinc-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="h-5 w-5 mr-3" />
                Search Locations
              </Link>
              <Link 
                href="/how-it-works" 
                className="flex items-center p-2 rounded-md hover:bg-zinc-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <HelpCircle className="h-5 w-5 mr-3" />
                How It Works
              </Link>
              <Link 
                href="/dashboard" 
                className="flex items-center p-2 rounded-md hover:bg-zinc-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </Link>

              <div className="border-t pt-4 mt-2">
                <div className="flex items-center p-2 mb-4">
                  <span className="font-medium">Theme</span>
                  <div className="ml-auto">
                    <ThemeToggle />
                  </div>
                </div>
                
                {!isLoading && user ? (
                  <>
                    <div className="flex items-center p-2 mb-4">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name || 'User'}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                    <Link 
                      href="/properties/list" 
                      className="flex items-center p-2 rounded-md hover:bg-zinc-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Building className="h-5 w-5 mr-3" />
                      List Your Property
                    </Link>
                    <Link 
                      href="/profile" 
                      className="flex items-center p-2 rounded-md hover:bg-zinc-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Profile
                    </Link>
                    <button 
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center p-2 rounded-md hover:bg-zinc-100 w-full text-left"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/auth/login" 
                      className="flex items-center p-2 rounded-md hover:bg-zinc-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5 mr-3" />
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="flex items-center p-2 rounded-md bg-amber-500 text-white mt-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-3" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
