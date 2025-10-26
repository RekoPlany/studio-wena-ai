import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ActionButton } from './components/ActionButton';
import { ImageDisplay } from './components/ImageDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { RestorationOptions } from './components/RestorationOptions';
import { PromptGenerator } from './components/PromptGenerator';
import { fileToBase64, downloadImage } from './utils/fileUtils';
import { editImageWithGemini } from './services/geminiService';

interface UploadedImage {
  base64: string;
  mimeType: string;
  name: string;
}

const restorationOptions = [
  'پاککردنەوەی شوخت و ژاوەژاو',
  'چاککردنی دڕاوی و شوێنە زیانلێکەوتووەکان',
  'ڕەنگکردنی وێنەی ڕەش و سپی',
  'باشترکردنی وردەکاری و ڕووناکی',
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'restore' | 'prompt'>('restore');

  // State and handlers for Photo Restorer
  const [originalImage, setOriginalImage] = useState<UploadedImage | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setOriginalImage({
          base64,
          mimeType: file.type,
          name: file.name,
        });
        setEditedImage(null);
        setError(null);
        setPrompt('');
        setSelectedOptions([]); // Reset on new image
      } catch (err) {
        setError('خوێندنەوەی فایلی وێنەکە سەرکەوتوو نەبوو. تکایە یەکێکی تر تاقی بکەرەوە.');
        console.error(err);
      }
    }
  };
  
  const handleToggleOption = useCallback((option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!originalImage || (selectedOptions.length === 0 && !prompt.trim())) {
      setError('تکایە وێنەیەک باربکە و ئەرکێک هەڵبژێرە یان دەستکارییەکان ڕوونبکەرەوە.');
      return;
    }

    setIsLoading(true);
    setEditedImage(null);
    setError(null);
    
    let finalPrompt = "Please edit the provided image. ";
    if (selectedOptions.length > 0) {
        finalPrompt += `Apply these restoration effects: ${selectedOptions.join(', ')}. `;
    }
    if (prompt.trim()) {
        finalPrompt += `Additionally, follow this specific instruction: "${prompt.trim()}".`;
    }

    try {
      const { base64, mimeType } = originalImage;
      const resultBase64 = await editImageWithGemini(finalPrompt, base64, mimeType);
      setEditedImage(resultBase64);
    } catch (err: any) {
      console.error('Error from Gemini API:', err);
      setError(`هەڵەیەک ڕوویدا: ${err.message || 'تکایە دووبارە هەوڵبدەرەوە.'}`);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt, selectedOptions]);

  const handleDownloadRestoredImage = useCallback(() => {
    if (editedImage && originalImage) {
        const nameWithoutExtension = originalImage.name.split('.').slice(0, -1).join('.') || 'image';
        const newFilename = `restored-${nameWithoutExtension}.png`;
        downloadImage(editedImage, newFilename);
    }
  }, [editedImage, originalImage]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header activeView={activeView} setActiveView={setActiveView} />
        {activeView === 'restore' ? (
          <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls Panel */}
            <div className="flex flex-col gap-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg">
              <h2 className="text-2xl font-bold text-cyan-400 tracking-wide">١. بارکردن و ڕوونکردنەوە</h2>
              <ImageUploader
                id="restorer-image-upload"
                onImageUpload={handleImageUpload}
                imageName={originalImage?.name}
                hasImage={!!originalImage}
              />
              {originalImage && (
                <>
                  <RestorationOptions
                    options={restorationOptions}
                    selectedOptions={selectedOptions}
                    onToggleOption={handleToggleOption}
                  />
                  <div className="mt-2">
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-400 mb-2">
                      یان ڕێنمایی وردتر زیاد بکە (بۆ نموونە: ئاسمانەکە شین بکە):
                    </label>
                    <textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="زیاتر ڕوونبکەرەوە، بۆ نموونە باکگراوندەکە لێڵ بکە..."
                      className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 resize-none text-gray-200 placeholder-gray-500"
                    />
                  </div>
                </>
              )}
              <div className="mt-auto pt-4">
                <ActionButton
                  onClick={handleGenerate}
                  disabled={!originalImage || (selectedOptions.length === 0 && !prompt.trim()) || isLoading}
                >
                  {isLoading ? '...دروست دەکرێت' : 'وێنەکە دروست بکە'}
                </ActionButton>
              </div>
            </div>

            {/* Results Panel */}
            <div className="flex flex-col gap-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg min-h-[400px] lg:min-h-0">
               <h2 className="text-2xl font-bold text-cyan-400 tracking-wide">٢. بینینی ئەنجام</h2>
               <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <ImageDisplay title="سەرەکی" imageUrl={originalImage?.base64 ?? null} />
                <div className="relative w-full h-full min-h-[250px] flex items-center justify-center">
                  {isLoading && <LoadingSpinner />}
                  {!isLoading && error && (
                     <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                       <p className="font-semibold">هەڵە</p>
                       <p className="text-sm">{error}</p>
                     </div>
                  )}
                  {!isLoading && !error && (
                    <ImageDisplay title="دەستکاریکراو" imageUrl={editedImage} onDownload={handleDownloadRestoredImage} />
                  )}
                </div>
               </div>
            </div>
          </main>
        ) : (
          <PromptGenerator />
        )}
      </div>
    </div>
  );
};

export default App;