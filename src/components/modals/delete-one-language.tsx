import Modal, { type ModalProps } from 'src/components/ui/modal';
import Button from 'src/components/ui/button';

export interface DeleteOneLanguageProps extends ModalProps {
  baseName: string;
  language: string;
}

export function DeleteOneLanguage({ isOpen, onClose, onSubmit, baseName, language }: DeleteOneLanguageProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Delete '${language}'`}>
      <p className="mx-auto text-center max-w-[400px]">
        Delete language {language} for translation {baseName}?
      </p>
      <div className="flex justify-center mt-4 gap-2">
        <Button onClick={onSubmit} primary>
          Yes
        </Button>
        <Button onClick={onClose}>Back</Button>
      </div>
    </Modal>
  );
}
