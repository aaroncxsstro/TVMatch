import React from 'react';

const CustomButton = ({ children, onClick, className }) => {
  return (
    <button
      className={`bg-amber-800 hover:bg-amber-900 text-white font-bold py-2 px-4 rounded ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CustomButton;
