import React from 'react';
import { SpinnerIcon } from '../constants';

interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = "Cargando...", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex flex-col items-center justify-center z-50">
        <SpinnerIcon className="w-12 h-12 text-indigo-500" />
        <p className="mt-4 text-xl text-slate-200">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <SpinnerIcon className="w-10 h-10 text-indigo-500" />
      {message && <p className="mt-3 text-slate-300">{message}</p>}
    </div>
  );
};

export default LoadingIndicator;