// @ts-check

export const cellSize = 40;

export class GridCell {
    /**
     * @param {number} x
     * @param {number} y
     * @param {string} letter
     */
    constructor(x, y, letter) {
        this.x = x;
        this.y = y;
        this.letter = letter;
        
        /** @type {HTMLButtonElement | null} */
        this.domElement = null; 
        
        /** @type {boolean} */
        this.isFound = false;
    }

    /**
     * @returns {HTMLButtonElement}
     */
    render() {
        const btn = document.createElement('button');
        btn.classList.add('grid-cell');
        btn.textContent = this.letter;

        btn.style.left = `${this.x * cellSize}px`;
        btn.style.top = `${this.y * cellSize}px`;

        btn.dataset.x = String(this.x);
        btn.dataset.y = String(this.y);

        if (this.isFound) {
            btn.classList.add('found');
        }
        
        this.domElement = btn;
        return btn;
    }
}