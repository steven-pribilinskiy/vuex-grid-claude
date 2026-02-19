/**
 * Grid data generator utility.
 *
 * Simulates async data loading with a 500ms delay.
 * Produces deterministic data based on cell coordinates so
 * scrolling back to the same area shows consistent values.
 */

const GRID_SIZE = 40000;
const LOAD_DELAY_MS = 500;

/**
 * Generate cell data for a chunk of cells.
 *
 * @param {number} startRow - First row index of the chunk
 * @param {number} startCol - First column index of the chunk
 * @param {number} chunkSize - Number of rows/cols per chunk side
 * @returns {Promise<Object>} Map of "row-col" keys to { checked, value }
 */
export function generateChunkData(startRow, startCol, chunkSize) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cells = {};

      for (let r = startRow; r < startRow + chunkSize && r < GRID_SIZE; r++) {
        for (let c = startCol; c < startCol + chunkSize && c < GRID_SIZE; c++) {
          const key = `${r}-${c}`;
          // Deterministic seed from coordinates
          const seed = (r * 40000 + c) % 1000;
          cells[key] = {
            checked: seed % 7 === 0,
            value: String(seed),
          };
        }
      }

      resolve(cells);
    }, LOAD_DELAY_MS);
  });
}
