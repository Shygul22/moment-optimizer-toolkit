import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, MessageCircle, Shield, Heart, BarChart3, Menu } from 'lucide-react';
import { NotificationBadge } from '../../components/chat/NotificationBadge';
import { useChatNotifications } from '../../hooks/useChatNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../components/ui/sheet';
import { Separator } from '../../components/ui/separator';

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
    <nav className="hidden md:flex items-center space-x-4">
      <Link to="/consultants" className="text-sm font-bold hover:text-primary/80 transition-colors">
        Consultants
      </Link>
      {user && (
        <>
          <Link to="/chat" className="relative hover:text-primary/80 transition-colors">
            <MessageCircle className="h-5 w-5" />
            <NotificationBadge />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-1 h-auto w-auto">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { navigate('/profile'); }}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigate('/billing'); }}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Billing
              </DropdownMenuItem>
              {roles.includes('admin') && (
                <DropdownMenuItem onClick={() => { navigate('/admin'); }}>
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              <Separator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
      {!user && (
        <Link to="/auth" className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          Get Started
        </Link>
      )}
    </nav>
  );

  const MobileNav = () => (
    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden p-1 h-auto w-auto">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:w-2/3 md:w-1/3">
        <SheetHeader className="text-left">
          <SheetTitle>ZenJourney</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Link to="/consultants" onClick={handleLinkClick} className="block text-sm font-bold hover:text-primary/80 transition-colors py-2">
            Consultants
          </Link>
          {user && (
            <>
              <Link to="/chat" onClick={handleLinkClick} className="relative block hover:text-primary/80 transition-colors py-2">
                Chat
                <NotificationBadge />
              </Link>
              <Link to="/profile" onClick={handleLinkClick} className="block text-sm font-bold hover:text-primary/80 transition-colors py-2">
                Profile
              </Link>
              <Link to="/billing" onClick={handleLinkClick} className="block text-sm font-bold hover:text-primary/80 transition-colors py-2">
                Billing
              </Link>
              {roles.includes('admin') && (
                <Link to="/admin" onClick={handleLinkClick} className="block text-sm font-bold hover:text-primary/80 transition-colors py-2">
                  Admin Dashboard
                </Link>
              )}
              <Separator />
              <Button variant="destructive" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          )}
          {!user && (
            <Link to="/auth" onClick={handleLinkClick} className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Get Started
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
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
