import { useEffect } from 'react';
import ReactDOM from 'react-dom';

function ContextMenu({ x, y, currentColor, onSelect, onClose }) {
  useEffect(() => {
    const handleClick = (e) => onClose();
    const handleKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const items = [
    { label: 'Красная метка', color: 'red' },
    { label: 'Оранжевая метка', color: 'orange' },
    { label: 'Зеленая метка', color: 'green' },
    { type: 'separator' },
    { label: 'Убрать метку', color: null },
  ];

  return ReactDOM.createPortal(
    <div
      className="context-menu"
      style={{ top: y, left: x, position: 'fixed' }}
    >
      {items.map((item, idx) =>
        item.type === 'separator' ? (
          <div key={idx} className="context-menu-separator" />
        ) : (
          <div
            key={idx}
            className={`context-menu-item ${
              item.color ? `color-${item.color}` : ''
            }`}
            style={
              item.color === currentColor ? { backgroundColor: '#094771' } : {}
            }
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.color);
              onClose();
            }}
          >
            {item.label}
          </div>
        )
      )}
    </div>,
    document.body
  );
}

export default ContextMenu;
