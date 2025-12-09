import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'warning' | 'luxury';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-50 dark:focus:ring-offset-zinc-950 focus:ring-zinc-500 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    // Primary: Inverts based on theme for max contrast. 
    // Light Mode: Black bg, White text. Dark Mode: White bg, Black text.
    primary: "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 border border-transparent shadow-md",
    
    // Secondary: Subtle backgrounds
    secondary: "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 border border-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:border-zinc-700",
    
    // Actions: Rich colors that work on both, slightly adjusted for light mode borders
    danger: "bg-red-900 text-white hover:bg-red-800 border border-red-800 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-900",
    success: "bg-emerald-900 text-white hover:bg-emerald-800 border border-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:border-emerald-900",
    warning: "bg-amber-900 text-white hover:bg-amber-800 border border-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900 dark:border-amber-900",
    
    outline: "border border-zinc-300 bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-black hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white dark:hover:border-zinc-500",
    
    luxury: "bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-800 text-white border border-zinc-700 hover:from-zinc-700 hover:via-zinc-500 hover:to-zinc-700 dark:from-zinc-700 dark:via-zinc-500 dark:to-zinc-700"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};