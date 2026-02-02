import Modal, { type ModalProps } from 'src/components/ui/modal';
import Button from 'src/components/ui/button';

export interface StatusModalProps extends ModalProps {
  currentStatus?: string;
}

export function StatusModal({ isOpen, onClose, onSubmit, currentStatus }: StatusModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Status">
      <form onSubmit={onSubmit}>
        <select
          className="border border-border-light rounded-md mx-auto block px-3 py-2 w-full mt-4 bg-input-dark focus:outline-none"
          name="status"
          defaultValue={currentStatus}
          required
        >
          <option className="hover:bg-amber-100" value="New">New</option>
          <option value="Finished">Finished</option>
          <option value="Hold">Hold</option>
        </select>
        <div className="flex justify-center mt-4 gap-2">
          <Button type="submit" primary>
            Change status
          </Button>
          <Button type="button" onClick={onClose}>
            Back
          </Button>
        </div>
      </form>
    </Modal>
  )
}
