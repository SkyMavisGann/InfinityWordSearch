// @ts-check
import { keyToVector2 } from './utils.js';
import { cellSize } from './GridCell.js';

export class WordLine {
    /**
     * @param {string} startKey (e.g., "0,0")
     * @param {string} endKey   (e.g., "5,5")
     */
    constructor(startKey, endKey) {
        this.startKey = startKey;
        this.endKey = endKey;
    }

    /**
     * @returns {HTMLDivElement}
     */
    render() {
        const startVec = keyToVector2(this.startKey);
        const endVec = keyToVector2(this.endKey);

        // Find the absolute center pixel of both cells
        const startX = (startVec.x * cellSize) + (cellSize / 2);
        const startY = (startVec.y * cellSize) + (cellSize / 2);
        const endX = (endVec.x * cellSize) + (cellSize / 2);
        const endY = (endVec.y * cellSize) + (cellSize / 2);

        // Trigonometry to find distance and angle!
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Math.atan2 gives us the angle in radians, multiply to get degrees
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        const line = document.createElement('div');
        line.classList.add('word-line');
        
        // We draw the line from center to center
        line.style.width = `${distance}px`;
        line.style.left = `${startX}px`;
        line.style.top = `${startY}px`;
        
        // We set the pivot point to the absolute left center of the div
        line.style.transformOrigin = '0% 50%';
        // Shift it up by half its height so it aligns perfectly with the cell centers
        line.style.marginTop = '-10px'; 
        
        // Rotate it to connect the dots!
        line.style.transform = `rotate(${angle}deg)`;

        return line;
    }
}