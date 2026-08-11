import { keyToVector2, addLetter } from '../utils.js';
import { GridCell } from '../GridCell.js';
import { gameState } from '../main.js';
import { AppearingSections } from '../main.js';
import { AppearingSection } from '../AppearingSection.js';


//@ts-check
export const gridData = {
    mainWords: [
        'DINOSAUR',
        'FOSSIL',
        'ARCHAEOLOGY',
        'SKULL',
        'TRILOBYTE',
        'MAMMOTHS',
    ],
    words: [
        // The Mega-Spanner (Spans from Top-Left to Bottom-Right)

        

        'ICE',
        'FLAME',
        'CUT',
        'EARS',
        'EAR',
        'DINO',
        'RARE',

        'DIG',
        'SAD',
        'GET',
        'EXTINCT',

        'ELEPHANT',
        'DIRT',
        'SPADE',
        'PAD',
        'EGG',
        'ARCH',

        'SLOW',
        'OLD',
        'LIFE',
        'LAME',
        'SIT',
        'CLAW',
        'CLAWS',

        'HAGG',
        'BRAIN',
        'EGG',
        'BEG',
        'ATE',
        

        'TAIL',
        'PAN',
        'SPINE',
        'SPREADING',
        'TREX',
        'TON',
        'LIZARD',

        'RAPTOR',
        'MAMMOTH',

        'IMAGE',
        'AIR',

        'NOW',
        'HOMINID',
        'HORROR',
        'DODO',
        'TIGER',

        'HAD',
        'HUG',
        'PINE',
        'HORN',

    ]
};

export async function generateLevelData() {
    // ==========================================
    // --- MAIN GRID (6x6 excavation Hub) ---
    // ==========================================
    const csvFileName = './static/excavation.csv';
    try {
        // Fetch the CSV file from the local static directory
        const response = await fetch(csvFileName);
        if (!response.ok) throw new Error(`Could not fetch ${csvFileName}`);
        
        const csvText = await response.text();

        // Split by newlines to get rows, then by commas to get cells.
        // We trim whitespace and remove stray quotes just in case the spreadsheet exported them.
        const rows = csvText.split('\n').map(line => 
            line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
        );

        // The top-left cell holds "row.col" for our 0,0 origin
        const metadata = rows[0][0]; 
        const [originRow, originCol] = metadata.split('*').map(Number);

        const sectionsData = [];

        for (let r = 1; r < rows.length; r++) {
            for (let c = 0; c < rows[r].length; c++) {
                const rawCell = rows[r][c].toUpperCase();
                
                // Matches 1 or more digits, followed by exactly 1 letter (e.g. "0H", "5H", "12X")
                const match = rawCell.match(/^(\d+)([A-Z])$/);
                
                if (match) {
                    const sectionNum = parseInt(match[1], 10);
                    const letter = match[2];
                    
                    // Calculate exact game coordinates
                    const x = c - originCol;
                    const y = r - originRow;
                    
                    if (sectionNum === 0 && letter) {
                        addLetter(x, y, letter, gameState, GridCell);
                    } else {
                        const arrayIndex = sectionNum - 1; // 1 becomes index 0, 5 becomes index 4
                        
                        // If this section array doesn't exist yet, create it
                        if (!sectionsData[arrayIndex]) {
                            sectionsData[arrayIndex] = [];
                        }
                        
                        // Push the un-rendered cell into the temporary array
                        sectionsData[arrayIndex].push(new GridCell(x, y, letter));
                    }
                }
            }
        }
        
        // Now that the whole CSV is read, convert our grouped arrays into real AppearingSections
        sectionsData.forEach((cellsArray, index) => {
            if (cellsArray && cellsArray.length > 0) {

                AppearingSections.push(new AppearingSection(cellsArray, gameState));
            }
        });

    } catch (error) {
        console.error("Error loading the custom CSV level:", error);
    }

    
}