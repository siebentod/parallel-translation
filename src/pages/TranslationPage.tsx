import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTextStore } from 'src/hooks/useTextStore';
import TranslationSection from 'src/components/translation-section';

export default function TranslationPage() {
  const { basename, language } = useParams<{ basename: string; language: string }>();
  const { openTranslation, isDataLoaded } = useTextStore();

  useEffect(() => {
    if (basename && language && isDataLoaded) {
      openTranslation(basename, language);
    }
  }, [basename, language, openTranslation, isDataLoaded]);

  if (!isDataLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading translations...</div>
      </div>
    );
  }

  if (!basename || !language) {
    return null;
  }

  return <TranslationSection />;
}

