import React from 'react';

interface ToastSimpleProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

export const ToastSimple: React.FC<ToastSimpleProps> = ({ message, type }) => {
  const bgColor = 
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg max-w-xs z-50`}>
      {message}
    </div>
  );
};
