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
        this.RangeStart = Min;
        
        /** @type {Vector2} */
        this.RangeEnd = Max;
    }

    /**
     * @param {number} x 
     * @param {number} y
     * @param {boolean} padding
     * @returns {boolean}
     */
    isWithinBounds(x, y, padding) {
        /** @type {Vector2} */
        let start = this.RangeStart;
        /** @type {Vector2} */
        let end = this.RangeEnd;
        if (padding) {
            start = new Vector2(this.RangeStart.x - 1, this.RangeStart.y - 1);
            end = new Vector2(this.RangeEnd.x + 1, this.RangeEnd.y + 1);
        }
        return x >= start.x && x <= end.x &&
               y >= start.y && y <= end.y;
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