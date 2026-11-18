
import { useState, useEffect } from "react";
import { Menu, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { count, setOpen: openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  // Inner pages have a light background, so the header is always dark there
  const solid = isScrolled || location.pathname !== "/";

  // Handle scroll effects for the header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle menu item clicks to scroll to sections
  const scrollToSection = (sectionId: string) => {
    // Close mobile menu after click
    setIsMobileMenuOpen(false);

    const scroll = () => {
      const section = document.getElementById(sectionId);
      if (section) {
        const top = section.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: "smooth" });
      }
    };

    // About / Contact live on the home page - go there first if we're on another page
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scroll, 300);
    } else {
      scroll();
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${solid ? 'bg-studio-offwhite/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-6">
          {/* Logo */}
          <div className="text-xl tracking-wider">
            <Link to="/" className={`font-light transition-colors duration-300 ${solid ? 'text-studio-dark' : 'text-studio-offwhite'}`}>
              AIDLIN <span className="font-normal">DESIGN</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link 
              to="/projects"
              className={`font-light tracking-wide transition-colors duration-300 hover:text-studio-terracotta ${solid ? 'text-studio-dark' : 'text-studio-offwhite'}`}
            >
              Projects & Exhibitions
            </Link>
            <Link 
              to="/products"
              className={`font-light tracking-wide transition-colors duration-300 hover:text-studio-terracotta ${solid ? 'text-studio-dark' : 'text-studio-offwhite'}`}
            >
              Products
            </Link>
            <button 
              className={`font-light tracking-wide transition-colors duration-300 hover:text-studio-terracotta ${solid ? 'text-studio-dark' : 'text-studio-offwhite'}`}
              onClick={() => scrollToSection('about')}
            >
              About
            </button>
            <button 
              className={`font-light tracking-wide transition-colors duration-300 hover:text-studio-terracotta ${solid ? 'text-studio-dark' : 'text-studio-offwhite'}`}
              onClick={() => scrollToSection('contact')}
            >
              Contact
            </button>
          </nav>

          {/* Cart button */}
          <button
            className={`relative p-1 ml-4 transition-colors duration-300 hover:text-studio-terracotta ${solid ? 'text-studio-dark' : 'text-studio-offwhite'}`}
            onClick={() => openCart(true)}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -top-1 -right-2 bg-studio-terracotta text-studio-offwhite text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className={`p-1 rounded-md ${solid ? 'text-studio-dark' : 'text-studio-offwhite'} focus:outline-none`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 bg-studio-offwhite shadow-md rounded-b-sm">
            <div className="flex flex-col space-y-4 px-4">
              <Link 
                to="/projects"
                className="font-light text-studio-dark hover:text-studio-terracotta text-left"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Projects & Exhibitions
              </Link>
              <Link 
                to="/products"
                className="font-light text-studio-dark hover:text-studio-terracotta text-left"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <button 
                className="font-light text-studio-dark hover:text-studio-terracotta text-left"
                onClick={() => scrollToSection('about')}
              >
                About
              </button>
              <button 
                className="font-light text-studio-dark hover:text-studio-terracotta text-left"
                onClick={() => scrollToSection('contact')}
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
