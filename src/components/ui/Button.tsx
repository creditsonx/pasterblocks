import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary',
  type = 'button',
}) => {
  // Base styles
  let baseStyles = 'px-4 py-2 rounded-md transition-colors font-medium focus:outline-none ';

  // Variant styles
  if (variant === 'primary') {
    baseStyles += disabled
      ? 'bg-violet-700/50 text-violet-300/50 cursor-not-allowed'
      : 'bg-violet-700 hover:bg-violet-600 text-white';
  } else if (variant === 'secondary') {
    baseStyles += disabled
      ? 'bg-gray-700/50 text-gray-300/50 cursor-not-allowed'
      : 'bg-gray-700 hover:bg-gray-600 text-white';
  } else if (variant === 'danger') {
    baseStyles += disabled
      ? 'bg-red-700/50 text-red-300/50 cursor-not-allowed'
      : 'bg-red-700 hover:bg-red-600 text-white';
  }

  return (
    <button
      type={type}
      className={`${baseStyles} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
