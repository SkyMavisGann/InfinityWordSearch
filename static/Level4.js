import { keyToVector2, addLetter } from '../utils.js';
import { GridCell } from '../GridCell.js';
import { gameState } from '../main.js';
import { AppearingSections } from '../main.js';
import { AppearingSection } from '../AppearingSection.js';
import { wordList } from '../main.js';

//@ts-check
export const gridData = {
    words: [
        // The Mega-Spanner (Spans from Top-Left to Bottom-Right)
        'INTERSTELLAR',
        
        // Main Grid Branching Spanners
        'MEASUREMENT', 'VARIOUSLY', 'CRUISER',
        
        // Main Grid Core Words
        'CLIQUE', 'QUIETS', 'MAGIC', 'GUISE',
        
        // Top Words
        'ASTRONAUT', 'VENUS', 'ORBIT', 'STARS', 'EVASUIT',
        
        // Left Words
        'GALAXIES', 'LASER', 'CORE', 'BIGBANG', 'REDDWARF',
        
        // Right Words
        'METEOR', 'PLANET', 'EARTH', 'TEMPERATURE', 'RARE',
        
        // Bottom Words
        'PHYSICS', 'ISOTOPE', 'FLARE', "PARSECS",
        
        // Bottom-Right Words
        'ASTEROID', 'LUNAR'
    ]
};

