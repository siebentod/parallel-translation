import Modal, { type ModalProps } from 'src/components/ui/modal';
import Button from 'src/components/ui/button';

export interface DeleteModalProps extends ModalProps {
  currentName?: string;
}

export function DeleteModal({ isOpen, onClose, onSubmit, currentName }: DeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Delete ${currentName}`}>
      <p className="mx-auto text-center max-w-[400px]">
        This action is irreversible. Are you sure?
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
