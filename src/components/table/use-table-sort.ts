import { useCallback, useMemo, useState } from 'react';
import type { Translation } from 'src/store/text/types';

const statusPriority = {
  Новый: 1,
  'В процессе': 2,
  Отложено: 3,
  Готово: 4,
};

export function useTableSort(translationSets: Translation[] | null) {
  const [sortColumn, setSortColumn] = useState('lastModified');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Мемоизируем отсортированные наборы переводов
  const sortedTranslationSets = useMemo(() => {
    if (!translationSets) return [];

    return [...translationSets].sort((a, b) => {
      // Сначала сортируем по статусу
      const statusA = a.status
        ? statusPriority[a.status as keyof typeof statusPriority]
        : 999;
      const statusB = b.status
        ? statusPriority[b.status as keyof typeof statusPriority]
        : 999;

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // Если статусы одинаковые, применяем основную сортировку
      let valA, valB;

      switch (sortColumn) {
        case 'shownName':
          valA = a.shownName.toLowerCase();
          valB = b.shownName.toLowerCase();
          break;
        case 'lastModified':
          valA = a.dateModified;
          valB = b.dateModified;
          break;
        case 'dateCreated':
          valA = a.dateCreated;
          valB = b.dateCreated;
          break;
        case 'fileCount':
          valA = a.availableLanguages.length;
          valB = b.availableLanguages.length;
          break;
        default:
          valA = a.dateModified;
          valB = b.dateModified;
      }

      if (sortColumn === 'lastModified' || sortColumn === 'fileCount') {
        // Для дат и чисел
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      } else {
        // Для строк
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [translationSets, sortColumn, sortDirection]);

  const getSortIcon = useCallback(
    (column: string) => {
      if (sortColumn === column) {
        return sortDirection === 'asc' ? '▲' : '▼';
      }
      return '';
    },
    [sortColumn, sortDirection]
  );

  const handleSort = useCallback((column: string) => {
    setSortColumn((prevColumn) => {
      if (prevColumn === column) {
        if (sortDirection === 'asc') {
          setSortDirection('desc');
          return column;
        } else {
          setSortDirection('asc');
        }
        return prevColumn;
      } else {
        setSortDirection('desc');
        return column;
      }
    });
  }, [sortDirection]);

  return {
    sortedTranslationSets,
    sortColumn,
    sortDirection,
    handleSort,
    getSortIcon,
  };
}
