import { useNavigate } from 'react-router-dom';
import Split from 'react-split';
import MdEditor from 'src/components/md-editor';
import HomeButton from 'src/components/ui/home-button';
import { useTextStore } from 'src/hooks/useTextStore';
import DeleteLanguageButton from 'src/components/ui/delete-language-button';
import { useModalStore } from 'src/hooks/useModalStore';

const getLastPosition = (translation: string) => {
  const container = document.getElementById(translation);
  if (!container) return;

  const elements = container.querySelectorAll('.cm-gutterElement');

  let topElement = null;
  let minTop = Infinity;

  elements.forEach((el) => {
    if (el.style.visibility === 'hidden') return;
    const rect = el.getBoundingClientRect();
    const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;

    if (isVisible && rect.top < minTop) {
      minTop = rect.top;
      topElement = el;
    }
  });

  return topElement;
};

export default function TranslationSection() {
  const navigate = useNavigate();
  const closeCurrentTranslation = useTextStore(
    (state) => state.closeCurrentTranslation
  );
  const open = useModalStore((state) => state.open);
  const textLanguage = useTextStore(
    (state) => state.currentTranslation.translationFile?.language
  );
  const textBaseName = useTextStore(
    (state) => state.currentTranslation.baseName
  );
  const isDataLoaded = useTextStore(
    (state) => state.currentTranslation.isDataLoaded
  );
  const setLastPosition = useTextStore((state) => state.setLastPosition);

  const handleToHome = () => {
    const leftPosition = Number(getLastPosition('left')?.innerHTML || '');
    const rightPosition = Number(getLastPosition('right')?.innerHTML || '');

    if (leftPosition && rightPosition) {
      setLastPosition(textBaseName, textLanguage, leftPosition, rightPosition);
    }
    closeCurrentTranslation();
    navigate('/');
  };

  const openDeleteTranslation = () => {
    open('delete-one-language', {
      name: textBaseName,
      value: textLanguage,
    });
  };

  if (!isDataLoaded) return null;

  return (
    <div className="w-screen sm:px-5 lg:px-10 max-w-[1600px]">
      <HomeButton onClick={handleToHome} />
      <DeleteLanguageButton onClick={openDeleteTranslation} />
      <div className="overflow-x-auto rounded-lg shadow-md border border-border-dark">
        <Split
          className="flex h-[92dvh] xl:h-[90dvh]"
          sizes={[50, 50]}
          minSize={200}
          gutterSize={8}
          direction="horizontal"
        >
          <MdEditor editorType="original" />
          <MdEditor editorType="translation" />
        </Split>
      </div>
    </div>
  );
}
