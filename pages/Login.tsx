import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNetwork } from '../contexts/NetworkContext';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { showNetworkAlert } = useNetwork();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check network and show alert if poor
    showNetworkAlert();

    setLoading(true);
    try {
      const user = await login({ identifier: email, password });
      if (user.role === UserRole.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/member');
      }
    } catch (error) {
      console.error('Login failed', error);
      toast.error('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display">
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="flex w-full max-w-md flex-col items-center">
            <div className="flex items-center gap-3 pb-8">
              <span className="material-symbols-outlined text-primary text-4xl">account_balance</span>
              <h1 className="font-heading text-4xl font-bold text-primary">DPA</h1>
            </div>
            <div className="w-full rounded-xl border border-gray-200/50 bg-white p-6 shadow-sm dark:border-gray-700/50 dark:bg-gray-800/20 sm:p-8">
              <div className="text-center">
                <h2 className="text-gray-900 dark:text-white font-heading text-2xl font-bold tracking-tight">Sign in to your Account</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Welcome back! Please enter your details.</p>
              </div>
              <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-6">
                <label className="flex flex-col">
                  <p className="text-gray-700 dark:text-gray-200 pb-2 text-sm font-medium leading-normal">Email or Member ID</p>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-gray-400">person</span>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 bg-background-light p-3 pl-10 text-sm font-normal leading-normal text-gray-700 placeholder:text-gray-400 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-background-dark dark:text-white dark:placeholder:text-gray-500"
                      placeholder="Enter your email or Member ID"
                      required
                    />
                  </div>
                </label>
                <label className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700 dark:text-gray-200 pb-2 text-sm font-medium leading-normal">Password</p>
                    <a className="text-sm font-medium text-primary hover:underline" href="#">Forgot Password?</a>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-gray-400">lock</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 bg-background-light p-3 pl-10 text-sm font-normal leading-normal text-gray-700 placeholder:text-gray-400 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-background-dark dark:text-white dark:placeholder:text-gray-500"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <span className="truncate">Login</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;