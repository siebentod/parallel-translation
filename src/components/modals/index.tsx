import { useTextStore } from 'src/hooks/useTextStore';
import { useModalStore } from 'src/hooks/useModalStore';
import { DeleteModal } from 'src/components/modals/delete-modal';
import { CreateTranslationModal } from 'src/components/modals/create-translation-modal';
import { RenameModal } from 'src/components/modals/rename-modal';
import { StatusModal } from 'src/components/modals/status-modal';

export default function Modals() {
  const {
    createTranslation,
    renameTranslation,
    deleteTranslation,
    editStatus,
  } = useTextStore();

  const close = useModalStore((state) => state.close);
  const isCreateTranslationOpen = useModalStore(
    (state) => !!state.modals['create-translation']
  );
  const isRenameOpen = useModalStore((state) => !!state.modals.rename);
  const renameModalValue = useModalStore(
    (state) => state.modalValues.rename
  );
  const isStatusOpen = useModalStore((state) => !!state.modals.status);
  const statusModalValue = useModalStore(
    (state) => state.modalValues.status
  );
  const isDeleteOpen = useModalStore((state) => !!state.modals.delete);
  const deleteModalValue = useModalStore(
    (state) => state.modalValues.delete
  );

  const submitModalNewTranslation = async (e) => {
    e.preventDefault();
    const name = e.target.baseName.value;
    if (!name) return;
    const { success } = await createTranslation(name);
    if (success) close(`create-translation`);
  };

  const submitModalRename = async (e) => {
    e.preventDefault();
    const baseName = renameModalValue?.name;
    const newShownName = e.target.shownName.value;
    if (!newShownName || !baseName) return;
    const { success } = await renameTranslation(baseName, newShownName);
    if (success) close('rename');
  };

  const submitModalEditStatus = (e) => {
    e.preventDefault();
    const baseName = statusModalValue?.name;
    const newStatus = e.target.status.value;
    if (!newStatus || !baseName) return;
    editStatus(baseName, newStatus);
    close('status');
  };

  const submitModalDeleteTranslation = () => {
    const baseName = deleteModalValue?.name;
    if (!baseName) return;
    deleteTranslation(baseName);
    close('delete');
  };

  return (
    <>
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => close('delete')}
        onSubmit={submitModalDeleteTranslation}
        currentName={deleteModalValue?.value}
      />

      <CreateTranslationModal
        isOpen={isCreateTranslationOpen}
        onClose={() => close('create-translation')}
        onSubmit={submitModalNewTranslation}
      />

      <RenameModal
        isOpen={isRenameOpen}
        onClose={() => close('rename')}
        onSubmit={submitModalRename}
        currentName={renameModalValue?.value}
      />

      <StatusModal
        isOpen={isStatusOpen}
        onClose={() => close('status')}
        onSubmit={submitModalEditStatus}
        currentStatus={statusModalValue?.value}
      />
    </>
  );
}
