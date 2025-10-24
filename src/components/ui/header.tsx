'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  brand,
  defaultLanguage,
  getAuthText,
  getCompanyName,
  getNavText,
  getText,
  headerNavigation,
} from '@/config/brand';
import {
  Briefcase,
  Calculator,
  ChevronDown,
  FileText,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Settings,
  User,
  UserPlus,
  X,
  CreditCard,
  BarChart2,
  Package,
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type IconName =
  | 'home'
  | 'layoutDashboard'
  | 'briefcase'
  | 'calculator'
  | 'docs'
  | 'components'
  | 'logIn'
  | 'userPlus'
  | 'settings'
  | 'logOut'
  | 'user'
  | 'menu'
  | 'creditCard'
  | 'barChart'
  | 'package';

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
  home: Home,
  layoutDashboard: LayoutDashboard,
  briefcase: Briefcase,
  calculator: Calculator,
  docs: FileText,
  components: LayoutDashboard,
  logIn: LogIn,
  userPlus: UserPlus,
  settings: Settings,
  logOut: LogOut,
  user: User,
  menu: Menu,
  creditCard: CreditCard,
  barChart: BarChart2,
  package: Package,
};

interface HeaderProps {
  variant?: 'default' | 'preview';
  className?: string;
}

const renderIcon = (name: string | undefined, className: string) => {
  if (!name) return null;
  const iconName = name as IconName;
  const IconComponent = iconMap[iconName] ?? iconMap.menu;
  return <IconComponent className={className} aria-hidden="true" />;
};

