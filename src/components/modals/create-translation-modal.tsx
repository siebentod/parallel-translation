import Modal, { type ModalProps } from 'src/components/ui/modal';
import Button from 'src/components/ui/button';

export interface CreateTranslationModalProps extends ModalProps {}

export function CreateTranslationModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateTranslationModalProps) {

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enter title">
      <form onSubmit={onSubmit}>
        <input
          type="text"
          className="bg-input-dark border border-border-light rounded-md mx-auto block px-3 py-2 w-full mt-4 focus:outline-none"
          name="baseName"
          required
          autoComplete="off"
          autoFocus
        />
        <div className="flex justify-center mt-4 gap-2">
          <Button type="submit" primary>
            Create
          </Button>
          <Button type="button" onClick={onClose}>
            Back
          </Button>
        </div>
      </form>
    </Modal>
  );
}
