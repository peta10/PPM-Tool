import React from 'react';
import { Boxes, LogOut, Settings } from 'lucide-react';
import { AuthMenu } from './auth/AuthMenu';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="bg-alpine-blue-500 text-white">
      <div className="container mx-auto">
        <div className="px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Logo and title */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center hover:text-alpine-blue-100">
                <Boxes className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">PPM Tool Finder</h1>
                  <p className="text-alpine-blue-200 max-w-lg">Find the perfect Project Portfolio Management tool for your needs</p>
                </div>
              </Link>
            </div>
            
            {/* Controls and partner logos */}
            <div className="flex flex-col lg:flex-row items-end lg:items-center mt-4 lg:mt-0">
              {/* Panoramic Solutions - left on large screens, below on small/medium screens */}
              <a
                href="https://www.Panoramic-Solutions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg hover:bg-alpine-blue-400/50 transition-all group border border-alpine-blue-300/30 hover:border-alpine-blue-300/60 hover:shadow-lg hover:shadow-alpine-blue-400/20 hover:-translate-y-0.5 order-2 lg:order-1 w-auto mt-3 lg:mt-0"
              >
                <svg className="absolute top-1 right-1 w-3 h-3 text-alpine-blue-200 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
                <img
                  src="https://raw.githubusercontent.com/MattWags33/Assets/main/PanoramicLogoWhiteCloud.png"
                  alt="Panoramic Solutions"
                  className="w-8 h-8 lg:w-10 lg:h-10 object-contain"
                />
                <div className="ml-2">
                  <div className="text-xs text-alpine-blue-200">Powered by</div>
                  <div className="text-sm font-medium group-hover:text-white transition-colors relative">
                    Panoramic Solutions
                    <div className="h-0.5 w-0 group-hover:w-full bg-white/60 transition-all duration-300" />
                  </div>
                </div>
              </a>

              {/* Auth controls - right side */}
              <div className="flex items-center gap-3 order-1 lg:order-2 self-end lg:self-auto lg:ml-12">
                {user && isAdmin && (
                  <Link
                    to="/admin"
                    className="text-sm flex items-center px-3 py-1.5 rounded-lg bg-alpine-blue-600 hover:bg-alpine-blue-700 transition-colors shadow-sm"
                  >
                    <Settings className="w-4 h-4 mr-1.5 text-alpine-blue-200" />
                    <span>Admin</span>
                  </Link>
                )}
                
                <AuthMenu user={user} onSignOut={signOut} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};