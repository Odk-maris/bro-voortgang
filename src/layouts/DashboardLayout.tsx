
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: Array<'student' | 'teacher' | 'admin'>;
}

const DashboardLayout = ({ children, allowedRoles = [] }: DashboardLayoutProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if user is not authenticated or doesn't have the allowed role
    if (!loading && (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role)))) {
      navigate('/');
    }
  }, [user, loading, navigate, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <motion.main 
        className="flex-1" 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
