import { useModalStore } from 'src/hooks/useModalStore';

import BinSvg from 'assets/icons/Bin.svg?react';
import Plus2Svg from 'assets/icons/Plus2.svg?react';
import EditSvg from 'assets/icons/Edit.svg?react';
import { Translation } from 'src/store/text/types';
import { Link } from 'react-router-dom';

interface TranslationRowProps {
  translationSet: Translation;
}

function TranslationRow({ translationSet }: TranslationRowProps) {
  const open = useModalStore((state) => state.open);

  const renderLanguageTags = () => {
    const languages = translationSet.availableLanguages;

    return (
      <div className="flex flex-wrap gap-1 items-center">
        {languages.map((lang: string) => (
          <Link
            to={`/translation/${translationSet.baseName}/${lang}`}
            key={lang}
            className="px-2 py-1 text-xs font-bold bg-red-bg text-black rounded-sm hover:bg-red-bg-hover transition-colors"
            title={`Открыть перевод на ${lang}`}
          >
            {lang}
          </Link>
        ))}
        <Plus2Svg className="w-5 h-5 p-0.5 ml-1 rounded-full bg-red-bg text-black hover:bg-red-200" />
      </div>
    );
  };

  const getLastModified = () => {
    return new Date(translationSet.dateModified).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openRenameTranslation = (translationSet: Translation) => {
    open('rename', {
      name: translationSet.baseName,
      value: translationSet.shownName,
    });
  };

  const openEditStatus = (translationSet: Translation) => {
    open('status', {
      name: translationSet.baseName,
      value: translationSet.status,
    });
  };

  const openDeleteTranslation = (translationSet: Translation) => {
    open('delete', {
      name: translationSet.baseName,
      value: translationSet.shownName,
    });
  };

  return (
    <tr className="hover:bg-surface-hover cursor-pointer transition-colors">
      <td className="py-3 px-4 border-b border-l border-border-dark">
        <BinSvg
          className="w-5 h-5 text-red-bg hover:text-red-bg-hover transition-colors"
          onClick={() => openDeleteTranslation(translationSet)}
        />
      </td>
      <td
        className="py-3 px-4 border-b border-border-dark"
        onClick={() => openRenameTranslation(translationSet)}
      >
        <div className="font-medium text-secondary flex items-center max-w-60 xl:max-w-120 truncate">
          {translationSet.shownName}
          <EditSvg className="w-3.5 h-3.5 ml-1" />
        </div>
      </td>
      <td
        className="py-3 px-4 border-b border-border-dark  hover:bg-border-dark"
        onClick={() => openEditStatus(translationSet)}
      >
        <div
          className={`font-medium ${
            translationSet.status === 'Готово'
              ? 'text-info'
              : translationSet.status === 'Отложено'
              ? 'text-warning'
              : 'text-success'
          }`}
        >
          {translationSet.status || 'Новый'}
        </div>
      </td>
      <td className="py-3 px-4 border-b border-border-dark">
        {renderLanguageTags()}
      </td>
      <td className="py-3 px-4 border-b border-r border-border-dark text-sm text-secondary">
        {getLastModified()}
      </td>
    </tr>
  );
}

export default TranslationRow;
