import { Link, NavLink } from "react-router-dom";
import { Feather } from "lucide-react";
import UserNav from "./UserNav";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/poems", label: "Browse Poems" },
  { to: "/contests", label: "Contests" },
];

const Header = () => {
  const { session } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-indigo">
            <Feather className="h-6 w-6" />
            <span>Ink Reverie</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-gray-600 hover:text-brand-indigo transition-colors ${
                    isActive ? "text-brand-indigo font-semibold" : ""
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {session && (
              <Button asChild size="sm" className="bg-brand-indigo hover:bg-brand-indigo/90 ml-2">
                <Link to="/submit-poem">Submit Poem</Link>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* On mobile, also show the submit button if logged in */}
            {session && (
              <Button asChild size="icon" className="md:hidden bg-brand-indigo" title="Submit Poem">
                <Link to="/submit-poem">
                  <span className="sr-only">Submit Poem</span>
                  <Feather className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <UserNav />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
