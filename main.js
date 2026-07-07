// @ts-check
import { keyToVector2, addLetter } from './utils.js';
import { getCellsInLine } from './utils.js';
import { GridCell } from './GridCell.js';
import { AppearingSection } from './AppearingSection.js';
import { WordLine } from './WordLine.js';

/** @type {HTMLElement | null} */
const gridWrapper = document.getElementById('grid-scroll-area');
/** @type {HTMLElement | null} */
const gridContainer = document.getElementById('wordsearch-grid');
/** @type {HTMLElement | null} */
const wordList = document.getElementById('word-list');

/** @type {HTMLElement | null} */
const scoreDisplay = document.getElementById('score-display');
let totalScore = 0;

if (!gridWrapper || !gridContainer || !wordList) {
    throw new Error('Required game elements were not found');
}
gridContainer.style.transformOrigin = '0 0';

// --- State Variables ---
let scale = 1;
const minScale = 0.4, maxScale = 2, zoomStep = 0.1;
let panX = 0, panY = 0;

let isDragging = false, isSelecting = false;
/** @type {number} */ let selectStartX = 0;
/** @type {number} */ let selectStartY = 0;
/** @type {number} */ let dragStartX = 0;
/** @type {number} */ let dragStartY = 0;
/** @type {number} */ let startPanX = 0;
/** @type {number} */ let startPanY = 0;

/** @type {Map<number, PointerEvent>} */
const activePointers = new Map();
/** @type {number} */ 
let prevPinchDistance = -1;

/** @type {string[]} */
let currentSelectionPath = [];

