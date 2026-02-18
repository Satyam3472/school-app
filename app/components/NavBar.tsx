'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { SCHOOL_NAME } from '../data/data';
import { useRouter } from 'next/navigation';

const NavBar = () => {
  const router = useRouter();
  const [adminView, setAdminView] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image
              src="/assets/school_logo.png"
              alt="School Logo"
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
            />
          </Link>
          <div className="leading-tight">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                {SCHOOL_NAME.toUpperCase()}
              </span>{' '}
              SCHOOL
            </h1>
            <p className="text-xs text-gray-500 italic">Shaping Minds, Building Future</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <NavigationMenu className="hidden lg:flex gap-8">
          <NavigationMenuList className="flex items-center gap-6 text-sm font-medium text-gray-700">
            <NavigationMenuItem>
              <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="hover:text-blue-600 transition">Academics</NavigationMenuTrigger>
              <NavigationMenuContent className="absolute mt-2 bg-white shadow-xl rounded-md p-4 border border-gray-100 z-50">
                <ul className="space-y-2 text-sm w-40">
                  <li><Link href="/academics/primary" className="block hover:text-blue-500">Primary</Link></li>
                  <li><Link href="/academics/secondary" className="block hover:text-blue-500">Secondary</Link></li>
                  <li><Link href="/academics/senior" className="block hover:text-blue-500">Senior</Link></li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="hover:text-blue-600 transition">Admissions</NavigationMenuTrigger>
              <NavigationMenuContent className="absolute mt-2 bg-white shadow-xl rounded-md p-4 border border-gray-100 z-50">
                <ul className="space-y-2 text-sm w-40">
                  <li><Link href="/admissions/how-to-apply" className="block hover:text-blue-500">How to Apply</Link></li>
                  <li><Link href="/admissions/eligibility" className="block hover:text-blue-500">Eligibility</Link></li>
                  <li><Link href="/admissions/fees" className="block hover:text-blue-500">Fees</Link></li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/contact" className="hover:text-blue-600 transition">Contact</Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Admin Panel */}
        <div className="hidden lg:block">
          <Button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm px-4 py-2 shadow"
          >
            Admin Panel
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-gray-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white w-72 p-6">
              <div className="space-y-6">
                <Link href="/" className="block font-medium text-gray-800 hover:text-blue-600">Home</Link>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Academics</p>
                  <ul className="ml-3 space-y-2 text-sm">
                    <li><Link href="/academics/primary" className="block hover:text-blue-500">Primary</Link></li>
                    <li><Link href="/academics/secondary" className="block hover:text-blue-500">Secondary</Link></li>
                    <li><Link href="/academics/senior" className="block hover:text-blue-500">Senior</Link></li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Admissions</p>
                  <ul className="ml-3 space-y-2 text-sm">
                    <li><Link href="/admissions/how-to-apply" className="block hover:text-blue-500">How to Apply</Link></li>
                    <li><Link href="/admissions/eligibility" className="block hover:text-blue-500">Eligibility</Link></li>
                    <li><Link href="/admissions/fees" className="block hover:text-blue-500">Fees</Link></li>
                  </ul>
                </div>

                <Link href="/contact" className="block font-medium text-gray-800 hover:text-blue-600">Contact</Link>

                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow mt-4"
                  >
                    Admin Panel
                  </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
