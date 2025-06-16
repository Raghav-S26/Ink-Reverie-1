
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UserNav from "./UserNav";
import NotificationDropdown from "./NotificationDropdown";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold font-serif text-primary">
              Ink Reverie
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link 
                to="/poems" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Browse Poems
              </Link>
              <Link 
                to="/contests" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Contests
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/submit-poem">Submit Poem</Link>
            </Button>
            <NotificationDropdown />
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
