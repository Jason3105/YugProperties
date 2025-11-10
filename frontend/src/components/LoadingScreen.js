import React from 'react';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        {/* Logo with pulse animation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-ping opacity-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
          </div>
          <img 
            src="/logo.png" 
            alt="Yug Properties" 
            className="w-20 h-20 object-contain mx-auto animate-bounce relative z-10"
            style={{
              animationDuration: '1.5s'
            }}
          />
        </div>
        
        {/* Brand text with gradient */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-3 animate-pulse">
          Yug Properties
        </h2>
        
        {/* Loading message */}
        <p className="text-muted-foreground text-sm">{message}</p>
        
        {/* Loading dots animation */}
        <div className="flex justify-center items-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
