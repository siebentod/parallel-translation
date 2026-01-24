import { EditorView, Decoration, ViewPlugin } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';
import { createRoot } from 'react-dom/client';
import { useTextStore } from 'hooks/useTextStore';
import ContextMenu from './coloring-context-menu';

// Эффект для установки цветов строк
const setLineColorsEffect = StateEffect.define();

function createLineDecorations(doc, lineColors) {
  if (!doc || !lineColors?.length) return Decoration.none;
  const decorations = [];

  for (const { line, color } of lineColors) {
    if (line > 0 && line <= doc.lines) {
      const lineObj = doc.line(line);
      decorations.push(
        Decoration.line({ class: `cm-line-colored cm-line-${color}` }).range(lineObj.from)
      );
    }
  }

  // сортировка по позиции начала
  decorations.sort((a, b) => a.from - b.from);

  return Decoration.set(decorations, true); // true = подтверждает, что они отсортированы
}

function createLineColorField(baseName, language) {
  return StateField.define({
    create(state) {
      const store = useTextStore.getState();
      return createLineDecorations(state.doc, store.getLineColors(baseName, language));
    },
    update(decorations, tr) {
      decorations = decorations.map(tr.changes);
      for (let effect of tr.effects) {
        if (effect.is(setLineColorsEffect)) {
          decorations = createLineDecorations(tr.state.doc, effect.value);
        }
      }
      return decorations;
    },
    provide: f => EditorView.decorations.from(f),
  });
}

export function createLineColoringExtension(baseName, language) {
  const lineColorField = createLineColorField(baseName, language);

  const viewPlugin = ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.view = view;
        this.baseName = baseName;
        this.language = language;
        this.portalRoot = null;

        this.contextMenuHandler = this.handleContextMenu.bind(this);
        this.view.dom.addEventListener('contextmenu', this.contextMenuHandler);
      }

      handleContextMenu(event) {
        const gutterElement = event.target.closest('.cm-gutter, .cm-lineNumbers .cm-gutterElement');
        if (!gutterElement) return;

        event.preventDefault();
        const pos = this.view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (pos === null) return;
        const line = this.view.state.doc.lineAt(pos);
        const lineNumber = line.number;

        this.showContextMenu(event.clientX, event.clientY, lineNumber);
      }

      showContextMenu(x, y, lineNumber) {
        this.hideContextMenu();

        const store = useTextStore.getState();
        const lineColors = store.getLineColors(this.baseName, this.language);
        const currentColor = lineColors.find(lc => lc.line === lineNumber)?.color || null;

        const mountNode = document.createElement('div');
        document.body.appendChild(mountNode);
        this.portalRoot = createRoot(mountNode);

        const setLineColor = color => {
          const store = useTextStore.getState();
          store.setLineColor(this.baseName, this.language, lineNumber, color);
          const updated = store.getLineColors(this.baseName, this.language);
          this.view.dispatch({ effects: setLineColorsEffect.of(updated) });
        };

        const closeMenu = () => this.hideContextMenu();

        this.portalRoot.render(
          <ContextMenu
            x={x}
            y={y}
            currentColor={currentColor}
            onSelect={setLineColor}
            onClose={closeMenu}
          />
        );
      }

      hideContextMenu() {
        if (this.portalRoot) {
          this.portalRoot.unmount();
          this.portalRoot = null;
        }
      }

      destroy() {
        this.view.dom.removeEventListener('contextmenu', this.contextMenuHandler);
        this.hideContextMenu();
      }
    }
  );

  return [lineColorField, viewPlugin];
}
