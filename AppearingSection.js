// @ts-check
import { Vector2, addLetter } from './utils.js';
import { GridCell } from './GridCell.js';

export class AppearingSection {
    /**
     * @param {GridCell[]} gridCells
     */
    constructor(gridCells) {
        /** @type {GridCell[]} */
        this.gridCells = gridCells;
        
        /** @type {boolean} */
        this.hasTriggered = false;
        
        let Min = new Vector2(Infinity, Infinity);
        let Max = new Vector2(-Infinity, -Infinity);
        
        gridCells.forEach(cell => {
            Min.x = Math.min(Min.x, cell.x);
            Min.y = Math.min(Min.y, cell.y);
            Max.x = Math.max(Max.x, cell.x);
            Max.y = Math.max(Max.y, cell.y);
        });

        /** @type {Vector2} */
        this.RangeStart = new Vector2(Min.x - 1, Min.y - 1);
        
        /** @type {Vector2} */
        this.RangeEnd = new Vector2(Max.x + 1, Max.y + 1);
    }

    /**
     * @param {number} x 
     * @param {number} y
     * @returns {boolean}
     */
    isWithinBounds(x, y) {
        return x >= this.RangeStart.x && x <= this.RangeEnd.x &&
               y >= this.RangeStart.y && y <= this.RangeEnd.y;
    }

    /**
     * Triggers the addition of letters. Returns true if successfully triggered.
     * @param {Map<string, GridCell>} gameState
     * @returns {boolean}
     */
    addAllLetters(gameState) {
        if (this.hasTriggered) return false; 
        this.hasTriggered = true;

        this.gridCells.forEach(gridLetter => {
            addLetter(gridLetter.x, gridLetter.y, gridLetter.letter, gameState, GridCell);
        });
        
        return true;
    }
}