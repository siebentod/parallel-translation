import { useEffect, useState } from 'react';

export default function Arrow({
  fromId = 'add-translation-text',
  toId = 'add-translation-button',
}) {
  const [path, setPath] = useState('');

  useEffect(() => {
    function updateArrow() {
      const fromEl = document.getElementById(fromId);
      const toEl = document.getElementById(toId);
      const svg = document.getElementById('arrow-svg');
      
      if (!fromEl || !toEl || !svg) return;

      // Получаем позицию SVG контейнера
      const svgRect = svg.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // Абсолютная позиция SVG на странице
      const svgTop = svgRect.top + scrollTop;
      const svgLeft = svgRect.left + scrollLeft;

      // Получаем позиции элементов
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // Вычисляем координаты относительно SVG контейнера
      const startX = fromRect.left + scrollLeft - svgLeft - 25;
      const startY = fromRect.top + scrollTop - svgTop + fromRect.height / 2 + 2;

      const endX = toRect.left + scrollLeft - svgLeft + toRect.width / 2;
      const endY = toRect.bottom + scrollTop - svgTop + 30;

      // Corner position
      const cornerX = endX;
      const cornerY = startY;
      const radius = 30;

      // Calculate signs for directions
      const sign_h = Math.sign(endX - startX);
      const sign_v = Math.sign(endY - startY);

      // Sweep flag based on turn direction
      const sweep = (sign_h * sign_v > 0) ? 1 : 0;

      const d = `
        M ${startX},${startY}
        H ${cornerX - sign_h * radius}
        A ${radius} ${radius} 0 0 ${sweep} ${cornerX} ${cornerY + sign_v * radius}
        V ${endY}
      `;

      setPath(d);
    }

    updateArrow();
    window.addEventListener('resize', updateArrow);
    window.addEventListener('scroll', updateArrow);
    
    return () => {
      window.removeEventListener('resize', updateArrow);
      window.removeEventListener('scroll', updateArrow);
    };
  }, [fromId, toId]);

  return (
    <svg
      id="arrow-svg"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="18"
          markerHeight="18"
          refX="9"
          refY="9"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path 
            d="M2,2 Q9,6 15,9" 
            stroke="var(--color-red-bg)" 
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
          <path 
            d="M2,16 Q9,12 15,9" 
            stroke="var(--color-red-bg)" 
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
        </marker>
      </defs>
      <path
        d={path}
        stroke="var(--color-red-bg)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
        style={{ filter: 'drop-shadow(0 0 1px black) drop-shadow(0 0 1px black)' }}
      />
    </svg>
  );
}