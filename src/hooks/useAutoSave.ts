import { useEffect, useRef } from 'react';

export function useAutoSave(
  content: string,
  saveFunction: () => Promise<void>,
  delay = 1000,
  enabled = true
) {
  const timeoutRef = useRef(<number | null>(null));
  const previousContentRef = useRef(<string | null>(null));

  useEffect(() => {
    // Если автосохранение отключено или нет функции сохранения, выходим
    if (!enabled || !saveFunction) return;

    // Если содержимое не изменилось, выходим
    if (content === previousContentRef.current) return;

    // При первой загрузке просто сохраняем текущее содержимое как предыдущее
    if (previousContentRef.current === null) {
      previousContentRef.current = content;
      return;
    }

    // Очищаем предыдущий таймаут если он есть
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Устанавливаем новый таймаут для сохранения
    timeoutRef.current = setTimeout(async () => {
      previousContentRef.current = content;
      try {
        await saveFunction();
        console.info('Файл успешно сохранён автосохранением');
      } catch (err) {
        console.error('Ошибка автосохранения файла:', err);
      }
    }, delay);

    // Cleanup функция для очистки таймаута
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, saveFunction, delay, enabled]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);  
}
