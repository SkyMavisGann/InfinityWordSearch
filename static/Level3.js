import { keyToVector2, addLetter } from '../utils.js';
import { GridCell } from '../GridCell.js';
import { gameState } from '../main.js';
import { AppearingSections } from '../main.js';
import { AppearingSection } from '../AppearingSection.js';
import { wordList } from '../main.js';

//@ts-check
export const gridData = {
    words: [
        // Main Grid Core Traps (Finding these breaks the long words!)
        'WATERS', 'ENRICH', 'IGUANA', 
        'GRAVEL', 'HALITE', 'THERMS', 
        'WEIGHT', 'SHALES',

        // The Dials (Safe words used to unlock sections)
        'CELL', 'ATOM', 'ION', 'GAS', 
        'FOG', 'ICE', 'MUD', 'ASH',

        // The Right Corridor (Spans out from SHALES)
        'HYDROLOGY', 'ASTRONOMY', 'LATITUDES',

        // The Left Corridor (Spans out from WEIGHT)
        'ELECTRONS', 'ISOTOPES', 'GEOLOGY',

        // The Top Corridor (Spans out from WATERS)
        'ATMOSPHERE', 'TECTONICS', 'EVOLUTION',

        // The Bottom Corridor (Spans out from THERMS)
        'HABITATS', 'ECOSYSTEMS', 'RADIATION'
    ]
};

