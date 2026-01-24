/**
 * Formatting Keys Extension для CodeMirror
 *
 * Этот extension добавляет горячие клавиши для быстрого форматирования текста в markdown редакторе:
 * - Ctrl/Cmd + I: Переключение курсива (*текст*)
 * - Ctrl/Cmd + B: Переключение жирного (*текст*)
 * - Shift + 8: Добавление звездочки (*)
 *
 * Функционал:
 * - Если текст выделен - применяет/убирает маркеры форматирования (*для курсива, **для жирного)
 * - Если текст не выделен - выделяет текущее слово и применяет форматирование
 * - Поддерживает режим переключения (toggle) - повторное нажатие убирает форматирование
 * - Сохраняет выделение на отформатированном тексте после применения
 */

import { EditorView } from '@codemirror/view';
import { EditorState, Prec, EditorSelection } from '@codemirror/state'; // Добавляем EditorSelection
import { keymap } from '@codemirror/view';

function applyFormatting(view, marker, toggleMode, preventDefaultNative = true) {
  const { state, dispatch } = view;
  const { selection } = state;
  const changes = [];
  const newSelections = [];

  // Ищем совпадения маркера
  const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Экранируем спецсимволы для RegExp
  const startRegExp = new RegExp(`^${escapedMarker}`);
  const endRegExp = new RegExp(`${escapedMarker}$`);
  const markerLength = marker.length;

  for (const range of selection.ranges) {
    let { from, to } = range;
    let newAnchor = from;
    let newHead = to;
    let applied = false;

    // Если выделения нет, пытаемся выделить слово или хотя бы курсор
    if (from === to) {
      const line = state.doc.lineAt(from);
      const lineText = line.text;
      const posInLine = from - line.from;

      // Попытка выделить слово
      const beforeWord = lineText.substring(0, posInLine).match(/\b\w*$/);
      const afterWord = lineText.substring(posInLine).match(/^\w*\b/);

      if (beforeWord && afterWord && (beforeWord[0].length > 0 || afterWord[0].length > 0)) {
        from = line.from + posInLine - beforeWord[0].length;
        to = line.from + posInLine + afterWord[0].length;
      } else {
        // Если слова нет, то просто оставляем курсор
        from = range.from;
        to = range.to;
      }
    }

    const selectedText = state.doc.sliceString(from, to);

    // Проверяем, есть ли маркеры непосредственно вокруг выделенного текста
    // Читаем немного шире, чтобы убедиться, что маркеры находятся именно снаружи
    const lookBehindStart = Math.max(0, from - markerLength);
    const lookAheadEnd = Math.min(state.doc.length, to + markerLength);

    const textBefore = state.doc.sliceString(lookBehindStart, from);
    const textAfter = state.doc.sliceString(to, lookAheadEnd);

    // Более точная проверка, чтобы маркеры были именно "вокруг"
    // То есть, перед "from" должно быть N символов маркера, а после "to" тоже N
    const hasMarkerAround = textBefore.endsWith(marker) && textAfter.startsWith(marker);

    if (toggleMode && hasMarkerAround) {
      // Режим переключения и маркеры найдены - удаляем
      changes.push(
        { from: from - markerLength, to: from, insert: '' }, // Удаляем перед
        { from: to, to: to + markerLength, insert: '' }      // Удаляем после
      );
      // Корректируем новое выделение
      newAnchor = from - markerLength;
      newHead = to - markerLength;
      applied = true;
    } else {
      // Добавляем маркеры (или всегда добавляем, если toggleMode false)
      changes.push(
        { from: from, to: from, insert: marker },
        { from: to, to: to, insert: marker }
      );
      // Корректируем новое выделение
      newAnchor = from + markerLength;
      newHead = to + markerLength;
      applied = true;
    }

    if (applied) {
      // Создаем новое выделение, которое охватывает *только что отформатированный текст*
      newSelections.push(EditorSelection.range(newAnchor, newHead));
    } else {
      // Если никаких изменений не произошло, сохраняем исходное выделение
      newSelections.push(range);
    }
  }

  if (changes.length > 0) {
    dispatch(state.update({
      changes,
      selection: EditorSelection.create(newSelections),
      scrollIntoView: true
    }));
  }
  return preventDefaultNative; // Возвращаем, нужно ли предотвращать стандартное действие
}

// Функции для конкретных команд
const toggleItalic = (view) => applyFormatting(view, '*', true);
const toggleBold = (view) => applyFormatting(view, '**', true);
const addAsterisk = (view) => applyFormatting(view, '*', false);


export function formattingKeys() {
  return Prec.highest(
    keymap.of([
      { key: 'Mod-i', run: toggleItalic },
      { key: 'Mod-b', run: toggleBold },
      { key: 'Shift-8', run: addAsterisk } // Не работает
    ])
  );
}