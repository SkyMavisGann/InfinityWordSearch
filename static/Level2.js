import { keyToVector2, addLetter } from '../utils.js';
import { GridCell } from '../GridCell.js';
import { gameState } from '../main.js';
import { AppearingSections } from '../main.js';
import { AppearingSection } from '../AppearingSection.js';
import { wordList } from '../main.js';

//@ts-check
export const gridData = {
    words: [
        // Main Grid Words (Includes overlapping traps!)
        'CLAMS', 'SHIPS', 'FLOATS', 'WAVES', 'CHOP', 'LENS', 'ALOE', 'MICA', 'CAST', 'SAND', 'SEA',
        
        // Top Section
        'TUNA', 'BASS', 'AURA',
        
        // Left Section
        'BREEZE', 'CRAB', 'DIVES',
        
        // Right 1 Section
        'SWIM', 'DIVE', 'PIER', 'GULF',
        
        // Right 2 Section
        'WARM', 'GASP', 'TENT', 'MAST',
        
        // Bottom Section
        'FROG', 'OTTER', 'SNUGS', 'OCTOPUS',
        
        // The Multi-Section Master Word (13 Letters, Spans 4 distinct zones!)
        'DEEPSEADIVERS'
    ]
};

export function generateLevelData() {
    // --- MAIN GRID (6x6 Base) ---

    // ROW 0: CLAMS (Horizontal: 1,0 to 5,0)
    addLetter(0, 0, "W", gameState, GridCell); // Shared with WAVES
    addLetter(1, 0, "C", gameState, GridCell);
    addLetter(2, 0, "L", gameState, GridCell);
    addLetter(3, 0, "A", gameState, GridCell);
    addLetter(4, 0, "M", gameState, GridCell);
    addLetter(5, 0, "S", gameState, GridCell); // Shared with SAND

    // ROW 1: Vertical Continuations
    addLetter(0, 1, "A", gameState, GridCell);
    addLetter(1, 1, "H", gameState, GridCell);
    addLetter(2, 1, "E", gameState, GridCell);
    addLetter(3, 1, "L", gameState, GridCell);
    addLetter(4, 1, "I", gameState, GridCell);
    addLetter(5, 1, "A", gameState, GridCell);

    // ROW 2: Vertical Continuations
    addLetter(0, 2, "V", gameState, GridCell);
    addLetter(1, 2, "O", gameState, GridCell);
    addLetter(2, 2, "N", gameState, GridCell);
    addLetter(3, 2, "O", gameState, GridCell);
    addLetter(4, 2, "C", gameState, GridCell); // Starts CAST
    addLetter(5, 2, "N", gameState, GridCell);

    // ROW 3: The Center of the Master Word (E P S E A D)
    addLetter(0, 3, "E", gameState, GridCell); // TRAP: Shared with WAVES!
    addLetter(1, 3, "P", gameState, GridCell);
    addLetter(2, 3, "S", gameState, GridCell); // Starts SEA
    addLetter(3, 3, "E", gameState, GridCell);
    addLetter(4, 3, "A", gameState, GridCell);
    addLetter(5, 3, "D", gameState, GridCell); // TRAP: Shared with SAND!

    // ROW 4: SHIPS (Horizontal: 0,4 to 4,4)
    addLetter(0, 4, "S", gameState, GridCell);
    addLetter(1, 4, "H", gameState, GridCell);
    addLetter(2, 4, "I", gameState, GridCell);
    addLetter(3, 4, "P", gameState, GridCell);
    addLetter(4, 4, "S", gameState, GridCell);
    addLetter(5, 4, "E", gameState, GridCell); // Filler to avoid breaking SAND

    // ROW 5: FLOATS (Horizontal 0,5 to 5,5) - THE GOLDEN KEY!
    addLetter(0, 5, "F", gameState, GridCell);
    addLetter(1, 5, "L", gameState, GridCell);
    addLetter(2, 5, "O", gameState, GridCell);
    addLetter(3, 5, "A", gameState, GridCell);
    addLetter(4, 5, "T", gameState, GridCell);
    addLetter(5, 5, "S", gameState, GridCell);


    // --- APPEARING SECTIONS ---

    // SECTION 1: TOP (Triggered by finding CLAMS at y=0)
    /** @type {GridCell[]} */
    const topCells = [
        new GridCell(3, -3, "T"), new GridCell(3, -2, "U"), new GridCell(3, -1, "N"), // TUNA (Connects to A at 3,0)
        new GridCell(5, -3, "B"), new GridCell(5, -2, "A"), new GridCell(5, -1, "S"), // BASS (Connects to S at 5,0)
        new GridCell(2, -2, "A"), new GridCell(4, -2, "R") // AURA (Horizontal cross)
    ];
    AppearingSections.push(new AppearingSection(topCells, gameState));

    // SECTION 2: LEFT (Triggered safely by FLOATS touching x=0)
    // Provides the "DE" for DEEPSEADIVERS
    /** @type {GridCell[]} */
    const leftCells = [
        new GridCell(-2, 3, "D"), new GridCell(-1, 3, "E"), // Master Word Start
        new GridCell(-2, 4, "I"), new GridCell(-2, 5, "V"), new GridCell(-2, 6, "E"), new GridCell(-2, 7, "S"), // DIVES
        new GridCell(-1, 0, "B"), new GridCell(-1, 1, "R"), new GridCell(-1, 2, "E"), new GridCell(-1, 4, "Z"), new GridCell(-1, 5, "E"), // BREEZE
        new GridCell(-4, 0, "C"), new GridCell(-3, 0, "R"), new GridCell(-2, 0, "A") // CRAB (Connects to B at -1,0)
    ];
    AppearingSections.push(new AppearingSection(leftCells, gameState));

    // SECTION 3: RIGHT 1 (Triggered safely by FLOATS touching x=5)
    // Provides the "IVE" for DEEPSEADIVERS
    /** @type {GridCell[]} */
    const right1Cells = [
        new GridCell(6, 3, "I"), new GridCell(7, 3, "V"), new GridCell(8, 3, "E"), // Master Word Mid
        new GridCell(6, 1, "S"), new GridCell(6, 2, "W"), new GridCell(6, 4, "M"), // SWIM (Trap!)
        new GridCell(7, 1, "D"), new GridCell(7, 2, "I"), new GridCell(7, 4, "E"), // DIVE (Trap!)
        new GridCell(8, 1, "P"), new GridCell(8, 2, "I"), new GridCell(8, 4, "R"), // PIER (Trap!)
        new GridCell(8, 5, "G"), new GridCell(8, 6, "U"), new GridCell(8, 7, "L"), new GridCell(8, 8, "F") // GULF (Safe Right 2 Trigger!)
    ];
    AppearingSections.push(new AppearingSection(right1Cells, gameState));

    // SECTION 4: RIGHT 2 (Triggered safely by GULF touching x=8)
    // Provides the "RS" for DEEPSEADIVERS
    /** @type {GridCell[]} */
    const right2Cells = [
        new GridCell(9, 3, "R"), new GridCell(10, 3, "S"), // Master Word End
        new GridCell(9, 1, "W"), new GridCell(9, 2, "A"), new GridCell(9, 4, "M"), // WARM (Trap!)
        new GridCell(10, 1, "G"), new GridCell(10, 2, "A"), new GridCell(10, 4, "P"), // GASP (Trap!)
        new GridCell(11, 0, "T"), new GridCell(11, 1, "E"), new GridCell(11, 2, "N"), new GridCell(11, 3, "T"), // TENT (Safe)
        new GridCell(9, 6, "M"), new GridCell(10, 6, "A"), new GridCell(11, 6, "S"), new GridCell(12, 6, "T") // MAST (Safe)
    ];
    AppearingSections.push(new AppearingSection(right2Cells, gameState));

    // SECTION 5: BOTTOM (Triggered safely by FLOATS touching y=5)
    /** @type {GridCell[]} */
    const bottomCells = [
        new GridCell(0, 6, "R"), new GridCell(0, 7, "O"), new GridCell(0, 8, "G"), // FROG (Connects to F at 0,5)
        new GridCell(2, 6, "T"), new GridCell(2, 7, "T"), new GridCell(2, 8, "E"), new GridCell(2, 9, "R"), // OTTER (Connects to O at 2,5)
        new GridCell(5, 6, "N"), new GridCell(5, 7, "U"), new GridCell(5, 8, "G"), new GridCell(5, 9, "S"), // SNUGS (Connects to S at 5,5)
        new GridCell(1, 7, "C"), new GridCell(3, 7, "O"), new GridCell(4, 7, "P"), new GridCell(6, 7, "S") // OCTOPUS (Crosses the 3 vertical words!)
    ];
    AppearingSections.push(new AppearingSection(bottomCells, gameState));

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