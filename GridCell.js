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

        /** @type {boolean} */
        this.isHidden = false;

        /** @type {number} */
        this.opacity = 1.0;

        /** @type {number} */
        this.foundCount = 0;
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


        btn.style.opacity = String(this.opacity);
        if (this.isFound) {
            btn.classList.add('found');

            // Base pink is 60% lightness. Drops 15% for each overlap, stopping at 15% (very dark)
            const lightness = Math.max(15, 88 - ((this.foundCount - 1) * 15));
            const saturation = Math.max(30, 96.61 - ((this.foundCount - 1) * 30));
            btn.style.backgroundColor = `hsl(298.95, ${saturation}%, ${lightness}%)`;
            btn.style.color = "white";
        }

        if (this.isHidden) {
            btn.classList.add('hidden-cell');
        }
        
        this.domElement = btn;
        return btn;
    }
}