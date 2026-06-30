// @ts-check

export class Vector2 {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Converts a string coordinate key into a Vector2
 * @param {string} key
 * @returns {Vector2}
 */
export function keyToVector2(key) {
    const [x, y] = key.split(',').map(Number);
    return new Vector2(x, y);
}

/**
 * Calculates all grid coordinates in a straight line between two points
 * @param {number} startX
 * @param {number} startY
 * @param {number} endX
 * @param {number} endY
 * @returns {string[]} Array of coordinate string keys (e.g., ["0,0", "1,1"])
 */
export function getCellsInLine(startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;

    const isHorizontal = dy === 0;
    const isVertical = dx === 0;
    const isDiagonal = Math.abs(dx) === Math.abs(dy);

    if (!isHorizontal && !isVertical && !isDiagonal) {
        return [];
    }

    const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
    const length = Math.max(Math.abs(dx), Math.abs(dy)) + 1;

    /** @type {string[]} */
    const cellsInPath = [];

    for (let i = 0; i < length; i++) {
        const x = startX + (stepX * i);
        const y = startY + (stepY * i);
        cellsInPath.push(`${x},${y}`);
    }
    return cellsInPath;
}

/**
 * Helper to safely add a new GridCell to the game state Map
 * @param {number} x
 * @param {number} y
 * @param {string} letter
 * @param {Map<string, any>} state
 * @param {new (x: number, y: number, letter: string) => any} GridCellClass
 */
export function addLetter(x, y, letter, state, GridCellClass) {
    const key = `${x},${y}`;
    if (!state.has(key)) {
        state.set(key, new GridCellClass(x, y, letter));
    }
}