import { useRef, useEffect } from 'react';

export default function About() {
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const popover = popoverRef.current;
    const button = buttonRef.current;

    if (!popover || !button) return;

    const handleToggle = () => {
      if (popover.matches(':popover-open')) {
        popover.hidePopover();
      } else {
        popover.showPopover();
      }
    };

    // Закрытие при клике вне модалки
    const handleClickOutside = (e: MouseEvent) => {
      if (popover.matches(':popover-open') && 
          !popover.contains(e.target as Node) && 
          !button.contains(e.target as Node)) {
        popover.hidePopover();
      }
    };

    button.addEventListener('click', handleToggle);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      button.removeEventListener('click', handleToggle);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Кнопка i в правом нижнем углу */}
      <button
        ref={buttonRef}
        className="fixed bottom-3 right-3 w-8 h-8 rounded-full bg-surface border border-border-dark text-text-primary font-semibold text-md hover:bg-opacity-80 transition-all shadow-lg hover:shadow-xl flex items-center justify-center hover:bg-border-dark"
        aria-label="About"
      >
        i
      </button>

      {/* Popover модалка */}
      <div
        ref={popoverRef}
        popover="manual"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4 p-4 bg-surface border border-border-dark rounded-2xl shadow-2xl"
      >
        {/* Кнопка закрытия */}
        <div className="flex justify-end">
          <button
            onClick={() => popoverRef.current?.hidePopover()}
            className="w-6 h-6 rounded-full hover:bg-border-dark transition-colors flex items-center justify-center text-text-secondary"
            aria-label="Close"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Содержимое */}
        <div className="text-text-primary">
          <p className="mb-0">
            — Текст сохраняется по вводу с задержкой 1 сек. и мгновенно при
            выходе через кнопку.
          </p>
          <p className="mb-0">
            — Данные пока сохраняются только в браузере. Когда-нибудь возможна
            синхронизация по личному аккаунту.
          </p>
          <p className="mb-0">
            — Предполагается функция перевода одного текста на много языков.
            Она пока не реализована.{' '}
            <strong className="text-[rgb(231,96,103)]">
              Чтобы открыть сам текст, нужно нажать на "ru"
            </strong>
            .
          </p>
          <p className="mb-0">
            — Работает Markdown разметка.{' '}
            <strong className="text-[rgb(231,96,103)]">
              При нажатии левой кнопкой мыши на номер строки, происходит
              скролл противоположного окна к соответствующей строке
            </strong>
            .
          </p>
          <p className="mb-0">
            Нажатием правой кнопкой мыши на номер можно помечать строку
            цветом.
          </p>
        </div>
      </div>
    </>
  );
}