export function generateLevelData() {
    // ==========================================
    // --- MAIN GRID (6x6 Science Core) ---
    // ==========================================

    // ROW 0: WATERS (Trap for Top Corridor)
    addLetter(0, 0, "W", gameState, GridCell);
    addLetter(1, 0, "A", gameState, GridCell);
    addLetter(2, 0, "T", gameState, GridCell);
    addLetter(3, 0, "E", gameState, GridCell);
    addLetter(4, 0, "R", gameState, GridCell);
    addLetter(5, 0, "S", gameState, GridCell);

    // ROW 1: ENRICH (Trap for Left Corridor)
    addLetter(0, 1, "E", gameState, GridCell);
    addLetter(1, 1, "N", gameState, GridCell);
    addLetter(2, 1, "R", gameState, GridCell);
    addLetter(3, 1, "I", gameState, GridCell);
    addLetter(4, 1, "C", gameState, GridCell);
    addLetter(5, 1, "H", gameState, GridCell);

    // ROW 2: IGUANA (Trap for Left Corridor)
    addLetter(0, 2, "I", gameState, GridCell);
    addLetter(1, 2, "G", gameState, GridCell);
    addLetter(2, 2, "U", gameState, GridCell);
    addLetter(3, 2, "A", gameState, GridCell);
    addLetter(4, 2, "N", gameState, GridCell);
    addLetter(5, 2, "A", gameState, GridCell);

    // ROW 3: GRAVEL (Trap for Left Corridor)
    addLetter(0, 3, "G", gameState, GridCell);
    addLetter(1, 3, "R", gameState, GridCell);
    addLetter(2, 3, "A", gameState, GridCell);
    addLetter(3, 3, "V", gameState, GridCell);
    addLetter(4, 3, "E", gameState, GridCell);
    addLetter(5, 3, "L", gameState, GridCell);

    // ROW 4: HALITE
    addLetter(0, 4, "H", gameState, GridCell);
    addLetter(1, 4, "A", gameState, GridCell);
    addLetter(2, 4, "L", gameState, GridCell);
    addLetter(3, 4, "I", gameState, GridCell);
    addLetter(4, 4, "T", gameState, GridCell);
    addLetter(5, 4, "E", gameState, GridCell);

    // ROW 5: THERMS (Trap for Bottom Corridor)
    addLetter(0, 5, "T", gameState, GridCell);
    addLetter(1, 5, "H", gameState, GridCell);
    addLetter(2, 5, "E", gameState, GridCell);
    addLetter(3, 5, "R", gameState, GridCell);
    addLetter(4, 5, "M", gameState, GridCell);
    addLetter(5, 5, "S", gameState, GridCell);


    // ==========================================
    // --- APPEARING SECTIONS ---
    // ==========================================

    // ------------------------------------------
    // 1. RIGHT CORRIDOR (Triggers off x=5)
    // ------------------------------------------
    /** @type {GridCell[]} */
    const right1Cells = [
        new GridCell(6, 1, "Y"), new GridCell(7, 1, "D"), new GridCell(8, 1, "R"), // HYDR...
        new GridCell(6, 2, "S"), new GridCell(7, 2, "T"), new GridCell(8, 2, "R"), // ASTR...
        new GridCell(6, 3, "A"), new GridCell(7, 3, "T"), new GridCell(8, 3, "I"), // LATI...
        new GridCell(8, 4, "C"), new GridCell(8, 5, "E"), new GridCell(8, 6, "L"), new GridCell(8, 7, "L") // DIAL: CELL
    ];
    AppearingSections.push(new AppearingSection(right1Cells, gameState));

    /** @type {GridCell[]} */
    const right2Cells = [
        new GridCell(9, 1, "O"), new GridCell(10, 1, "L"), new GridCell(11, 1, "O"), // ...OLO...
        new GridCell(9, 2, "O"), new GridCell(10, 2, "N"), new GridCell(11, 2, "O"), // ...ONO...
        new GridCell(9, 3, "T"), new GridCell(10, 3, "U"), new GridCell(11, 3, "D"), // ...TUD...
        new GridCell(10, 4, "A"), new GridCell(10, 5, "T"), new GridCell(10, 6, "O"), new GridCell(10, 7, "M") // DIAL: ATOM
    ];
    AppearingSections.push(new AppearingSection(right2Cells, gameState));

    /** @type {GridCell[]} */
    const right3Cells = [
        new GridCell(12, 1, "G"), new GridCell(13, 1, "Y"), // ...GY
        new GridCell(12, 2, "M"), new GridCell(13, 2, "Y"), // ...MY
        new GridCell(12, 3, "E"), new GridCell(13, 3, "S")  // ...ES
    ];
    AppearingSections.push(new AppearingSection(right3Cells, gameState));


    // ------------------------------------------
    // 2. LEFT CORRIDOR (Triggers off x=0)
    // ------------------------------------------
    /** @type {GridCell[]} */
    const left1Cells = [
        new GridCell(-1, 1, "L"), new GridCell(-2, 1, "E"), new GridCell(-3, 1, "C"), // ELEC...
        new GridCell(-1, 2, "S"), new GridCell(-2, 2, "O"), new GridCell(-3, 2, "T"), // ISOT...
        new GridCell(-1, 3, "E"), new GridCell(-2, 3, "O"), new GridCell(-3, 3, "L"), // GEOL...
        new GridCell(-3, 4, "I"), new GridCell(-3, 5, "O"), new GridCell(-3, 6, "N")  // DIAL: ION
    ];
    AppearingSections.push(new AppearingSection(left1Cells, gameState));

    /** @type {GridCell[]} */
    const left2Cells = [
        new GridCell(-4, 1, "T"), new GridCell(-5, 1, "R"), new GridCell(-6, 1, "O"), // ...TRO...
        new GridCell(-4, 2, "O"), new GridCell(-5, 2, "P"), new GridCell(-6, 2, "E"), // ...OPE...
        new GridCell(-4, 3, "O"), new GridCell(-5, 3, "G"), new GridCell(-6, 3, "Y"), // ...OGY
        new GridCell(-5, 4, "G"), new GridCell(-5, 5, "A"), new GridCell(-5, 6, "S")  // DIAL: GAS
    ];
    AppearingSections.push(new AppearingSection(left2Cells, gameState));

    /** @type {GridCell[]} */
    const left3Cells = [
        new GridCell(-7, 1, "N"), new GridCell(-8, 1, "S"), // ...NS
        new GridCell(-7, 2, "S")  // ...S
    ];
    AppearingSections.push(new AppearingSection(left3Cells, gameState));


    // ------------------------------------------
    // 3. TOP CORRIDOR (Triggers off y=0)
    // ------------------------------------------
    /** @type {GridCell[]} */
    const top1Cells = [
        new GridCell(1, -1, "T"), new GridCell(1, -2, "M"), new GridCell(1, -3, "O"), // ATMO...
        new GridCell(2, -1, "E"), new GridCell(2, -2, "C"), new GridCell(2, -3, "T"), // TECT...
        new GridCell(3, -1, "V"), new GridCell(3, -2, "O"), new GridCell(3, -3, "L"), // EVOL...
        new GridCell(4, -1, "F"), new GridCell(4, -2, "O"), new GridCell(4, -3, "G")  // DIAL: FOG
    ];
    AppearingSections.push(new AppearingSection(top1Cells, gameState));

    /** @type {GridCell[]} */
    const top2Cells = [
        new GridCell(1, -4, "S"), new GridCell(1, -5, "P"), new GridCell(1, -6, "H"), // ...SPH...
        new GridCell(2, -4, "O"), new GridCell(2, -5, "N"), new GridCell(2, -6, "I"), // ...ONI...
        new GridCell(3, -4, "U"), new GridCell(3, -5, "T"), new GridCell(3, -6, "I"), // ...UTI...
        new GridCell(4, -4, "I"), new GridCell(4, -5, "C"), new GridCell(4, -6, "E")  // DIAL: ICE
    ];
    AppearingSections.push(new AppearingSection(top2Cells, gameState));

    /** @type {GridCell[]} */
    const top3Cells = [
        new GridCell(1, -7, "E"), new GridCell(1, -8, "R"), new GridCell(1, -9, "E"), // ...ERE
        new GridCell(2, -7, "C"), new GridCell(2, -8, "S"), // ...CS
        new GridCell(3, -7, "O"), new GridCell(3, -8, "N")  // ...ON
    ];
    AppearingSections.push(new AppearingSection(top3Cells, gameState));


    // ------------------------------------------
    // 4. BOTTOM CORRIDOR (Triggers off y=5)
    // ------------------------------------------
    /** @type {GridCell[]} */
    const bot1Cells = [
        new GridCell(1, 6, "A"), new GridCell(1, 7, "B"), new GridCell(1, 8, "I"), // HABI...
        new GridCell(2, 6, "C"), new GridCell(2, 7, "O"), new GridCell(2, 8, "S"), // ECOS...
        new GridCell(3, 6, "A"), new GridCell(3, 7, "D"), new GridCell(3, 8, "I"), // RADI...
        new GridCell(4, 6, "M"), new GridCell(4, 7, "U"), new GridCell(4, 8, "D")  // DIAL: MUD
    ];
    AppearingSections.push(new AppearingSection(bot1Cells, gameState));

    /** @type {GridCell[]} */
    const bot2Cells = [
        new GridCell(1, 9, "T"), new GridCell(1, 10, "A"), new GridCell(1, 11, "T"), // ...TAT...
        new GridCell(2, 9, "Y"), new GridCell(2, 10, "S"), new GridCell(2, 11, "T"), // ...YST...
        new GridCell(3, 9, "A"), new GridCell(3, 10, "T"), new GridCell(3, 11, "I"), // ...ATI...
        new GridCell(4, 9, "A"), new GridCell(4, 10, "S"), new GridCell(4, 11, "H")  // DIAL: ASH
    ];
    AppearingSections.push(new AppearingSection(bot2Cells, gameState));

    /** @type {GridCell[]} */
    const bot3Cells = [
        new GridCell(1, 12, "S"), // ...S
        new GridCell(2, 12, "E"), new GridCell(2, 13, "M"), new GridCell(2, 14, "S"), // ...EMS
        new GridCell(3, 12, "O"), new GridCell(3, 13, "N") // ...ON
    ];
    AppearingSections.push(new AppearingSection(bot3Cells, gameState));


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