import { createStorage } from 'src/lib/storage';

import { create } from 'zustand';
import { Store } from './types';
import { createInternalSlice } from './slices/internalSlice';
import { createEditorSlice } from './slices/editorSlice';
import { createDataSlice } from './slices/dataSlice';

export const storeFile = createStorage('translations.json');

export const textStore = create<Store>()((...a) => ({
  ...createInternalSlice(...a),
  ...createEditorSlice(...a),
  ...createDataSlice(...a),
}));

textStore.getState()._refreshLoad();
