import { EditorView } from '@codemirror/view';
import { ViewPlugin } from '@codemirror/view';

// Глобальный объект для хранения ссылок на редакторы
const editorRegistry = new Map();

export function syncScroll(editorId, partnerId) {
  const extension = ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.editorId = editorId;
      this.partnerId = partnerId;
      
      // Регистрируем редактор
      editorRegistry.set(editorId, view);
      
      // Добавляем обработчик кликов на gutter (область с номерами строк)
      this.clickHandler = this.handleGutterClick.bind(this);
      this.view.dom.addEventListener('click', this.clickHandler);
    }

    handleGutterClick(event) {
      // Проверяем, что клик был именно на gutter (номер строки)
      const gutterElement = event.target.closest('.cm-gutter, .cm-lineNumbers .cm-gutterElement');
      if (!gutterElement) return;

      // Получаем позицию клика
      const pos = this.view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (pos === null) return;

      // Получаем номер строки
      const line = this.view.state.doc.lineAt(pos);
      const lineNumber = line.number;

      // Находим парный редактор и прокручиваем его
      const partnerView = editorRegistry.get(this.partnerId);
      if (partnerView) {
        this.scrollPartnerToLine(partnerView, lineNumber);
      }
    }

    scrollPartnerToLine(partnerView, lineNumber) {
      const partnerDoc = partnerView.state.doc;
      
      // Проверяем, существует ли строка с таким номером в парном редакторе
      if (lineNumber <= partnerDoc.lines) {
        const targetLine = partnerDoc.line(lineNumber);
        
        // Прокручиваем к началу строки и размещаем её вверху экрана
        partnerView.dispatch({
          effects: EditorView.scrollIntoView(targetLine.from, {
            y: 'start', // Размещаем строку в начале видимой области
            yMargin: 0  // Без отступов
          })
        });
      }
    }

    destroy() {
      // Убираем обработчик событий и удаляем из реестра
      this.view.dom.removeEventListener('click', this.clickHandler);
      editorRegistry.delete(this.editorId);
    }
  });

  return extension;
}