import { keyToVector2, addLetter } from '../utils.js';
import { GridCell } from '../GridCell.js';
import { gameState } from '../main.js';
import { AppearingSections } from '../main.js';
import { AppearingSection } from '../AppearingSection.js';
import { wordList } from '../main.js';

//@ts-check
export const gridData = {
    words: [
        // Main Grid Words
        'COMETS', 'CRATER', 'COSMIC', 'STAR', 'RADAR', 
        'OPEN', 'SUN', 'MATE', 'TAIL', 'MARS', 
        
        // Section 1 Words
        'LIP', 'SAIL', 
        
        // Section 2 Words
        'GHOSTS', 'HAT', 'HOSTS', 
        
        // The Multi-Section Master Word
        'STARLIGHT', 
        
        // Section 3 Words
        'MUSIC', 'MUSE', 
        
        // Section 4 Words
        'RADIANT', 'ANT', 'DIALS'
    ]
};

export function generateLevelData() {
    // --- MAIN GRID (6x6 Base) ---

    // COMETS (Horizontal: 0,0 to 5,0)
    addLetter(0, 0, "C", gameState, GridCell);
    addLetter(1, 0, "O", gameState, GridCell);
    addLetter(2, 0, "M", gameState, GridCell);
    addLetter(3, 0, "E", gameState, GridCell);
    addLetter(4, 0, "T", gameState, GridCell);
    addLetter(5, 0, "S", gameState, GridCell);

    // CRATER (Vertical: 0,0 to 0,5) - Shares 'C' with COMETS
    addLetter(0, 1, "R", gameState, GridCell);
    addLetter(0, 2, "A", gameState, GridCell);
    addLetter(0, 3, "T", gameState, GridCell);
    addLetter(0, 4, "E", gameState, GridCell);
    addLetter(0, 5, "R", gameState, GridCell);

    // COSMIC (Diagonal: 0,0 to 5,5)
    addLetter(1, 1, "O", gameState, GridCell);
    addLetter(2, 2, "S", gameState, GridCell);
    addLetter(3, 3, "M", gameState, GridCell);
    addLetter(4, 4, "I", gameState, GridCell);
    addLetter(5, 5, "C", gameState, GridCell);

    // STAR (Horizontal: 2,1 to 5,1)
    addLetter(2, 1, "S", gameState, GridCell);
    addLetter(3, 1, "T", gameState, GridCell);
    addLetter(4, 1, "A", gameState, GridCell);
    addLetter(5, 1, "R", gameState, GridCell);

    // RADAR (Backwards Horizontal: 4,5 to 0,5) - Shares 'R' with CRATER
    addLetter(1, 5, "A", gameState, GridCell);
    addLetter(2, 5, "D", gameState, GridCell);
    addLetter(3, 5, "A", gameState, GridCell);
    addLetter(4, 5, "R", gameState, GridCell);

    // OPEN (Vertical: 1,1 to 1,4) - Shares 'O' with COSMIC
    addLetter(1, 2, "P", gameState, GridCell);
    addLetter(1, 3, "E", gameState, GridCell);
    addLetter(1, 4, "N", gameState, GridCell);

    // SUN (Vertical: 2,2 to 2,4) - Shares 'S' with COSMIC
    addLetter(2, 3, "U", gameState, GridCell);
    addLetter(2, 4, "N", gameState, GridCell);

    // MATE (Upwards Vertical: 3,3 to 3,0) 
    // Shares 'M' with COSMIC, 'T' with STAR, and 'E' with COMETS
    addLetter(3, 2, "A", gameState, GridCell);

    // TAIL (Vertical: 4,0 to 4,3) - Shares 'T' with COMETS, 'A' with STAR
    addLetter(4, 2, "I", gameState, GridCell);
    addLetter(4, 3, "L", gameState, GridCell);

    // MARS (Upwards Vertical: 5,3 to 5,0) - Shares 'R' with STAR, 'S' with COMETS
    addLetter(5, 3, "M", gameState, GridCell);
    addLetter(5, 2, "A", gameState, GridCell);


    // --- APPEARING SECTIONS ---

    // SECTION 1: Adds "LI" to STAR + reveals "LIP" and "SAIL"
    // Triggered by finding STAR in the main grid
    /** @type {GridCell[]} */
    const section1Cells = [
        new GridCell(6, 1, "L"),
        new GridCell(7, 1, "I"),
        new GridCell(6, 2, "I"),
        new GridCell(6, 3, "P"),
        new GridCell(7, -1, "S"),
        new GridCell(7, 0, "A"),
        new GridCell(7, 2, "L")
    ];
    AppearingSections.push(new AppearingSection(section1Cells, gameState));

    // SECTION 2: Adds "GHT" to STARLI + reveals "GHOST" and "HAT"
    // Triggered by finding SAIL in Section 1
    /** @type {GridCell[]} */
    const section2Cells = [
        new GridCell(8, 1, "G"),
        new GridCell(9, 1, "H"),
        new GridCell(10, 1, "T"),
        new GridCell(8, 2, "H"),
        new GridCell(8, 3, "O"),
        new GridCell(8, 4, "S"),
        new GridCell(8, 5, "T"),
        new GridCell(8, 6, "S"),
        new GridCell(9, 2, "A"),
        new GridCell(9, 3, "T")
    ];
    AppearingSections.push(new AppearingSection(section2Cells, gameState));

    // SECTION 3: Adds "MUSIC", "MUSE", and another "SUN" (Expands left)
    // Triggered by finding COMETS, CRATER, or COSMIC at (0,0)
    /** @type {GridCell[]} */
    const section3Cells = [
        new GridCell(-1, 0, "I"),
        new GridCell(-2, 0, "S"),
        new GridCell(-3, 0, "U"),
        new GridCell(-4, 0, "M"),
        new GridCell(-4, 1, "U"),
        new GridCell(-4, 2, "S"),
        new GridCell(-4, 3, "E"),
        new GridCell(-2, 1, "U"),
        new GridCell(-2, 2, "N")
    ];
    AppearingSections.push(new AppearingSection(section3Cells, gameState));

    // SECTION 4: Adds "RADIANT", "ANT", and "DIAL" (Expands downwards)
    // Triggered by finding RADAR at (4,5)
    /** @type {GridCell[]} */
    const section4Cells = [
        new GridCell(4, 6, "A"),
        new GridCell(4, 7, "D"),
        new GridCell(4, 8, "I"),
        new GridCell(4, 9, "A"),
        new GridCell(4, 10, "N"),
        new GridCell(4, 11, "T"),
        new GridCell(5, 9, "N"),
        new GridCell(6, 9, "T"),
        new GridCell(5, 7, "I"),
        new GridCell(6, 7, "A"),
        new GridCell(7, 7, "L"),
        new GridCell(8, 7, "S")
    ];
    AppearingSections.push(new AppearingSection(section4Cells, gameState));

    if (wordList) {
        wordList.innerHTML = '';
        gridData.words.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            wordList.appendChild(li);
        });
    }
}