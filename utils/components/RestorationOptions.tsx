import React from 'react';

interface RestorationOptionsProps {
  options: string[];
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
}

const optionTooltips: { [key: string]: string } = {
  'پاککردنەوەی شوخت و ژاوەژاو': 'تۆز و شوخت و دانەوێڵەی وێنە کۆنەکان لادەبات.',
  'چاککردنی دڕاوی و شوێنە زیانلێکەوتووەکان': 'بە شێوەیەکی زیرەکانە بەشە ونبوو یان دڕاوەکانی وێنەکە دروست دەکاتەوە.',
  'ڕەنگکردنی وێنەی ڕەش و سپی': 'ڕەنگی వాقیعی بۆ وێنە یەک-ڕەنگەکان زیاد دەکات.',
  'باشترکردنی وردەکاری و ڕووناکی': 'فۆکەس، ڕووناکی و کۆنتراست باشتر دەکات بۆ وێنەیەکی ڕوونتر.',
};

export const RestorationOptions: React.FC<RestorationOptionsProps> = ({ options, selectedOptions, onToggleOption }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        ئەرکە باوەکانی چاککردنەوە هەڵبژێرە:
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onToggleOption(option)}
            title={optionTooltips[option] || ''}
            type="button"
            className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
              selectedOptions.includes(option)
                ? 'bg-cyan-500 border-cyan-400 text-gray-900 shadow-md'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
