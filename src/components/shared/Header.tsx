
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, MessageCircle, Shield, Heart, BarChart3, Menu } from 'lucide-react';
import { NotificationBadge } from '@/components/chat/NotificationBadge';
import { useChatNotifications } from '@/hooks/useChatNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

export const Header = () => {
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const [isSheetOpen, setSheetOpen] = useState(false);

  // Initialize chat notifications
  useChatNotifications();

  const handleSignOut = async () => {
    await signOut();
    setSheetOpen(false);
    navigate('/');
  };

  const handleLinkClick = () => {
    setSheetOpen(false);
  };

  const DesktopNav = () => (
    <nav className="hidden md:flex items-center space-x-2">
      {user ? (
        <>
          <Button variant="ghost" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          {roles.includes('consultant') && (
            <Button variant="ghost" asChild>
              <Link to="/consultant-dashboard">
                <BarChart3 className="mr-2 h-4 w-4" />
                Consultant
              </Link>
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link to="/billing">Billing</Link>
          </Button>
          <Button variant="ghost" asChild className="relative">
            <Link to="/chat">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
              <NotificationBadge className="absolute -top-1 -right-1" />
            </Link>
          </Button>
          {roles.includes('admin') && (
            <Button variant="ghost" asChild>
              <Link to="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Button asChild>
          <Link to="/auth">Sign In</Link>
        </Button>
      )}
    </nav>
  );

  const MobileNav = () => (
    <div className="md:hidden">
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] flex flex-col">
          <SheetHeader>
            <SheetTitle>
              <Link
                to="/"
                className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/90 transition-colors font-serif"
                onClick={handleLinkClick}
              >
                <Heart className="h-7 w-7 text-calming-green" />
                <span>ZenJourney</span>
              </Link>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-grow mt-6">
            <nav className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/dashboard" onClick={handleLinkClick}>Dashboard</Link>
                  </Button>
                  {roles.includes('consultant') && (
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/consultant-dashboard" onClick={handleLinkClick}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Consultant
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/billing" onClick={handleLinkClick}>Billing</Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/chat" onClick={handleLinkClick} className="flex items-center w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Chat</span>
                      <NotificationBadge className="ml-auto" />
                    </Link>
                  </Button>
                  {roles.includes('admin') && (
                    <Button variant="ghost" asChild className="justify-start">
                      <Link to="/admin" onClick={handleLinkClick}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <Button asChild className="w-full">
                  <Link to="/auth" onClick={handleLinkClick}>Sign In</Link>
                </Button>
              )}
            </nav>
          </div>
          {user && (
            <div className="mt-auto">
              <Separator />
              <div className="py-4 space-y-2">
                <Button variant="ghost" asChild className="justify-start w-full">
                  <Link to="/profile" onClick={handleLinkClick}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button variant="ghost" onClick={handleSignOut} className="justify-start w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/90 transition-colors font-serif">
          <Heart className="h-7 w-7 text-calming-green" />
          <span className="hidden md:inline-block">ZenJourney</span>
          <span className="md:hidden text-base font-bold">ZenJourney</span>
        </Link>
        
        <>
          <DesktopNav />
          <MobileNav />
        </>
      </div>
    </header>
  );
};
