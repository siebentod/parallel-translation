import { EditorView } from '@codemirror/view';
import { ViewPlugin } from '@codemirror/view';

export function scrollToLine(lineNumber?: number) {
  return ViewPlugin.fromClass(class {
    constructor(view: EditorView) {
      if (lineNumber && lineNumber > 0) {
        // Выполняем прокрутку в следующем тике, чтобы DOM успел отрисоваться
        requestAnimationFrame(() => {
          this.doScroll(view, lineNumber);
        });
      }
    }

    doScroll(view: EditorView, lineNum: number) {
      const { doc } = view.state;
      // Проверяем границы документа
      const targetLineNum = Math.min(Math.max(1, lineNum), doc.lines);
      const line = doc.line(targetLineNum);

      view.dispatch({
        effects: EditorView.scrollIntoView(line.from, {
          y: 'start',
          yMargin: 0
        })
      });
    }
  });
}