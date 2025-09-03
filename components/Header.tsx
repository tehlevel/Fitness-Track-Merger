
import React from 'react';
import { MergeIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center">
        <MergeIcon className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-slate-800">Fitness Track Merger</h1>
      </div>
    </header>
  );
};
