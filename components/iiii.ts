import React from 'react';

interface ImageDisplayProps {
  title: string;
  imageUrl: string | null;
  onDownload?: () => void;
}

const PlaceholderIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


export const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl, onDownload }) => {
  return (
    <div className="w-full flex flex-col items-center gap-3">
      <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
      <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden relative">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
            {onDownload && (
                <button
                    onClick={onDownload}
                    title="داگرتنی وێنە"
                    className="absolute bottom-3 right-3 p-2 bg-gray-900/70 text-gray-300 rounded-full hover:bg-cyan-600/80 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                    aria-label="داگرتنی وێنە"
                >
                    <DownloadIcon />
                </button>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 flex flex-col items-center">
              <PlaceholderIcon />
              <p className="mt-2 text-sm">
                {title === 'سەرەکی' ? 'وێنەیەک باربکە' : 'وێنە دەستکاریکراوەکەت لێرە دەردەکەوێت'}
              </p>
          </div>
        )}
      </div>
    </div>
  );
};