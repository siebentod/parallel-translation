import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { useCodeMirrorExtensions } from './useCodeMirrorExtensions';
import { useTextStore } from 'src/hooks/useTextStore';
import { useAutoSave } from 'src/hooks/useAutoSave';

export default function MdEditor({
  editorType,
}: {
  editorType: 'original' | 'translation';
}) {
  const textContent = useTextStore((state) =>
    editorType === 'original'
      ? state.currentTranslation.originalFile?.content ?? ''
      : state.currentTranslation.translationFile?.content ?? ''
  );
  const textLanguage = useTextStore((state) =>
    editorType === 'original'
      ? state.currentTranslation.originalFile?.language ?? ''
      : state.currentTranslation.translationFile?.language ?? ''
  );
  const updateFn = useTextStore((state) =>
    editorType === 'original'
      ? state.updateOriginalContent
      : state.updateTranslationContent
  );
  const saveCurrentTranslation = useTextStore(
    (state) => state.saveCurrentTranslation
  );
  const baseName = useTextStore((state) => state.currentTranslation.baseName) as string;
  const isDataLoaded = useTextStore(
    (state) => state.currentTranslation.isDataLoaded
  );
  const value = textContent;
  const onChange = updateFn;
  const editorId = editorType === 'original' ? 'left' : 'right';
  const partnerId = editorType === 'original' ? 'right' : 'left';
  const language = textLanguage;

  // Автосохранение для оригинального файла
  useAutoSave(
    textContent || '',
    async () => {
      if (textContent) {
        await saveCurrentTranslation();
      }
    },
    1000,
    isDataLoaded && !!textContent
  );

  const extensions = useCodeMirrorExtensions({
    editorId,
    partnerId,
    baseName,
    language,
  });

  return (
    <div className="overflow-y-auto">
      <CodeMirror
        value={value}
        onChange={(value) => onChange(value)}
        theme={vscodeDark}
        extensions={extensions}
      />
    </div>
  );
}
