import React, { useEffect, useState } from 'react';
import { useLocation, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NavItem, UserRole } from '../types';

interface LayoutProps {
  navItems: NavItem[];
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ navItems }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (user) {
      if (user.role === UserRole.MEMBER && location.pathname.startsWith('/admin')) {
        navigate('/member');
      } else if (user.role === UserRole.ADMIN && location.pathname.startsWith('/member')) {
        navigate('/admin');
      }
    }
  }, [user, location.pathname, navigate]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
      <div className="flex min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="font-bold text-gray-900 dark:text-white">DPA Portal</span>
          </div>
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
            style={{ backgroundImage: `url("${user.avatar}")` }}
          ></div>
        </div>

        {/* Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SideNavBar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900/95 backdrop-blur-sm p-4 flex flex-col justify-between border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:bg-white dark:lg:bg-gray-900/50
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-white p-1 rounded-lg">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-gray-900 dark:text-white text-base font-bold leading-normal">DPA Portal</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-normal">{user.role === UserRole.ADMIN ? 'Administrator' : 'Member'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-2 mt-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/admin' && item.path !== '/member' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <span
                      className={`material-symbols-outlined ${item.filled ? 'fill' : ''}`}
                      style={item.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.icon}
                    </span>
                    <p className="text-sm font-medium leading-normal">{item.label}</p>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 px-3 py-2 border-t border-gray-100 dark:border-gray-800 pt-4 mb-2">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{ backgroundImage: `url("${user.avatar}")` }}
              ></div>
              <div className="flex flex-col overflow-hidden">
                <h1 className="text-gray-900 dark:text-white text-sm font-medium truncate">{user.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              <p className="text-sm font-medium leading-normal">Logout</p>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-screen pt-16 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};