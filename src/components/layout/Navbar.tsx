
import React from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Sun, Tractor, Users } from "lucide-react";
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
              <div className="flex flex-col">
                <span className="text-xl font-bold text-agrifirm-black">AGNES</span>
                <span className="text-xs text-agrifirm-green -mt-1">Farmer Portal</span>
              </div>
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
            <div className="flex items-center space-x-4">
              <Link to="/advisor" className="text-agrifirm-black hover:text-agrifirm-green font-medium px-2 py-1 flex items-center">
                <Users size={16} className="mr-2" />
                Switch to Advisor View
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full bg-agrifirm-light-yellow/50 hover:bg-agrifirm-light-yellow text-agrifirm-black"
              >
                <Sun size={18} />
              </Button>
            </div>
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
                to="/advisor" 
                className="text-agrifirm-black hover:text-agrifirm-green font-medium px-2 py-1 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users size={16} className="mr-2" />
                Switch to Advisor View
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
