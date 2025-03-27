
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LucideLogOut, LucideUser, LucideClipboardList, LucideBook, LucideSettings, LucideMoon, LucideSun } from 'lucide-react';

const NavBar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    ...(user.role === 'student' ? [
      { path: '/student', label: 'Dashboard', icon: <LucideClipboardList className="mr-2 h-4 w-4" /> },
    ] : []),
    ...(user.role === 'teacher' || user.role === 'admin' ? [
      { path: '/teacher', label: 'Grading', icon: <LucideClipboardList className="mr-2 h-4 w-4" /> },
      { path: '/teacher/history', label: 'History', icon: <LucideBook className="mr-2 h-4 w-4" /> },
    ] : []),
    ...(user.role === 'admin' ? [
      { path: '/admin', label: 'Admin', icon: <LucideSettings className="mr-2 h-4 w-4" /> },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-border animate-slide-down">
      <div className="container h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-lg font-medium flex items-center"
          >
            Student Dashboard
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive(item.path) ? "default" : "ghost"} 
                  size="sm"
                  className={`relative ${isActive(item.path) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  {item.icon}
                  {item.label}
                  {isActive(item.path) && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-primary w-full"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={toggleTheme} 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <LucideMoon className="h-4 w-4" />
            ) : (
              <LucideSun className="h-4 w-4" />
            )}
          </Button>
          
          <span className="text-sm font-medium hidden sm:inline-block">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Welcome,</span>
              <span>{user.name}</span>
              <LucideUser className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </span>
          
          <Button onClick={logout} variant="ghost" size="sm" className="gap-1.5">
            <LucideLogOut className="h-4 w-4" />
            <span className="hidden sm:inline-block">Log out</span>
          </Button>
        </div>
      </div>
      
      <div className="md:hidden overflow-auto scrollbar-hidden">
        <div className="flex px-4 py-2 gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex-shrink-0">
              <Button 
                variant={isActive(item.path) ? "default" : "ghost"} 
                size="sm"
                className={`relative ${isActive(item.path) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                {item.icon}
                {item.label}
                {isActive(item.path) && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-primary w-full"
                    layoutId="navbar-indicator-mobile"
                  />
                )}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
