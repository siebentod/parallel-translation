import Modal, { type ModalProps } from 'src/components/ui/modal';
import Button from 'src/components/ui/button';

export interface RenameModalProps extends ModalProps {
  currentName?: string;
}

export function RenameModal({
  isOpen,
  onClose,
  onSubmit,
  currentName,
}: RenameModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename">
      <form onSubmit={onSubmit}>
        <input
          type="text"
          className="bg-input-dark border border-border-light rounded-md mx-auto block px-3 py-2 w-full mt-4 focus:outline-none"
          name="shownName"
          defaultValue={currentName}
          required
          autoComplete="off"
          autoFocus
        />
        <div className="flex justify-center mt-4 gap-2">
          <Button type="submit" primary>
            Rename
          </Button>
          <Button type="button" onClick={onClose}>
            Back
          </Button>
        </div>
      </form>
    </Modal>
  );
}