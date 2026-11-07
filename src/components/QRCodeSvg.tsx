import React from 'react';

// Lightweight 21x21 QR Code matrix encoder for version 1 QR codes
// or algorithmic deterministic visual pattern with standard finder patterns
interface QRCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeSvg: React.FC<QRCodeSvgProps> = ({ value, size = 120, className = '' }) => {
  // Generate deterministic grid with authentic QR finder patterns (corners)
  const gridSize = 25;
  const cells: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  // 1. Draw standard Finder Patterns at (0,0), (gridSize-7, 0), (0, gridSize-7)
  const drawFinderPattern = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 || // Outer ring
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) // Center 3x3 box
        ) {
          cells[startY + r][startX + c] = true;
        }
      }
    }
  };

  drawFinderPattern(0, 0);
  drawFinderPattern(gridSize - 7, 0);
  drawFinderPattern(0, gridSize - 7);

  // 2. Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // 3. Fill payload deterministically based on input hash
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Don't overwrite finders or timing
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= gridSize - 8;
      const inBottomLeft = r >= gridSize - 8 && c < 8;
      const isTiming = (r === 6 && c >= 8 && c < gridSize - 8) || (c === 6 && r >= 8 && r < gridSize - 8);

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        const seed = Math.sin(hash * 0.001 + r * 31 + c * 17) * 10000;
        const charCode = value.charCodeAt((r * gridSize + c) % value.length) || 42;
        cells[r][c] = ((Math.abs(seed) + charCode) % 3) !== 0;
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${gridSize} ${gridSize}`}
      className={`bg-white p-1 rounded border border-slate-200 ${className}`}
      shapeRendering="crispEdges"
    >
      <rect width={gridSize} height={gridSize} fill="#ffffff" />
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" /> : null
        )
      )}
    </svg>
  );
};
