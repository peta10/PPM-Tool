import React from 'react';
import { Boxes, LogOut, Settings, Sparkles, Crown } from 'lucide-react';
import { AuthMenu } from '@/components/auth/AuthMenu';
import { useAuth } from '@/shared/hooks/useAuth';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white shadow-lg">
      {/* Premium background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:16px_16px]" />
      
      <div className="relative container mx-auto">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and title */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center hover:opacity-90 transition-opacity duration-200 group">
                <div className="relative mr-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                    <Boxes className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    PPM Tool Finder
                  </h1>
                  <p className="text-blue-100 text-sm leading-tight">
                    Find the perfect Project Portfolio Management tool for your needs
                  </p>
                </div>
              </Link>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              {/* Premium badge for admin users */}
              {isAdmin && (
                <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">Admin</span>
                </div>
              )}
              
              {/* Admin Dashboard Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
                </Link>
              )}
              
              {/* Authentication */}
              <div className="flex items-center">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-white">
                        {user.email}
                      </div>
                      <div className="text-xs text-blue-100">
                        {isAdmin ? 'Administrator' : 'User'}
                      </div>
                    </div>
                    <button
                      onClick={signOut}
                      className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <AuthMenu user={user} onSignOut={signOut} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Premium bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
    </header>
  );
};