const gridData = {
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
/** @type {string[]} */
let wordsRemaining = [...gridData.words];

/** @type {Map<string, GridCell>} */
const gameState = new Map();

/** @type {AppearingSection[]} */
const AppearingSections = [];

/** @type {WordLine[]} */
const foundLines = [];

// --- Functions ---
function updateCameraTransform() {
    if (gridContainer) {
        gridContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    }
}

function clearPath() {
    currentSelectionPath.forEach(key => {
        const cellData = gameState.get(key);
        if (cellData && cellData.domElement) {
            cellData.domElement.classList.remove('in-path');
        }
    });
}

/**
 * Calculates points based on word length and how many unique sections it spans
 * @param {string[]} pathCoordinates - Array of string keys (e.g., ["0,0", "1,0"])
 * @returns {number}
 */
function calculateWordPoints(pathCoordinates) {
    // A Set stores unique values. If we add "Section 1" five times, it only counts it once!
    /**@type {Set<string>} */
    const touchedSections = new Set();

    pathCoordinates.forEach(key => {
        const pos = keyToVector2(key);
        let inAnyAppearingSection = false;

        // Check if this specific letter falls inside any of our Appearing Sections
        AppearingSections.forEach((section, index) => {
            if (section.isWithinBounds(pos.x, pos.y, false)) {
                touchedSections.add(`section_${index}`);
                inAnyAppearingSection = true;
            }
        });

        // If it wasn't in ANY appearing section bounds, it must be in the Base Grid
        if (!inAnyAppearingSection) {
            touchedSections.add('base_grid');
        }
    });

    // The span is simply how many unique zones are in our Set
    const span = touchedSections.size;
    
    // Exact formula: ((wordcount - 2) * span)
    const points = (pathCoordinates.length - 2) * span;

    console.log(`Word Length: ${pathCoordinates.length} | Span: ${span} sections | Points: ${points}`);
    
    // Return the points (using Math.max just to ensure 1-letter glitches don't award negative points)
    return Math.max(0, points);
}

// --- Fog of War Logic ---
function updateOpacities() {
    /**@type {GridCell[]} */
    const litCells = [];
    
    // 1. Gather every cell
    gameState.forEach(cell => {
        if (!cell.isHidden) {
            litCells.push(cell);
        }
    });

    // 2. Configure the light falloff for the ghost cells
    const maxLightDistance = 5;  // How many squares away before it hits maximum darkness
    const darkestOpacity = 0.05; // The base opacity for far-away ghosts

    // 3. Calculate distance ONLY for the hidden cells
    gameState.forEach(cell => {
        // RULE 1: If it's already found, OR if it's an active playable square, it's 100% visible.
        if (cell.isFound || !cell.isHidden) {
            cell.opacity = 1.0;
            return; // Skip the rest of the math for this square!
        }

        // RULE 2: If the game just started and nothing is found yet, keep all ghosts at minimum brightness
        if (litCells.length === 0) {
            cell.opacity = darkestOpacity;
            return;
        }

        // RULE 3: For hidden cells, find the closest found letter
        let shortestDistance = Infinity;
        litCells.forEach(found => {
            const distance = Math.hypot(cell.x - found.x, cell.y - found.y);
            shortestDistance = Math.min(shortestDistance, distance);
        });

        // 4. Map that distance to the ghost's opacity
        if (shortestDistance >= maxLightDistance) {
            cell.opacity = darkestOpacity;
        } else {
            // Creates a linear fade from 1.0 down to 0.15 based on distance
            const fadeRange = 1.0 - darkestOpacity;
            const dropPerStep = fadeRange / maxLightDistance;
            
            // Apply the fade, capping it at 1.0 max just to be safe
            cell.opacity = Math.min(1.0, 1.0 - (shortestDistance * dropPerStep));
        }
    });
}
function renderAllCells() {
    if (!gridContainer) return;

    updateOpacities();

    gridContainer.innerHTML = '';

    foundLines.forEach(line => {
        gridContainer.appendChild(line.render());
    });

    gameState.forEach((cellData) => {
        const element = cellData.render();
        gridContainer.appendChild(element);
    });
}

function generateLevelData() {
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

// --- Event Listeners ---
// --- Help Modal Logic ---
const helpBtn = document.getElementById('help-btn');
const closeHelpBtn = document.getElementById('close-help');
const helpModal = /** @type {HTMLDialogElement} */ (document.getElementById('help-modal'));

if (helpBtn && closeHelpBtn && helpModal) {
    // .showModal() automatically dims the background and traps focus!
    helpBtn.addEventListener('click', () => helpModal.showModal());
    
    // .close() hides it again
    closeHelpBtn.addEventListener('click', () => helpModal.close());
    
    helpModal.addEventListener('click', (e) => {
        const dialogDimensions = helpModal.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            helpModal.close();
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('help')) {
        helpModal.showModal();
    }
}
gridWrapper.addEventListener('wheel', (event) => {
    event.preventDefault();
    const nextScale = event.deltaY < 0 ? Math.min(maxScale, scale + zoomStep) : Math.max(minScale, scale - zoomStep);
    if (nextScale === scale) return;

    const rect = gridWrapper.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const offsetX = mouseX - centerX;
    const offsetY = mouseY - centerY;

    const scaleRatio = nextScale / scale;
    panX = offsetX - (offsetX - panX) * scaleRatio;
    panY = offsetY - (offsetY - panY) * scaleRatio;

    scale = nextScale;
    updateCameraTransform();
}, { passive: false });

gridWrapper.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    //add fingers to activepointers
    activePointers.set(event.pointerId, event);
    gridWrapper.setPointerCapture(event.pointerId);
    if (activePointers.size === 2) {
        isDragging = false;
        if (isSelecting) {
            clearPath();
            isSelecting = false;
            gridWrapper.classList.remove('is-selecting');
        }
        document.body.classList.remove('is-dragging');
        return; // Exit out of the normal click logic
    }

    /** @type {HTMLElement | null} */
    const targetCell = /** @type {HTMLElement} */ (event.target).closest('.grid-cell');

    if (targetCell && targetCell.dataset.x && targetCell.dataset.y) {
        isSelecting = true;
        selectStartX = parseInt(targetCell.dataset.x, 10);
        selectStartY = parseInt(targetCell.dataset.y, 10);
        gridWrapper.classList.add('is-selecting');
    } else {
        isDragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        startPanX = panX;
        startPanY = panY;
        gridWrapper.setPointerCapture(event.pointerId);
        document.body.classList.add('is-dragging');
    }
});

gridWrapper.addEventListener('pointermove', (event) => {
    if (activePointers.has(event.pointerId)) {
        activePointers.set(event.pointerId, event);
    }

    if (activePointers.size === 2) {
        // Grab the two fingers
        const pointers = Array.from(activePointers.values());
        const p1 = pointers[0];
        const p2 = pointers[1];

        // Math.hypot calculates the distance between two points
        const currentDistance = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);

        if (prevPinchDistance > 0) {
            // How much did the distance change since the last frame
            const scaleRatio = currentDistance / prevPinchDistance;
            const nextScale = Math.max(minScale, Math.min(maxScale, scale * scaleRatio));

            // Find the exact midpoint between the two fingers
            const centerX = (p1.clientX + p2.clientX) / 2;
            const centerY = (p1.clientY + p2.clientY) / 2;

            // The exact same camera math from your mouse wheel event
            const rect = gridWrapper.getBoundingClientRect();
            const mouseX = centerX - rect.left;
            const mouseY = centerY - rect.top;
            
            const viewCenterX = rect.width / 2;
            const viewCenterY = rect.height / 2;

            const offsetX = mouseX - viewCenterX;
            const offsetY = mouseY - viewCenterY;

            const actualScaleRatio = nextScale / scale;
            panX = offsetX - (offsetX - panX) * actualScaleRatio;
            panY = offsetY - (offsetY - panY) * actualScaleRatio;

            scale = nextScale;
            updateCameraTransform();
        }
        
        // Save this distance for the next frame
        prevPinchDistance = currentDistance;
        return; // Don't run the single-finger drag/select logic
    }


    if (isDragging) {
        const deltaX = event.clientX - dragStartX;
        const deltaY = event.clientY - dragStartY;
        panX = startPanX + deltaX;
        panY = startPanY + deltaY;
        updateCameraTransform();
    } else if (isSelecting) {
        const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY);
        
        if (elementUnderCursor && elementUnderCursor.classList.contains('grid-cell')) {
            /** @type {HTMLElement} */
            const htmlElement = /** @type {HTMLElement} */ (elementUnderCursor);
            if (!htmlElement.dataset.x || !htmlElement.dataset.y) return;

            const currentX = parseInt(htmlElement.dataset.x, 10);
            const currentY = parseInt(htmlElement.dataset.y, 10);
            const path = getCellsInLine(selectStartX, selectStartY, currentX, currentY);

            if (path.length > 0 && JSON.stringify(path) !== JSON.stringify(currentSelectionPath)) {
                clearPath();
                currentSelectionPath = path;
                currentSelectionPath.forEach(key => {
                    const cellData = gameState.get(key);
                    if (cellData && cellData.domElement) {
                        cellData.domElement.classList.add('in-path');
                    }
                });
            }
        }
    }
});

