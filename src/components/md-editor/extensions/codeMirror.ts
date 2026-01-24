export { EditorView, Decoration, ViewPlugin } from '@codemirror/view';
export { EditorState, RangeSetBuilder } from '@codemirror/state';
export { markdown, markdownLanguage } from '@codemirror/lang-markdown';
export { languages } from '@codemirror/language-data';

export function encode(str: string) {
  return str.replace(/[\[\]]/g, (match: string) => '\\' + match);
}

export function decode(str: string) {
  return str.replace(/\\([\[\]])/g, '$1');
}