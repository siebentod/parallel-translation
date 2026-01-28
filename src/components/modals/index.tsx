import { useTextStore } from 'src/hooks/useTextStore';
import { useModalStore } from 'src/hooks/useModalStore';
import { DeleteModal } from 'src/components/modals/delete-modal';
import { CreateTranslationModal } from 'src/components/modals/create-translation-modal';
import { RenameModal } from 'src/components/modals/rename-modal';
import { StatusModal } from 'src/components/modals/status-modal';
import { CreateNewLanguageModal } from 'src/components/modals/create-new-language-modal';
import { DeleteOneLanguage } from 'src/components/modals/delete-one-language';
import { useNavigate } from 'react-router-dom';

export default function Modals() {
  const {
    createTranslation,
    renameTranslation,
    deleteTranslation,
    editStatus,
    createNewLanguage,
    deleteOneLanguage,
  } = useTextStore();
  const navigate = useNavigate();

  const close = useModalStore((state) => state.close);

  const isCreateTranslationOpen = useModalStore(
    (state) => !!state.modals['create-translation']
  );
  const isRenameOpen = useModalStore((state) => !!state.modals.rename);
  const isStatusOpen = useModalStore((state) => !!state.modals.status);
  const isDeleteOpen = useModalStore((state) => !!state.modals.delete);
  const isCreateNewLanguageOpen = useModalStore((state) => !!state.modals['create-new-language']);
  const isDeleteOneLanguageOpen = useModalStore((state) => !!state.modals['delete-one-language']);

  const statusModalValue = useModalStore(
    (state) => state.modalValues.status
  );
  const renameModalValue = useModalStore(
    (state) => state.modalValues.rename
  );
  const deleteModalValue = useModalStore(
    (state) => state.modalValues.delete
  );
  const createNewLanguageModalValue = useModalStore(
    (state) => state.modalValues['create-new-language']
  );
  const deleteOneLanguageModalValue = useModalStore(
    (state) => state.modalValues['delete-one-language']
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

  const submitModalCreateNewLanguage = async (e) => {
    e.preventDefault();
    const baseName = createNewLanguageModalValue?.name;
    const language = e.target.language.value;
    if (!language || !baseName ) return;
    const { success } = await createNewLanguage(baseName, language);
    if (success) close('create-new-language');
  };

  const submitModalDeleteOneLanguage = async () => {
    const baseName = deleteOneLanguageModalValue?.name;
    const language = deleteOneLanguageModalValue?.value;
    if (!language || !baseName) return;
    const { success } = await deleteOneLanguage(baseName, language);
    if (success) close('delete-one-language');
    navigate('/');
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

      <CreateNewLanguageModal
        isOpen={isCreateNewLanguageOpen}
        onClose={() => close('create-new-language')}
        onSubmit={submitModalCreateNewLanguage}
        currentName={createNewLanguageModalValue?.name}
      />

      <DeleteOneLanguage
        isOpen={isDeleteOneLanguageOpen}
        onClose={() => close('delete-one-language')}
        onSubmit={submitModalDeleteOneLanguage}
        baseName={deleteOneLanguageModalValue?.name}
        language={deleteOneLanguageModalValue?.value}
      />
    </>
  );
}
