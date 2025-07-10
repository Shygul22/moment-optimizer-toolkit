
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-warm-sage/5">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-calming-green" />
            <span className="font-serif text-trust-navy font-semibold">ZenJourney</span>
          </div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} ZenJourney.in - Your Path to Inner Peace. All Rights Reserved.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <Link to="/contact" className="hover:text-calming-green transition-colors">
            Connect
          </Link>
          <span className="mx-2">|</span>
          <Link to="/privacy" className="hover:text-calming-green transition-colors">
            Privacy
          </Link>
          <span className="mx-2">|</span>
          <Link to="/terms" className="hover:text-calming-green transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
