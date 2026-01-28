import { useMemo } from 'react';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';
import { formattingKeys } from './extensions/formattingKeys';
import { syncScroll } from './extensions/syncScroll';
import { createLineColoringExtension } from './extensions/lineColoring';
import { scrollToLine } from './extensions/scrollToLine';

export function useCodeMirrorExtensions({
  editorId,
  partnerId,
  baseName,
  language,
  initialLine,
}: {
  editorId?: string;
  partnerId?: string;
  baseName?: string;
  language?: string;
  initialLine?: number;
}) {
  return useMemo(
    () =>
      [
        indentUnit.of('    '),
        markdown({ base: markdownLanguage }),
        EditorView.lineWrapping,
        formattingKeys(),
        editorId && partnerId ? syncScroll(editorId, partnerId) : [],
        // Добавляем расширение цветных меток, если есть baseName и language
        baseName && language
          ? createLineColoringExtension(baseName, language)
          : [],
        initialLine ? scrollToLine(initialLine) : [],
      ].flat(),
    [baseName, editorId, language, partnerId, initialLine]
  );
}
