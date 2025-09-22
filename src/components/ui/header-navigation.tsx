'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { brand } from '@/config/brand';
import {
  LayoutDashboard,
  Briefcase,
  Calculator,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// 주요 네비게이션 메뉴
const mainNavItems: NavItem[] = [
  { 
    label: '홈', 
    href: '/', 
    icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" /> 
  },
  { 
    label: '대시보드', 
    href: '/dashboard', 
    icon: <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" /> 
  },
  { 
    label: '프로젝트', 
    href: '/projects', 
    icon: <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" /> 
  },
  { 
    label: '세무 신고', 
    href: '/tax-management', 
    icon: <Calculator className="w-4 h-4 sm:w-5 sm:h-5" /> 
  },
];

export function HeaderNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  // 사용자 정보 가져오기 (테스트용)
  useEffect(() => {
    const testUser = localStorage.getItem('testUser');
    if (testUser) {
      setUser(JSON.parse(testUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('testUser');
    router.push('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
                <img 
                  src={brand.logo.favicon} 
                  alt={brand.logo.alt.ko}
                  className="w-8 h-8 sm:w-9 sm:h-9"
                />
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {brand.company.ko}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "gap-2",
                    isActive(item.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span className="font-medium">
                      {item.label}
                    </span>
                  </Link>
                </Button>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Profile Dropdown - Desktop */}
              {user && (
                <div className="hidden sm:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {(user?.name || user?.email || "U")[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="hidden lg:block text-sm font-medium">
                          {user?.name || user?.email?.split('@')[0] || "사용자"}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.name || "사용자"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email || ""}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/settings')}>
                        설정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        로그아웃
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between pb-4 border-b">
                      <h3 className="text-lg font-semibold">메뉴</h3>
                    </div>

                    {/* Mobile User Info */}
                    {user && (
                      <div className="py-4 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {(user?.name || user?.email || "U")[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user?.name || user?.email?.split('@')[0] || "사용자"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user?.email || ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mobile Navigation Items */}
                    <nav className="flex-1 py-4 space-y-1">
                      {mainNavItems.map((item) => (
                        <Button
                          key={item.href}
                          variant="ghost"
                          asChild
                          className={cn(
                            "w-full justify-start gap-3",
                            isActive(item.href) && "bg-accent text-accent-foreground"
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link href={item.href}>
                            {item.icon}
                            <span className="font-medium">
                              {item.label}
                            </span>
                          </Link>
                        </Button>
                      ))}
                    </nav>

                    {/* Mobile Logout Button */}
                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        로그아웃
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}