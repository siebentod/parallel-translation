import Modal, { type ModalProps } from 'src/components/ui/modal';
import Button from 'src/components/ui/button';

export interface CreateNewLanguageModalProps extends ModalProps {
  currentName?: string;
}

export function CreateNewLanguageModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateNewLanguageModalProps) {

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enter language code">
      <form onSubmit={onSubmit}>
        <input
          type="text"
          className="bg-input-dark border border-border-light rounded-md mx-auto block px-3 py-2 w-full mt-4 focus:outline-none"
          name="language"
          required
          autoComplete="off"
          autoFocus
          maxLength={3}
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