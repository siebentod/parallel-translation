import { useTextStore } from 'src/hooks/useTextStore';
import { useModalStore } from 'src/hooks/useModalStore';
import { DeleteModal } from 'src/components/modals/delete-modal';
import { CreateTranslationModal } from 'src/components/modals/create-translation-modal';
import { RenameModal } from 'src/components/modals/rename-modal';
import { StatusModal } from 'src/components/modals/status-modal';
import { CreateNewLanguageModal } from 'src/components/modals/create-new-language-modal';
import { DeleteOneLanguage } from 'src/components/modals/delete-one-language';
import { useNavigate } from 'react-router-dom';

// It is not ideal but it works well...
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

  const getModalData = (name: string) => ({
    isOpen: useModalStore((state) => !!state.modals[name]),
    value: useModalStore((state) => state.modalValues[name])
  });

  const createTranslationData = getModalData('create-translation');
  const renameData = getModalData('rename');
  const statusData = getModalData('status');
  const deleteData = getModalData('delete');
  const createNewLanguageData = getModalData('create-new-language');
  const deleteOneLanguageData = getModalData('delete-one-language');

  const submitModalNewTranslation = async (e) => {
    e.preventDefault();
    const name = e.target.baseName.value;
    if (!name) return;
    const { success } = await createTranslation(name);
    if (success) close(`create-translation`);
  };

  const submitModalRename = async (e) => {
    e.preventDefault();
    const baseName = renameData.value?.name;
    const newShownName = e.target.shownName.value;
    if (!newShownName || !baseName) return;
    const { success } = await renameTranslation(baseName, newShownName);
    if (success) close('rename');
  };

  const submitModalEditStatus = (e) => {
    e.preventDefault();
    const baseName = statusData.value?.name;
    const newStatus = e.target.status.value;
    if (!newStatus || !baseName) return;
    editStatus(baseName, newStatus);
    close('status');
  };

  const submitModalDeleteTranslation = () => {
    const baseName = deleteData.value?.name;
    if (!baseName) return;
    deleteTranslation(baseName);
    close('delete');
  };

  const submitModalCreateNewLanguage = async (e) => {
    e.preventDefault();
    const baseName = createNewLanguageData.value?.name;
    const language = e.target.language.value;
    if (!language || !baseName) return;
    const { success } = await createNewLanguage(baseName, language);
    if (success) close('create-new-language');
  };

  const submitModalDeleteOneLanguage = async () => {
    const baseName = deleteOneLanguageData.value?.name;
    const language = deleteOneLanguageData.value?.value;
    if (!language || !baseName) return;
    const { success } = await deleteOneLanguage(baseName, language);
    if (success) close('delete-one-language');
    navigate('/');
  };

  return (
    <>
      <DeleteModal
        isOpen={deleteData.isOpen}
        onClose={() => close('delete')}
        onSubmit={submitModalDeleteTranslation}
        currentName={deleteData.value?.value}
      />

      <CreateTranslationModal
        isOpen={createTranslationData.isOpen}
        onClose={() => close('create-translation')}
        onSubmit={submitModalNewTranslation}
      />

      <RenameModal
        isOpen={renameData.isOpen}
        onClose={() => close('rename')}
        onSubmit={submitModalRename}
        currentName={renameData.value?.value}
      />

      <StatusModal
        isOpen={statusData.isOpen}
        onClose={() => close('status')}
        onSubmit={submitModalEditStatus}
        currentStatus={statusData.value?.value}
      />

      <CreateNewLanguageModal
        isOpen={createNewLanguageData.isOpen}
        onClose={() => close('create-new-language')}
        onSubmit={submitModalCreateNewLanguage}
        currentName={createNewLanguageData.value?.name}
      />

      <DeleteOneLanguage
        isOpen={deleteOneLanguageData.isOpen}
        onClose={() => close('delete-one-language')}
        onSubmit={submitModalDeleteOneLanguage}
        baseName={deleteOneLanguageData.value?.name}
        language={deleteOneLanguageData.value?.value}
      />
    </>
  );
}
