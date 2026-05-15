import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import { Button } from '@/components/ui/button';
import { 
  Menu, X, Wallet, LogOut, User, Moon, Sun, 
  CreditCard, PieChart, LifeBuoy, ChevronDown 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from '@/components/Logo.jsx';

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const publicLinks = [
    { name: 'Home', path: '/' },
  ];

  // 1. Reducimos los enlaces principales a lo esencial
  const authenticatedLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Transacciones', path: '/transactions' },
    { name: 'Presupuestos', path: '/budgets' },
    { name: 'Metas', path: '/savings-goals' },
  ];

  // 2. Definimos los enlaces secundarios para el menú móvil
  const secondaryLinks = [
    { name: 'Mis Cuentas', path: '/accounts', icon: CreditCard },
    { name: 'Resumen Mensual', path: '/monthly-summary', icon: PieChart },
    { name: 'Soporte', path: '/support', icon: LifeBuoy },
  ];

  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-xl font-bold tracking-tight text-zinc-100">
                Lobo<span className="text-emerald-500">Wallet</span>
              </span>
            </div>          
          </Link>

          {/* Nav Desktop Principal */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                  location.pathname === link.path
                    ? 'text-emerald-500'
                    : 'text-zinc-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Acciones Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full transition-transform hover:scale-105 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              /* 3. El Menú Desplegable (Hub de configuraciones) */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span className="hidden lg:inline-block max-w-[100px] truncate">
                      {currentUser?.name || currentUser?.email}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-100">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                      <p className="text-xs leading-none text-zinc-500">{currentUser?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  
                  {/* Enlaces al Hub */}
                  {secondaryLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <DropdownMenuItem key={link.path} asChild className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer">
                        <Link to={link.path} className="w-full flex items-center">
                          <Icon className="w-4 h-4 mr-2 text-zinc-400" />
                          {link.name}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 cursor-pointer font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Botón Menú Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full text-zinc-400"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menú Desplegable Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800 bg-zinc-950 transition-colors duration-300">
            <nav className="flex flex-col gap-2">
              <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Principal</p>
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg mx-2 hover:bg-zinc-800/50 ${
                    location.pathname === link.path
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-zinc-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {!isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-zinc-800 px-4">
                  <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)} className="w-full border-zinc-700 text-zinc-300">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild onClick={() => setMobileMenuOpen(false)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-4 mb-2">Mi Cuenta</p>
                  {secondaryLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors rounded-lg mx-2 hover:bg-zinc-800/50 ${
                          location.pathname === link.path
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-zinc-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.name}
                      </Link>
                    );
                  })}
                  
                  <div className="pt-4 mt-2 border-t border-zinc-800 px-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" 
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;