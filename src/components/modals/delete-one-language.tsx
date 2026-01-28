import Modal, { type ModalProps } from 'src/components/ui/modal';
import Button from 'src/components/ui/button';

export interface DeleteOneLanguageProps extends ModalProps {
  baseName: string;
  language: string;
}

export function DeleteOneLanguage({ isOpen, onClose, onSubmit, baseName, language }: DeleteOneLanguageProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Удалить '${language}'`}>
      <p className="mx-auto text-center max-w-[400px]">
        Удалить язык {language} для перевода {baseName}?
      </p>
      <div className="flex justify-center mt-4 gap-2">
        <Button onClick={onSubmit} primary>
          Да
        </Button>
        <Button onClick={onClose}>Назад</Button>
      </div>
    </Modal>
  );
}
