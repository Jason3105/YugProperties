import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import { Moon, Sun, Menu, X, Home, LogIn, UserPlus, LayoutDashboard, Building2, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if we're on admin dashboard or other admin pages
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // Check if we're on property details page
  const isPropertyDetailsPage = location.pathname.startsWith('/properties/');
  
  // Check if we're on profile page
  const isProfilePage = location.pathname === '/profile';
  
  // Check if we're on properties listing page (for white hover text on orange bg)
  const isPropertiesPage = location.pathname === '/properties';
  
  // Check if we're on home page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isAdminPage || isPropertyDetailsPage || isProfilePage
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="Yug Properties" 
              className={`w-10 h-10 object-contain transition-all duration-300 ${
                (isScrolled || isAdminPage || isPropertyDetailsPage || isProfilePage) ? '' : 'brightness-0 invert'
              }`}
            />
            <span className={`text-xl font-bold transition-all duration-300 ${
              (isScrolled || isAdminPage || isPropertyDetailsPage || isProfilePage)
                ? 'bg-gradient-to-r from-[#FFA500] to-[#FF8C00] bg-clip-text text-transparent'
                : 'text-white'
            }`}>
              Yug Properties
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`flex items-center space-x-1 transition-colors ${
              (isHomePage || isPropertiesPage) && !isScrolled
                ? 'text-white hover:text-white/80'
                : 'text-foreground hover:text-primary'
            }`}>
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link to="/properties" className={`flex items-center space-x-1 transition-colors ${
              (isHomePage || isPropertiesPage) && !isScrolled
                ? 'text-white hover:text-white/80'
                : 'text-foreground hover:text-primary'
            }`}>
              <Building2 className="w-4 h-4" />
              <span>Properties</span>
            </Link>
            
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/profile'}
                  className={`flex items-center space-x-1 transition-colors ${
                    (isHomePage || isPropertiesPage) && !isScrolled
                      ? 'text-white hover:text-white/80'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {user.role === 'admin' ? (
                    <><LayoutDashboard className="w-4 h-4" /><span>Dashboard</span></>
                  ) : (
                    <><User className="w-4 h-4" /><span>Profile</span></>
                  )}
                </Link>
                <Button 
                  onClick={handleLogout} 
                  variant={(isHomePage || isPropertiesPage) && !isScrolled ? "default" : "outline"}
                  size="sm" 
                  className={
                    (isHomePage || isPropertiesPage) && !isScrolled
                      ? 'bg-white text-orange-600 hover:bg-white/90 border-0'
                      : ''
                  }
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className={`flex items-center space-x-1 ${
                    (isHomePage || isPropertiesPage) && !isScrolled
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : ''
                  }`}>
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className={`flex items-center space-x-1 ${
                    (isHomePage || isPropertiesPage) && !isScrolled
                      ? 'bg-white text-orange-600 hover:bg-white/90'
                      : ''
                  }`}>
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Button>
                </Link>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`ml-2 ${
                (isHomePage || isPropertiesPage) && !isScrolled
                  ? 'text-white hover:text-white/80 hover:bg-white/10'
                  : ''
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={
                (isHomePage || isPropertiesPage) && !isScrolled
                  ? 'text-white hover:text-white/80 hover:bg-white/10'
                  : ''
              }
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={
                (isHomePage || isPropertiesPage) && !isScrolled
                  ? 'text-white hover:text-white/80 hover:bg-white/10'
                  : ''
              }
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              
              <Link
                to="/properties"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Properties</span>
              </Link>
              
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : '/profile'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    {user.role === 'admin' ? (
                      <><LayoutDashboard className="w-4 h-4" /><span>Dashboard</span></>
                    ) : (
                      <><User className="w-4 h-4" /><span>Profile</span></>
                    )}
                  </Link>
                  <Button onClick={handleLogout} variant="outline" className="mx-4">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-foreground hover:bg-accent rounded-md transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="mx-4 w-auto flex items-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
