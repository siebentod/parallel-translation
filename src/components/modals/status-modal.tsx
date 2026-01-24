import Modal, { type ModalProps } from 'src/components/ui/modal';
import Button from 'src/components/ui/button';

export interface StatusModalProps extends ModalProps {
  currentStatus?: string;
}

export function StatusModal({ isOpen, onClose, onSubmit, currentStatus }: StatusModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Статус">
      <form onSubmit={onSubmit}>
        <select
          className="border border-border-light rounded-md mx-auto block px-3 py-2 w-full mt-4 bg-input-dark focus:outline-none"
          name="status"
          defaultValue={currentStatus}
          required
        >
          <option className="hover:bg-amber-100" value="Новый">Новый</option>
          <option value="Готово">Готово</option>
          <option value="Отложено">Отложено</option>
        </select>
        <div className="flex justify-center mt-4 gap-2">
          <Button type="submit" primary>
            Изменить статус
          </Button>
          <Button type="button" onClick={onClose}>
            Назад
          </Button>
        </div>
      </form>
    </Modal>
  )
}