export function Header({ variant = 'default', className }: HeaderProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const lang: 'ko' | 'en' = defaultLanguage;

  const menuItems = headerNavigation.menus;
  const loggedOutActions = headerNavigation.auth.loggedOut;
  const profileMenuItems = headerNavigation.auth.profileMenu;
  const menuTitleKey = headerNavigation.auth.menuTitleKey ?? 'auth.profileMenu';

  const theme = {
    text: brand.theme?.primaryTextClass ?? 'text-primary',
    avatarBg: brand.theme?.avatarBackgroundClass ?? 'bg-primary/10',
    avatarText: brand.theme?.avatarTextClass ?? 'text-primary',
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  // 사용자 정보 가져오기
  useEffect(() => {
    const checkUser = async () => {
      // 테스트 사용자 우선 확인
      const testUser = localStorage.getItem('testUser')
      if (testUser) {
        setUser(JSON.parse(testUser))
        return
      }

      // Supabase 세션 확인
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setUser(user)
        }
      } catch (err) {
        console.error('사용자 정보 확인 중 오류:', err)
      }
    }

    checkUser()
  }, []);

  const handleLogout = async () => {
    // 1. localStorage 정리
    localStorage.removeItem('testUser')

    // 2. Supabase 세션 제거
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error('로그아웃 중 오류:', err)
    }

    // 3. 로그인 페이지로 이동
    router.push('/login')
    router.refresh()
  };

  const handleNavigate = (href: string) => {
    setIsMobileMenuOpen(false);
    router.push(href);
  };

  const headerClasses = cn(
    variant === 'default'
      ? 'fixed top-0 left-0 right-0 z-50 bg-background border-b'
      : 'relative w-full border rounded-xl bg-background shadow-sm',
    className
  );

  const wrapperPadding = variant === 'default' ? 'px-4 sm:px-6 lg:px-12' : 'px-6';
  const innerHeight = variant === 'default' ? 'h-14 sm:h-16' : '';

  return (
    <>
      <header className={headerClasses}>
        <div className={wrapperPadding}>
          <div className={cn('flex items-center justify-between', innerHeight, variant === 'default' ? '' : 'py-4 gap-6 flex-wrap lg:flex-nowrap')}>
            {/* Logo */}
            <div className="flex items-center">
              <Link href={headerNavigation.brand.href} className="flex items-center gap-2 sm:gap-3">
                <img
                  src={brand.logo.favicon}
                  alt={brand.logo.alt[lang]}
                  className="w-8 h-8 sm:w-9 sm:h-9"
                />
                <span className={cn('text-lg sm:text-xl font-bold', theme.text)}>
                  {getCompanyName(lang)}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  asChild
                  className={cn(
                    "gap-2",
                    isActive(item.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <Link href={item.href}>
                    {renderIcon(item.icon, 'w-4 h-4 sm:w-5 sm:h-5')}
                    <span className="font-medium">
                      {getText(item.labelKey, lang)}
                    </span>
                  </Link>
                </Button>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {!user && (
                <div className="hidden lg:flex items-center gap-2">
                  {loggedOutActions?.secondaryAction && (
                    <Button variant="ghost" asChild className="gap-2">
                      <Link href={loggedOutActions.secondaryAction.href}>
                        {renderIcon(loggedOutActions.secondaryAction.icon, 'h-4 w-4')}
                        <span>{getText(loggedOutActions.secondaryAction.labelKey, lang)}</span>
                      </Link>
                    </Button>
                  )}
                  {loggedOutActions?.primaryAction && (
                    <Button asChild className="gap-2">
                      <Link href={loggedOutActions.primaryAction.href}>
                        {renderIcon(loggedOutActions.primaryAction.icon, 'h-4 w-4')}
                        <span>{getText(loggedOutActions.primaryAction.labelKey, lang)}</span>
                      </Link>
                    </Button>
                  )}
                </div>
              )}
              {/* Profile Dropdown - Desktop */}
              {user && (
                <div className="hidden sm:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', theme.avatarBg)}>
                          <span className={cn('font-medium', theme.avatarText)}>
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
                      {profileMenuItems.map((item) => {
                        const isLogout = 'action' in item && item.action === 'logout';
                        return (
                          <DropdownMenuItem
                            key={item.id}
                            onSelect={() => {
                              if (isLogout) {
                                handleLogout();
                                return;
                              }
                              if ('href' in item && item.href) {
                                router.push(item.href);
                              }
                            }}
                            className={cn(isLogout && 'text-red-600')}
                          >
                            <span className="flex items-center gap-2">
                              {renderIcon(item.icon, 'h-4 w-4')}
                              {getText(item.labelKey, lang)}
                            </span>
                          </DropdownMenuItem>
                        );
                      })}
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
                      <SheetTitle className="text-lg font-semibold">{getNavText.menuTitle(lang)}</SheetTitle>
                    </div>

                    {/* Mobile User Info */}
                    {user && (
                      <div className="py-4 border-b">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', theme.avatarBg)}>
                            <span className={cn('font-medium', theme.avatarText)}>
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
                      {menuItems.map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          asChild
                          className={cn(
                            "w-full justify-start gap-3",
                            isActive(item.href) && "bg-accent text-accent-foreground"
                          )}
                        >
                          <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                            {renderIcon(item.icon, 'h-4 w-4')}
                            <span className="font-medium">
                              {getText(item.labelKey, lang)}
                            </span>
                          </Link>
                        </Button>
                      ))}
                    </nav>

                    <div className="pt-4 border-t space-y-2">
                      {user ? (
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          className="w-full justify-start text-red-600 hover:bg-red-50"
                        >
                          {renderIcon('logOut', 'mr-2 h-4 w-4')}
                          {getAuthText.logout(lang)}
                        </Button>
                      ) : (
                        <div className="grid gap-2">
                          {loggedOutActions?.primaryAction && (
                            <Button
                              onClick={() => handleNavigate(loggedOutActions.primaryAction.href)}
                              className="w-full justify-center gap-2"
                            >
                              {renderIcon(loggedOutActions.primaryAction.icon, 'h-4 w-4')}
                              {getText(loggedOutActions.primaryAction.labelKey, lang)}
                            </Button>
                          )}
                          {loggedOutActions?.secondaryAction && (
                            <Button
                              variant="outline"
                              onClick={() => handleNavigate(loggedOutActions.secondaryAction.href)}
                              className="w-full justify-center gap-2"
                            >
                              {renderIcon(loggedOutActions.secondaryAction.icon, 'h-4 w-4')}
                              {getText(loggedOutActions.secondaryAction.labelKey, lang)}
                            </Button>
                          )}
                        </div>
                      )}
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
