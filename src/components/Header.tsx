
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Feather, Search } from "lucide-react";
import UserNav from "./UserNav";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/poems", label: "Browse Poems" },
  { to: "/contests", label: "Contests" },
];

const Header = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/poems?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-background/70 backdrop-blur-xl sticky top-0 z-50 border-b border-foreground/10">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Feather className="h-6 w-6" />
            <span>Ink Reverie</span>
          </Link>
          
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-muted-foreground hover:text-primary transition-colors ${
                    isActive ? "text-primary font-semibold" : ""
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Quick search - hidden on mobile */}
          <form onSubmit={handleQuickSearch} className="hidden md:flex items-center gap-2 max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Quick search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-40 lg:w-48"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            {session && (
              <>
                <Button asChild size="sm" className="hidden md:inline-flex bg-primary hover:bg-primary/90 ml-2">
                  <Link to="/submit-poem">Submit Poem</Link>
                </Button>
                <Button asChild size="icon" className="md:hidden bg-primary" title="Submit Poem">
                  <Link to="/submit-poem">
                    <span className="sr-only">Submit Poem</span>
                    <Feather className="h-5 w-5" />
                  </Link>
                </Button>
              </>
            )}
            <UserNav />
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-4">
          <div className="flex items-center space-x-4 mb-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm text-muted-foreground hover:text-primary transition-colors ${
                    isActive ? "text-primary font-semibold" : ""
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          
          {/* Mobile search */}
          <form onSubmit={handleQuickSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search poems and poets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
        </div>
      </nav>
    </header>
  );
};

export default Header;
