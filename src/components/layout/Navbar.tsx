
import React from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Sun, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-agrifirm-light-green/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Tractor className="h-8 w-8 text-agrifirm-green" />
              <span className="text-xl font-bold text-agrifirm-black">Crop Compass</span>
            </Link>
          </div>

          {isMobile ? (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-agrifirm-black"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          ) : (
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-agrifirm-black hover:text-agrifirm-green font-medium">
                Dashboard
              </Link>
              <Link to="/planning" className="text-agrifirm-black hover:text-agrifirm-green font-medium">
                Planning
              </Link>
              <Link to="/chat" className="text-agrifirm-black hover:text-agrifirm-green font-medium">
                Ask Agnes
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full bg-agrifirm-light-yellow/50 hover:bg-agrifirm-light-yellow text-agrifirm-black"
              >
                <Sun size={18} />
              </Button>
            </nav>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="py-4 border-t border-agrifirm-light-green/20 animate-fade-in">
            <nav className="flex flex-col space-y-4 pb-4">
              <Link 
                to="/" 
                className="text-agrifirm-black hover:text-agrifirm-green font-medium px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/planning" 
                className="text-agrifirm-black hover:text-agrifirm-green font-medium px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Planning
              </Link>
              <Link 
                to="/chat" 
                className="text-agrifirm-black hover:text-agrifirm-green font-medium px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Ask Agnes
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
