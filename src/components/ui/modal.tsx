import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, ReactNode } from 'react';

interface BaseModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closingCross?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}

export default function Modal({
  isOpen = true,
  onClose,
  title,
  children,
  closingCross = true,
}: BaseModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          className="bg-background border-border-light border rounded-2xl shadow-xl max-w-[600px] p-6 relative min-w-80"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold md:px-20 px-3 mx-auto">
              {title}
            </h2>
            {closingCross && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 absolute top-2 right-4"
              >
                ✕
              </button>
            )}
          </div>

          <div>{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
