
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    await login(username, password);
    setIsLoggingIn(false);
  };

  // If user is already logged in, redirect based on role
  if (user) {
    if (user.role === 'student') return <Navigate to="/student" />;
    if (user.role === 'teacher') return <Navigate to="/teacher" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
  }

  // Demo account info for development purposes
  const demoAccounts = [
    { username: 'student1', password: 'password1', role: 'Student' },
    { username: 'teacher1', password: 'password3', role: 'Teacher' },
    { username: 'admin1', password: 'password5', role: 'Admin' },
  ];

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-white to-slate-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md">
        <motion.div
          className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/80 shadow-xl p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <motion.h1 
              className="text-2xl font-semibold tracking-tight"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Student Dashboard
            </motion.h1>
            <motion.p 
              className="text-sm text-muted-foreground mt-1"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Sign in to access your dashboard
            </motion.p>
          </div>

          <motion.form 
            onSubmit={handleLogin}
            className="space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </motion.form>

          <motion.div 
            className="mt-8 border-t pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <p className="text-xs text-center text-muted-foreground mb-3">
              Demo accounts (for testing)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {demoAccounts.map((account, i) => (
                <motion.button
                  key={account.username}
                  type="button"
                  className="flex flex-col items-center text-xs p-2 border rounded-lg hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setUsername(account.username);
                    setPassword(account.password);
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
                >
                  <span className="font-medium mb-1">{account.role}</span>
                  <span className="text-slate-500">{account.username}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
