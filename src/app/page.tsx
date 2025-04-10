import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Logo size="sm" />
          <nav className="flex items-center gap-6">
            <Link href="/properties" className="text-sm font-medium hover:text-zinc-600">
              Browse Properties
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium hover:text-zinc-600">
              How It Works
            </Link>
            <Button asChild variant="outline" className="mr-2">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-zinc-50">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0 lg:pr-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find the perfect filming location for your next project
            </h1>
            <p className="text-lg text-zinc-600 mb-8">
              ReelRum connects property owners with filmmakers, photographers, and content creators looking for unique spaces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="px-8">
                <Link href="/properties">Browse Locations</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8">
                <Link href="/auth/signup?provider=true">List Your Property</Link>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1564078516393-cf04bd966897?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                alt="Modern filming location"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose ReelRum</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Unique Spaces</h3>
              <p className="text-zinc-600">
                Browse through a curated selection of unique filming locations for any project size or budget.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book with Ease</h3>
              <p className="text-zinc-600">
                Seamless booking process with secure payments and instant confirmation for your peace of mind.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 01-.75.75h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Extra Income</h3>
              <p className="text-zinc-600">
                List your property and earn money by renting it out to filmmakers and content creators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-zinc-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto">
            Join thousands of property owners and filmmakers already using ReelRum to connect and create amazing content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="default" className="bg-white text-zinc-900 hover:bg-zinc-100">
              <Link href="/auth/signup">Create an Account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white text-zinc-900 hover:bg-zinc-100">
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo size="sm" />
              <p className="mt-4 text-sm text-zinc-600">
                Connecting property owners with filmmakers and content creators since 2025.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Property Owners</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">List Your Property</Link></li>
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">How It Works</Link></li>
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">Pricing</Link></li>
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Filmmakers</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">Find Locations</Link></li>
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">How Booking Works</Link></li>
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">Insurance</Link></li>
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">About Us</Link></li>
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">Blog</Link></li>
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">Careers</Link></li>
                <li><Link href="#" className="text-zinc-600 hover:text-zinc-900">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-200 mt-12 pt-8 text-sm text-zinc-500 flex flex-col md:flex-row justify-between">
            <p> 2025 ReelRum. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-zinc-900">Terms</Link>
              <Link href="#" className="hover:text-zinc-900">Privacy</Link>
              <Link href="#" className="hover:text-zinc-900">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
