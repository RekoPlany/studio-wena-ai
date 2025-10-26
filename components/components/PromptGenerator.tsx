import React, { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { ActionButton } from './ActionButton';
import { ImageDisplay } from './ImageDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { fileToBase64, downloadImage } from '../utils/fileUtils';
import { generateStyledImageWithPrompt } from '../services/geminiService';

interface UploadedImage {
  base64: string;
  mimeType: string;
  name: string;
}

const CopyIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

interface PromptDisplayProps {
  promptText: string | null;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ promptText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (promptText) {
      navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!promptText) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mt-6 relative">
      <h4 className="text-sm font-semibold text-gray-300 mb-2">پڕۆمپتی دروستکەری AI:</h4>
      <p className="text-gray-400 text-sm whitespace-pre-wrap font-mono pr-10 leading-relaxed">{promptText}</p>
      <button onClick={handleCopy} title="کۆپیکردنی پڕۆمپت" className="absolute top-3 right-3 p-1 text-gray-400 hover:text-cyan-400 transition-colors duration-200" aria-label="کۆپیکردنی پڕۆمپت">
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
};


export const PromptGenerator: React.FC = () => {
    const [styleImage, setStyleImage] = useState<UploadedImage | null>(null);
    const [personImage, setPersonImage] = useState<UploadedImage | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (type: 'style' | 'person') => async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                const newImage = { base64, mimeType: file.type, name: file.name };
                if (type === 'style') {
                    setStyleImage(newImage);
                } else {
                    setPersonImage(newImage);
                }
                setGeneratedImage(null);
                setGeneratedPrompt(null);
                setError(null);
            } catch (err) {
                setError('خوێندنەوەی فایلی وێنەکە سەرکەوتوو نەبوو. تکایە یەکێکی تر تاقی بکەرەوە.');
                console.error(err);
            }
        }
    };
    
    const handleGenerate = useCallback(async () => {
        if (!styleImage || !personImage) {
            setError('تکایە هەردوو وێنەی ستایل و کەسەکە باربکە.');
            return;
        }

        setIsLoading(true);
        setGeneratedImage(null);
        setGeneratedPrompt(null);
        setError(null);

        try {
            const result = await generateStyledImageWithPrompt(styleImage, personImage);
            setGeneratedImage(result.image);
            setGeneratedPrompt(result.prompt);
        } catch (err: any) {
            console.error('Error from Gemini API:', err);
            setError(`هەڵەیەک ڕوویدا: ${err.message || 'تکایە دووبارە هەوڵبدەرەوە.'}`);
        } finally {
            setIsLoading(false);
        }
    }, [styleImage, personImage]);

    const handleDownloadGeneratedImage = useCallback(() => {
        if (generatedImage && styleImage && personImage) {
            const styleName = styleImage.name.split('.').slice(0, -1).join('.') || 'style';
            const personName = personImage.name.split('.').slice(0, -1).join('.') || 'person';
            const newFilename = `generated-from-${styleName}-and-${personName}.png`;
            downloadImage(generatedImage, newFilename);
        }
    }, [generatedImage, styleImage, personImage]);

    return (
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg">
                <h2 className="text-2xl font-bold text-cyan-400 tracking-wide">١. بارکردنی وێنەکان</h2>
                <div className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                           وێنەی ستایل <span className="text-xs text-gray-500">(بۆ نموونە: تابلۆ، دیمەنی فیلم)</span>
                        </label>
                        <ImageUploader id="style-image-upload" onImageUpload={handleImageUpload('style')} hasImage={!!styleImage} imageName={styleImage?.name} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            وێنەکەی تۆ <span className="text-xs text-gray-500">(ئەو وێنەیەی کە دەگۆڕدرێت)</span>
                        </label>
                        <ImageUploader id="person-image-upload" onImageUpload={handleImageUpload('person')} hasImage={!!personImage} imageName={personImage?.name} />
                    </div>
                </div>
                 <div className="mt-auto pt-4">
                    <ActionButton
                        onClick={handleGenerate}
                        disabled={!styleImage || !personImage || isLoading}
                    >
                        {isLoading ? '...دروست دەکرێت' : 'وێنەکە دروست بکە'}
                    </ActionButton>
                </div>
            </div>

            <div className="flex flex-col gap-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg min-h-[400px] lg:min-h-0">
               <h2 className="text-2xl font-bold text-cyan-400 tracking-wide">٢. بینینی ئەنجام</h2>
               <div className="flex-grow w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden relative">
                    {isLoading && <LoadingSpinner />}
                    {!isLoading && error && (
                       <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                         <p className="font-semibold">هەڵە</p>
                         <p className="text-sm">{error}</p>
                       </div>
                    )}
                    {!isLoading && !error && (
                        <ImageDisplay title="دروستکراو" imageUrl={generatedImage} onDownload={handleDownloadGeneratedImage} />
                    )}
               </div>
               {!isLoading && !error && generatedPrompt && (
                   <PromptDisplay promptText={generatedPrompt} />
               )}
            </div>
        </main>
    );
};
