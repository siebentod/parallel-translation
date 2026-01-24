import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTextStore } from 'src/hooks/useTextStore';
import { useModalStore } from 'src/hooks/useModalStore';

import clsx from 'clsx';
import Row from './row';
import PlusSvg from 'assets/icons/Plus.svg?react';
import ArrowToButton from 'src/components/ui/arrow-to-button';

// Определяем приоритет статусов
const statusPriority = {
  Новый: 1,
  'В процессе': 2,
  Отложено: 3,
  Готово: 4,
};

interface TranslationsTableProps {
  setTableOpened: (value: boolean) => void;
}

function TranslationsTable({ setTableOpened }: TranslationsTableProps) {
  const open = useModalStore((state) => state.open);
  const { isDataLoaded, openTranslation } = useTextStore();
  const translationsObj = useTextStore((state) => state.translations);
  const translationSets = Object.values(translationsObj);

  const [sortColumn, setSortColumn] = useState('lastModified');
  const [sortDirection, setSortDirection] = useState('desc');

  // Мемоизируем отсортированные наборы переводов
  const sortedTranslationSets = useMemo(() => {
    if (!translationSets) return [];

    return [...translationSets].sort((a, b) => {
      // Сначала сортируем по статусу
      const statusA = statusPriority[a.status] || 999;
      const statusB = statusPriority[b.status] || 999;

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
        setSortDirection((prevDirection) =>
          prevDirection === 'asc' ? 'desc' : 'asc'
        );
        return prevColumn;
      } else {
        setSortDirection('asc');
        return column;
      }
    });
  }, []);

  const handleOpenTranslation = useCallback(
    async (baseName: string, language: string) => {
      try {
        await openTranslation(baseName, language);
        setTableOpened(false);
      } catch (error) {
        toast.error('Ошибка открытия перевода');
      }
    },
    [openTranslation, setTableOpened]
  );

  if (!isDataLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Загрузка переводов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-6xl mx-auto">
      <div className="max-w-screen overflow-x-auto relative">
        <table className="bg-surface shadow-sm mx-auto md:min-w-2xl">
          <thead className="bg-red-bg">
            <tr className="border border-border-dark text-left text-sm font-semibold text-black uppercase tracking-wider text-nowrap">
              {[
                { key: 'empty', label: '' },
                { key: 'shownName', label: 'Title' },
                { key: 'status', label: 'Status' },
                { key: 'languages', label: 'Translations' },
                { key: 'lastModified', label: 'Last touched' },
              ].map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'border-b border-border-dark cursor-pointer transition duration-150',
                    col.key !== 'languages' &&
                      col.key !== 'empty' &&
                      'cursor-pointer',
                    col.key !== 'empty' && 'py-3 px-4'
                  )}
                  onClick={() =>
                    col.key !== 'languages' &&
                    col.key !== 'empty' &&
                    handleSort(col.key)
                  }
                >
                  {col.key === 'empty' ? (
                    <button
                      className="text-black bg-primary border hover:bg-primary-hover px-1 py-1 rounded-lg flex items-center justify-center ml-3 text-lg"
                      onClick={() => open('create-translation')}
                      id="add-translation-button"
                    >
                      <PlusSvg className="w-4 h-4" />
                    </button>
                  ) : (
                    col.label
                  )}{' '}
                  {col.key !== 'languages' && getSortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {sortedTranslationSets.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-xl">Переводы не найдены</div>
                    <ArrowToButton />
                    <div
                      className="text-base text-gray-400 w-max mx-auto"
                      id="add-translation-text"
                    >
                      Создайте свой первый перевод!
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedTranslationSets.map((translationSet, index) => (
                <Row
                  key={translationSet.baseName}
                  translationSet={translationSet}
                  onOpenTranslation={handleOpenTranslation}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TranslationsTable;
