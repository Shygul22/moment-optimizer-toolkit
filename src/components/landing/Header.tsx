
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/90 transition-colors">
            <Heart className="h-7 w-7 text-calming-green" />
            <span className="hidden md:inline-block font-serif">ZenJourney</span>
            <span className="md:hidden text-base font-bold font-serif">ZenJourney</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <nav className="hidden md:flex">
            <Button asChild className="bg-therapy-gradient hover:opacity-90">
              <Link to="/auth">Begin Your Journey</Link>
            </Button>
          </nav>
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>
                    <Link
                      to="/"
                      className="flex items-center gap-2 text-xl font-bold text-primary font-serif"
                      onClick={handleLinkClick}
                    >
                      <Heart className="h-7 w-7 text-calming-green" />
                      <span>ZenJourney</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <nav className="flex flex-col space-y-2">
                    <Button asChild className="w-full bg-therapy-gradient hover:opacity-90">
                      <Link to="/auth" onClick={handleLinkClick}>Begin Your Journey</Link>
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
