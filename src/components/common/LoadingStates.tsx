import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

// Main app loading screen
export const AppLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading PPM Tools</h2>
        <p className="text-gray-600 mb-8">Preparing your personalized comparison experience...</p>
        
        {/* Progress dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton for criteria section
export const CriteriaSkeletonLoader: React.FC = () => {
  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
          <div className="w-24 h-6 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="w-32 h-8 bg-gray-300 rounded-lg animate-pulse" />
      </div>
      
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-32 h-5 bg-gray-300 rounded animate-pulse" />
            <div className="w-8 h-5 bg-gray-300 rounded animate-pulse" />
          </div>
          <div className="w-full h-6 bg-gray-200 rounded-full">
            <div className="h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full animate-shimmer bg-[length:200%_100%]" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for tool cards
export const ToolCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-300 rounded-xl animate-pulse" />
          <div>
            <div className="w-24 h-5 bg-gray-300 rounded animate-pulse mb-2" />
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-12 h-8 bg-gray-300 rounded-lg animate-pulse" />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
      
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Skeleton for tool list
export const ToolListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
          <div className="w-48 h-6 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="w-24 h-8 bg-gray-300 rounded-lg animate-pulse" />
      </div>
      
      {[...Array(6)].map((_, i) => (
        <ToolCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Skeleton for chart section
export const ChartSkeletonLoader: React.FC = () => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
          <div className="w-32 h-6 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="w-24 h-8 bg-gray-300 rounded-lg animate-pulse" />
      </div>
      
      {/* Mock chart area */}
      <div className="relative w-full h-80 bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="w-48 h-48 border-4 border-gray-300 border-dashed rounded-full flex items-center justify-center">
          <div className="w-24 h-24 border-2 border-gray-400 border-dashed rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Mock legend */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Skeleton for recommendations
export const RecommendationsSkeleton: React.FC = () => {
  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
          <div className="w-40 h-6 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
      
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-32 h-6 bg-gray-300 rounded animate-pulse" />
              {i < 3 && (
                <div className="w-8 h-8 bg-yellow-300 rounded-full animate-pulse" />
              )}
            </div>
            <div className="text-right">
              <div className="w-16 h-6 bg-gray-300 rounded animate-pulse mb-1" />
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex justify-between items-center">
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading spinner component
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`} />
  );
};

// Loading button state
export const LoadingButton: React.FC<{ 
  children: React.ReactNode; 
  loading?: boolean; 
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ 
  children, 
  loading = false, 
  className = '', 
  onClick,
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative flex items-center justify-center ${className} ${
        loading || disabled ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

// Page transition loading
export const PageTransitionLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4 mx-auto" />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};

// Data fetching loading overlay
export const DataLoadingOverlay: React.FC<{ message?: string }> = ({ 
  message = "Loading data..." 
}) => {
  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="glass-card p-6 text-center">
        <LoadingSpinner size="lg" className="mb-4 mx-auto" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Skeleton wrapper for progressive loading
export const SkeletonWrapper: React.FC<{ 
  loading: boolean; 
  skeleton: React.ReactNode; 
  children: React.ReactNode;
  className?: string;
}> = ({ loading, skeleton, children, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {loading ? skeleton : children}
    </div>
  );
}; 