export function generateLevelData() {
    // ==========================================
    // --- MAIN GRID (6x6 Astronomy Hub) ---
    // ==========================================

    // INTERSTELLAR (Diagonal from Top-Left to Bottom-Right)
    addLetter(0, 0, "T", gameState, GridCell); 
    addLetter(1, 1, "E", gameState, GridCell); 
    addLetter(2, 2, "R", gameState, GridCell); 
    addLetter(3, 3, "S", gameState, GridCell); 
    addLetter(4, 4, "T", gameState, GridCell); 
    addLetter(5, 5, "E", gameState, GridCell); 

    // MEASUREMENT (Horizontal starting at Row 1)
    addLetter(0, 1, "M", gameState, GridCell);
    // 1,1 is E
    addLetter(2, 1, "A", gameState, GridCell);
    addLetter(3, 1, "S", gameState, GridCell);
    addLetter(4, 1, "U", gameState, GridCell);
    addLetter(5, 1, "R", gameState, GridCell);

    // VARIOUSLY (Vertical starting at Col 2)
    addLetter(2, 0, "V", gameState, GridCell);
    // 2,1 is A, 2,2 is R
    addLetter(2, 3, "I", gameState, GridCell);
    addLetter(2, 4, "O", gameState, GridCell);
    addLetter(2, 5, "U", gameState, GridCell);

    // CRUISER (Horizontal starting at Row 5)
    addLetter(0, 5, "C", gameState, GridCell);
    addLetter(1, 5, "R", gameState, GridCell);
    // 2,5 is U
    addLetter(3, 5, "I", gameState, GridCell);
    addLetter(4, 5, "S", gameState, GridCell);
    // 5,5 is E
    addLetter(6, 5, "R", gameState, GridCell); // Pokes into the Right Section

    // CLIQUE (Diagonal Up-Right)
    // 0,5 is C
    addLetter(1, 4, "L", gameState, GridCell);
    // 2,3 is I
    addLetter(3, 2, "Q", gameState, GridCell);
    // 4,1 is U
    addLetter(5, 0, "E", gameState, GridCell);

    // QUIETS (Vertical down Col 4)
    addLetter(4, 0, "Q", gameState, GridCell);
    // 4,1 is U
    addLetter(4, 2, "I", gameState, GridCell);
    addLetter(4, 3, "E", gameState, GridCell);
    // 4,4 is T, 4,5 is S

    // MAGIC (Vertical down Col 0) - This is the bridge that opens the Left Sections!
    // 0,1 is M
    addLetter(0, 2, "A", gameState, GridCell);
    addLetter(0, 3, "G", gameState, GridCell);
    addLetter(0, 4, "I", gameState, GridCell);
    // 0,5 is C

    // GUISE (Horizontal across Row 3)
    // 0,3 is G
    addLetter(1, 3, "U", gameState, GridCell);
    // 2,3 is I, 3,3 is S, 4,3 is E
    
    // Remaining Filler Letters
    addLetter(1, 0, "H", gameState, GridCell);
    addLetter(3, 0, "O", gameState, GridCell);
    addLetter(1, 2, "P", gameState, GridCell);
    addLetter(5, 2, "A", gameState, GridCell);
    addLetter(5, 3, "R", gameState, GridCell);
    addLetter(5, 4, "T", gameState, GridCell);


    // ==========================================
    // --- 10 APPEARING SECTIONS ---
    // ==========================================

    // SECTION 1: Top Inner (Triggered by T at 0,0)
    /** @type {GridCell[]} */
    const sec1Cells = [
        new GridCell(-2, -2, "I"), new GridCell(-1, -1, "N"), // INTERSTELLAR Prefix
        new GridCell(0, -1, "U"), new GridCell(0, -2, "A"), // ASTRONAUT Inner
        new GridCell(-3, -1, "V"), new GridCell(-2, -1, "E"), new GridCell(1, -1, "S") // VENUS
    ];
    AppearingSections.push(new AppearingSection(sec1Cells, gameState));

    // SECTION 2: Top Outer (Triggered by ASTRONAUT)
    /** @type {GridCell[]} */
    const sec2Cells = [
        new GridCell(0, -8, "A"), new GridCell(0, -7, "S"), new GridCell(0, -6, "T"), new GridCell(0, -5, "R"), new GridCell(0, -4, "O"), new GridCell(0, -3, "N"), // ASTRONAUT Outer
        new GridCell(1, -4, "R"), new GridCell(2, -4, "B"), new GridCell(3, -4, "I"), new GridCell(4, -4, "T"), // ORBIT
        new GridCell(-3, -5, "S"), new GridCell(-2, -5, "T"), new GridCell(-1, -5, "A"), new GridCell(1, -5, "S") // STARS
    ];
    AppearingSections.push(new AppearingSection(sec2Cells, gameState));


    // SECTION 3: Left Inner (Triggered by MAGIC touching X=0)
    /** @type {GridCell[]} */
    const sec3Cells = [
        new GridCell(-2, 3, "E"), new GridCell(-1, 3, "S"), // GALAXIES Tail
        new GridCell(-1, 1, "L"), new GridCell(-1, 2, "A"), new GridCell(-1, 4, "E"), new GridCell(-1, 5, "R"), // LASER
        new GridCell(-2, 0, "C"), new GridCell(-2, 1, "O"), new GridCell(-2, 2, "R"), // CORE
        new GridCell(-2, 4, "D"), new GridCell(-2, 5, "D"), new GridCell(-2, 6, "W"), new GridCell(-2, 7, "A"), new GridCell(-2, 8, "R"), new GridCell(-2, 9, "F")
    ];
    AppearingSections.push(new AppearingSection(sec3Cells, gameState));

    // SECTION 4: Left Outer (Triggered by LASER / GALAXIES)
    /** @type {GridCell[]} */
    const sec4Cells = [
        new GridCell(-8, 3, "G"), new GridCell(-7, 3, "A"), new GridCell(-6, 3, "L"), new GridCell(-5, 3, "A"), new GridCell(-4, 3, "X"), new GridCell(-3, 3, "I"), // GALAXIES Start
        new GridCell(-8, 1, "B"), new GridCell(-8, 2, "I"), new GridCell(-8, 4, "B"), new GridCell(-8, 5, "A"), new GridCell(-8, 6, "N"), new GridCell(-8, 7, "G") // BIGBANG
    ];
    AppearingSections.push(new AppearingSection(sec4Cells, gameState));


    // SECTION 5: Right Inner (Triggered by R at 5,1)
    /** @type {GridCell[]} */
    const sec5Cells = [
        new GridCell(6, 1, "E"), new GridCell(7, 1, "M"), new GridCell(8, 1, "E"), new GridCell(9, 1, "N"), // MEASUREMENT
        new GridCell(7, 2, "E"), new GridCell(7, 3, "T"), new GridCell(7, 4, "E"), new GridCell(7, 5, "O"), new GridCell(7, 6, "R"), // METEOR
        new GridCell(8, 2, "A"), new GridCell(8, 3, "R"), new GridCell(8, 4, "T"), new GridCell(8, 5, "H") // EARTH
    ];
    AppearingSections.push(new AppearingSection(sec5Cells, gameState));

    // SECTION 6: Right Outer (Triggered by MEASUREMENT)
    /** @type {GridCell[]} */
    const sec6Cells = [
        new GridCell(10, 1, "T"), // MEASUREMENT End
        new GridCell(9, -2, "P"), new GridCell(9, -1, "L"), new GridCell(9, 0, "A"), new GridCell(9, 2, "E"), new GridCell(9, 3, "T"), // PLANET
        new GridCell(10, 2, "E"), new GridCell(10, 3, "M"), new GridCell(10, 4, "P"), new GridCell(10, 5, "E"), new GridCell(10, 6, "R"), new GridCell(10, 7, "A")
    ];
    AppearingSections.push(new AppearingSection(sec6Cells, gameState));


    // SECTION 7: Bottom Inner (Triggered by U at 2,5)
    /** @type {GridCell[]} */
    const sec7Cells = [
        new GridCell(2, 6, "S"), new GridCell(2, 7, "L"), new GridCell(2, 8, "Y"), // VARIOUSLY End
        new GridCell(0, 8, "P"), new GridCell(1, 8, "H"), new GridCell(3, 8, "S"), new GridCell(4, 8, "I"), new GridCell(5, 8, "C"), new GridCell(6, 8, "S"), // PHYSICS
        new GridCell(3, 7, "I") // ISOTOPE Start
    ];
    AppearingSections.push(new AppearingSection(sec7Cells, gameState));

    // SECTION 8: Bottom Outer (Triggered by PHYSICS)
    /** @type {GridCell[]} */
    const sec8Cells = [
        new GridCell(3, 9, "O"), new GridCell(3, 10, "T"), new GridCell(3, 11, "O"), new GridCell(3, 12, "P"), new GridCell(3, 13, "E"),// ISOTOPE Tail
        new GridCell(-1, 9, "L"), new GridCell(0, 9, "A"), new GridCell(1, 9, "R"), new GridCell(2, 9, "E"), 
    ];
    AppearingSections.push(new AppearingSection(sec8Cells, gameState));


    // SECTION 9: Bottom-Right Inner (Triggered by E at 5,5)
    /** @type {GridCell[]} */
    const sec9Cells = [
        new GridCell(6, 6, "L"), new GridCell(7, 7, "L"), // INTERSTELLAR
        new GridCell(7, 8, "U"), new GridCell(7, 9, "N"), new GridCell(7, 10, "A"), new GridCell(7, 11, "R"), // LUNAR
        new GridCell(4, 12, "A"), new GridCell(5, 12, "R"), new GridCell(6, 12, "S"), new GridCell(7, 12, "E"), new GridCell(8, 12, "C"), new GridCell(9, 12, "S") //PARSECS
    ];
    AppearingSections.push(new AppearingSection(sec9Cells, gameState));

    // SECTION 10: Bottom-Right Outer (Triggered by LUNAR)
    /** @type {GridCell[]} */
    const sec10Cells = [
        new GridCell(8, 8, "A"), new GridCell(9, 9, "R"), // INTERSTELLAR End
        new GridCell(9, 8, "S"), new GridCell(10, 8, "T"), new GridCell(11, 8, "E"), new GridCell(12, 8, "R"), new GridCell(13, 8, "O"), new GridCell(14, 8, "I"), new GridCell(15, 8, "D"), // ASTEROID
        new GridCell(10, 9, "U"), new GridCell(10, 10, "R"), new GridCell(10, 11, "E")
    ];
    AppearingSections.push(new AppearingSection(sec10Cells, gameState));

        // SECTION 11: TOP Inner (Triggered by RARE)
    /** @type {GridCell[]} */
    const sec11Cells = [
        new GridCell(3, -1, "A"), new GridCell(4, -2, "S"), new GridCell(5, -3, "U"), new GridCell(6, -4, "I"), new GridCell(7, -5, "T") //EVA SUIT
    ];
    AppearingSections.push(new AppearingSection(sec11Cells, gameState));

    // UI Updates
    if (wordList) {
        wordList.innerHTML = '';
        gridData.words.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            wordList.appendChild(li);
        });
    }
}