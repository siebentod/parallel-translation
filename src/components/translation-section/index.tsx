import Split from 'react-split';
import MdEditor from 'src/components/md-editor';
import HomeButton from 'src/components/ui/home-button';
import { useTextStore } from 'src/hooks/useTextStore';

interface TranslationSectionProps {
  setTableOpened: (value: boolean) => void;
}

export default function TranslationSection({
  setTableOpened,
}: TranslationSectionProps) {
  const closeCurrentTranslation = useTextStore(
    (state) => state.closeCurrentTranslation
  );

  const handleToHome = () => {
    closeCurrentTranslation();
    setTableOpened(true);
  };

  return (
    <div className="w-screen sm:px-5 lg:px-10 max-w-[1600px]">
      <HomeButton onClick={handleToHome} />
      <div className="overflow-x-auto rounded-lg shadow-md border border-border-dark">
        <Split
          className="flex h-[90dvh]"
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
