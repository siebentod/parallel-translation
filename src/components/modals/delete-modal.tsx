import Modal, { type ModalProps } from 'src/components/ui/modal';
import Button from 'src/components/ui/button';

export interface DeleteModalProps extends ModalProps {
  currentName?: string;
}

export function DeleteModal({ isOpen, onClose, onSubmit, currentName }: DeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Удалить ${currentName}`}>
      <p className="mx-auto text-center max-w-[400px]">
        Данное действие необратимо. Вы уверены?
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
