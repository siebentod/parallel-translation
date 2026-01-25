import { create } from 'zustand';

export interface ModalStore {
  modals: Record<string, boolean>;
  modalValues: Record<string, any>;

  open: (name: string, value?: any) => void;
  close: (name: string) => void;
  toggle: (name: string) => void;
  isOpen: (name: string) => boolean;
  getModalValue: (name: string) => any;
}

export const modalStore = create<ModalStore>((set, get) => ({
  modals: {},
  modalValues: {},
  open: (name, value) =>
    set((state) => ({
      modals: { ...state.modals, [name]: true },
      modalValues: { ...state.modalValues, [name]: value },
    })),
  close: (name) =>
    set((state) => {
      const newModalValues = { ...state.modalValues };
      delete newModalValues[name];

      return {
        modals: { ...state.modals, [name]: false },
        modalValues: newModalValues,
      };
    }),
  toggle: (name) =>
    set((state) => {
      const isCurrentlyOpen = !!state.modals[name];
      const newModalValues = { ...state.modalValues };
      if (isCurrentlyOpen) {
        delete newModalValues[name];
      }

      return {
        modals: { ...state.modals, [name]: !isCurrentlyOpen },
        modalValues: newModalValues,
      };
    }),
  isOpen: (name) => !!get().modals[name],
  getModalValue: (name) => get().modalValues[name],
}));