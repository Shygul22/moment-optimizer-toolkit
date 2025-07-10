
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  { name: "Services", href: "#services", icon: "🔧" },
  { name: "Consultants", href: "#consultants", icon: "👥" },
  { name: "About", href: "#about", icon: "ℹ️" },
];

export function InteractiveNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = navItems.map(item => item.href.substring(1));
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.getElementById(href.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md shadow-calming border-b' 
          : 'bg-transparent'
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold transition-colors hover:text-primary/90"
        >
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.href)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeSection === item.href.substring(1)
                  ? 'bg-therapy-gradient text-white shadow-calming'
                  : 'hover:bg-warm-sage/20 hover:text-calming-green'
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
          <Button asChild className="bg-therapy-gradient hover:opacity-90 ml-4">
            <Link to="/client">Begin Your Journey</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b shadow-therapy">
          <nav className="container py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === item.href.substring(1)
                    ? 'bg-therapy-gradient text-white'
                    : 'hover:bg-warm-sage/20'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </button>
            ))}
            <Button asChild className="w-full bg-therapy-gradient hover:opacity-90 mt-4">
              <Link to="/client" onClick={() => setIsMobileMenuOpen(false)}>
                Begin Your Journey
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
