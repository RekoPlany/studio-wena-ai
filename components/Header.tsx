import React from 'react';

const PhotoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface HeaderProps {
    activeView: 'restore' | 'prompt';
    setActiveView: (view: 'restore' | 'prompt') => void;
}


export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    const getButtonClass = (view: 'restore' | 'prompt') => {
        return activeView === view
          ? 'bg-cyan-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600';
    };

    return (
        <header className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
                <PhotoIcon />
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    ستۆدیۆی وێنەی AI
                </h1>
            </div>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-6">
                وێنە کۆنەکانی خێزانەکەت چاک بکەرەوە یان وێنەی داهێنەرانەی نوێ دروست بکە بە تێکەڵکردنی ستایل و بابەتەکان.
            </p>
             <div className="flex justify-center gap-2 bg-gray-800 p-1 rounded-full max-w-md mx-auto">
                <button onClick={() => setActiveView('restore')} className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${getButtonClass('restore')}`}>
                چاککەرەوەی وێنە
                </button>
                <button onClick={() => setActiveView('prompt')} className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${getButtonClass('prompt')}`}>
                دروستکەری پڕۆمپت
                </button>
            </div>
        </header>
    );
};
