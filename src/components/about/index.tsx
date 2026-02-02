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

        {/* Content */}
        <div className="text-text-primary">
          <p className="mb-0">
            — Text is saved on input with a 1-second delay, and immediately when exiting (via button).
          </p>
          <p className="mb-0">
            — Click a line number to scroll the opposite window to the corresponding line.
          </p>
          <p className="mb-0">
           — Right-click on a line number to mark the line
            with color.
          </p>
        </div>
      </div>
    </>
  );
}