gridWrapper.addEventListener('pointerup', (event) => {
    if (isSelecting) {
        let selectedWord = "";

        for (const key of currentSelectionPath) {
            const cellData = gameState.get(key);
            if (cellData) {
                if (cellData.domElement && cellData.domElement.classList.contains('found')) {
                    clearPath();
                    selectedWord = ""; 
                    break;
                }
                selectedWord += cellData.letter;
            }
        }

        if (selectedWord !== "") {
            const reversedWord = selectedWord.split('').reverse().join('');
            let matchedWord = null;
            
            if (wordsRemaining.includes(selectedWord)) matchedWord = selectedWord;
            else if (wordsRemaining.includes(reversedWord)) matchedWord = reversedWord;

            if (matchedWord != null) {
                const pointsEarned = calculateWordPoints(currentSelectionPath);
                totalScore += pointsEarned;
                
                if (scoreDisplay) {
                    scoreDisplay.textContent = totalScore.toString();
                    
                    
                    scoreDisplay.style.transform = "scale(1.2)";
                    setTimeout(() => scoreDisplay.style.transform = "scale(1)", 150);
                }

                const startCoord = currentSelectionPath[0];
                const endCoord = currentSelectionPath[currentSelectionPath.length - 1];
                const newLine = new WordLine(startCoord, endCoord);
                foundLines.push(newLine);


                if (gridContainer) {
                    gridContainer.prepend(newLine.render());
                }
                let needsRender = false;

                currentSelectionPath.forEach(key => {
                    const cellData = gameState.get(key);
                    if (!cellData) return;

                    cellData.isFound = true;
                    if (cellData.domElement) {
                        cellData.domElement.classList.remove('in-path');
                        cellData.domElement.classList.add('found');
                    }

                    const pos = keyToVector2(key);
                    AppearingSections.forEach(section => {
                        if (section.isWithinBounds(pos.x, pos.y, true)) {
                            if (section.addAllLetters(gameState)) needsRender = true;
                        }
                    });
                });

                if (needsRender) renderAllCells();

                const listItems = document.querySelectorAll('#word-list li');
                listItems.forEach(li => {
                    if (li.textContent === matchedWord) li.classList.add('crossed-off');
                });

                wordsRemaining = wordsRemaining.filter(w => w !== matchedWord);
                if (wordsRemaining.length === 0) console.log("You found all the words!");
            }
        }
        
        clearPath();
        isSelecting = false;
        selectStartX = 0;
        selectStartY = 0;
        gridWrapper.classList.remove('is-selecting');
    } else if (isDragging) {
        isDragging = false;
        gridWrapper.releasePointerCapture(event.pointerId);
        document.body.classList.remove('is-dragging');
    }
});

gridWrapper.addEventListener('pointercancel', () => {
    isDragging = false;
    document.body.classList.remove('is-dragging');
});



function initializeGame() {
    generateLevelData();
    renderAllCells();
}

initializeGame();