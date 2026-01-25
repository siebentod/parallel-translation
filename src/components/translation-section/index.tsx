import { useNavigate } from 'react-router-dom';
import Split from 'react-split';
import MdEditor from 'src/components/md-editor';
import HomeButton from 'src/components/ui/home-button';
import { useTextStore } from 'src/hooks/useTextStore';

export default function TranslationSection() {
  const navigate = useNavigate();
  const { closeCurrentTranslation } = useTextStore();
  
  const handleToHome = () => {
    closeCurrentTranslation();
    navigate('/');
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
