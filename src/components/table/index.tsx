import { useModalStore } from 'src/hooks/useModalStore';
import { useTextStore } from 'src/hooks/useTextStore';
import { useTableSort } from './use-table-sort';

import clsx from 'clsx';
import Row from './row';
import PlusSvg from 'assets/icons/Plus.svg?react';
import ArrowToButton from 'src/components/ui/arrow-to-button';

const columns = [
  { key: 'empty', label: '' },
  { key: 'shownName', label: 'Title' },
  { key: 'status', label: 'Status' },
  { key: 'languages', label: 'Translations' },
  { key: 'lastModified', label: 'Last touched' },
  { key: 'created', label: 'Created' },
];

function TranslationsTable() {
  const open = useModalStore((state) => state.open);
  const { isDataLoaded } = useTextStore();
  const translationsObj = useTextStore((state) => state.translations);
  const translationSets = Object.values(translationsObj);

  const { sortedTranslationSets, handleSort, getSortIcon } =
    useTableSort(translationSets);

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
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'border-b border-border-dark cursor-pointer transition duration-150',
                    col.key !== 'languages' &&
                      col.key !== 'empty' &&
                      'cursor-pointer',
                    col.key !== 'empty' && 'py-3 px-4',
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
