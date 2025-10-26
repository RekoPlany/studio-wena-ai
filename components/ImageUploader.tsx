import React from 'react';

interface ImageUploaderProps {
  id: string;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  imageName?: string;
  hasImage: boolean;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, onImageUpload, imageName, hasImage }) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/50 hover:border-cyan-500 transition-all duration-300"
      >
        <div className="flex items-center">
            {hasImage ? <CheckIcon /> : <UploadIcon />}
            <span className="font-semibold text-gray-300">
              {hasImage ? 'وێنە هەڵبژێردرا' : 'وێنەیەک هەڵبژێرە'}
            </span>
        </div>
        {imageName && <p className="text-sm text-gray-400 mt-2 truncate max-w-full">{imageName}</p>}
        <input id={id} type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={onImageUpload} />
      </label>
    </div>
  );
};
