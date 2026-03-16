import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Truck, Package, Calculator, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const servicesLinks = [
    { name: "General Parcel", path: "/services/general-parcel", icon: Package },
    { name: "Full Truck Load", path: "/services/full-truck-load", icon: Truck },
  ];

  const requestLinks = [
    { name: "Request General Parcel", path: "/request/general-parcel", icon: Package },
    { name: "Request Full Truck Load", path: "/request/full-truck-load", icon: Truck },
  ];

  const quickLinks = [
    { name: "Get Quote", path: "/quote", icon: Calculator },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container-logistics">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Siegma Logistics" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-primary">Siegma</span>
              <span className="text-xs text-muted-foreground -mt-1">Logistics Pvt Ltd</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.slice(0, 1).map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="nav"
                  className={isActive(link.path) ? "text-accent" : ""}
                >
                  {link.name}
                </Button>
              </Link>
            ))}

            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="nav" className="gap-1">
                  Services <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {servicesLinks.map((link) => (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link to={link.path} className="flex items-center gap-2 cursor-pointer">
                      <link.icon className="w-4 h-4 text-accent" />
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Request Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="nav" className="gap-1">
                  Request Service <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {requestLinks.map((link) => (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link to={link.path} className="flex items-center gap-2 cursor-pointer">
                      <link.icon className="w-4 h-4 text-accent" />
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Actions */}
            {quickLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="nav"
                  className={`gap-2 ${isActive(link.path) ? "text-accent" : ""}`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Button>
              </Link>
            ))}

            {navLinks.slice(1).map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="nav"
                  className={isActive(link.path) ? "text-accent" : ""}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="nav-cta" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    {user?.name || "Account"}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to={user?.role === "admin" ? "/admin/dashboard" : "/customer/dashboard"} className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="nav-cta">Login / Get Started</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:text-accent transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.slice(0, 1).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? "bg-accent/10 text-accent"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="px-4 py-2">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Services
                </span>
              </div>
              {servicesLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 pl-8 rounded-lg text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <link.icon className="w-4 h-4 text-accent" />
                  {link.name}
                </Link>
              ))}

              <div className="px-4 py-2 mt-2">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Request Service
                </span>
              </div>
              {requestLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 pl-8 rounded-lg text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <link.icon className="w-4 h-4 text-accent" />
                  {link.name}
                </Link>
              ))}

              <div className="px-4 py-2 mt-2">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </span>
              </div>
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 pl-8 rounded-lg text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <link.icon className="w-4 h-4 text-accent" />
                  {link.name}
                </Link>
              ))}

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? "bg-accent/10 text-accent"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="px-4 pt-4">
                {isAuthenticated ? (
                  <>
                    <Link to={user?.role === "admin" ? "/admin/dashboard" : "/customer/dashboard"} onClick={() => setIsMenuOpen(false)}>
                      <Button variant="nav-cta" className="w-full gap-2 mb-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full gap-2 text-red-600" onClick={() => { logout(); setIsMenuOpen(false); }}>
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="nav-cta" className="w-full">
                      Login / Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
