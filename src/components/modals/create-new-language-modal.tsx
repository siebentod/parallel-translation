import Modal, { type ModalProps } from 'src/components/ui/modal';
import Button from 'src/components/ui/button';

export interface CreateNewLanguageModalProps extends ModalProps {}

export function CreateNewLanguageModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateNewLanguageModalProps) {

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Введите код языка">
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
            Создать
          </Button>
          <Button type="button" onClick={onClose}>
            Назад
          </Button>
        </div>
      </form>
    </Modal>
  );
}