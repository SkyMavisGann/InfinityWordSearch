// @ts-check
import { keyToVector2, addLetter } from './utils.js';
import { getCellsInLine } from './utils.js';
import { GridCell } from './GridCell.js';
import { AppearingSection } from './AppearingSection.js';
import { WordLine } from './WordLine.js';
import { GameModes } from './GameModes.js';
import { gridData } from './static/Level2.js';
import { generateLevelData } from './static/Level2.js';

/** @type {import('./GameModes.js').GameModeConfig} */
let currentMode = GameModes.CLASSIC;

/** @type {HTMLElement | null} */
const gridWrapper = document.getElementById('grid-scroll-area');
/** @type {HTMLElement | null} */
const gridContainer = document.getElementById('wordsearch-grid');
/** @type {HTMLElement | null} */
export const wordList = document.getElementById('word-list');

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

/** @type {Map<number, {x: number, y: number}>} */
const activePointers = new Map();
/** @type {number} */ 
let prevPinchDistance = -1;

/** @type {string[]} */
let currentSelectionPath = [];




/** @type {string[]} */
let wordsRemaining = [...gridData.words];

/** @type {Map<string, GridCell>} */
export const gameState = new Map();

/** @type {AppearingSection[]} */
export const AppearingSections = [];

/** @type {WordLine[]} */
const foundLines = [];

let isGameOver = false;
let timeRemaining = 0;
/** @type {number | null} */
let timerInterval = null;

const timerContainer = document.getElementById('timer-container');
const timerDisplay = document.getElementById('timer-display');
const gameOverModal = document.getElementById('game-over-modal');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverScore = document.getElementById('game-over-score');
const playAgainBtn = document.getElementById('play-again-btn');

if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
        resetGame();
    });
}
/**
 * Puts time into a readable format
 * @param {number} seconds 
 * @returns {string}
 */
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Puts time into a readable format
 * @param {boolean} won 
 */
function triggerGameOver(won) {
    isGameOver = true;
    if (timerInterval) clearInterval(timerInterval);
    
    if (gameOverModal && gameOverTitle && gameOverScore) {
        gameOverModal.style.display = 'flex';
        gameOverTitle.textContent = won ? "System Breached!" : "Time's Up!";
        gameOverTitle.style.color = won ? "#10b981" : "#ef4444"; // Green for win, Red for lose
        gameOverScore.textContent = `Final Score: ${totalScore}`;
    }
}

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
    
    // Gather every cell
    gameState.forEach(cell => {
        if (!cell.isHidden) {
            litCells.push(cell);
        }
    });

    // Configure the light falloff for the ghost cells
    const maxLightDistance = 5;  // How many squares away before it hits maximum darkness
    const darkestOpacity = 0.05; // The base opacity for far-away ghosts

    // Calculate distance ONLY for the lit cells
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

        // Map that distance to the ghost's opacity
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
    if (isGameOver) return;
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
    if (isGameOver) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    //add fingers to activepointers
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
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
    if (isGameOver) return;
    if (activePointers.has(event.pointerId)) {
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (activePointers.size === 2) {
        // Grab the two fingers
        const pointers = Array.from(activePointers.values());
        const p1 = pointers[0];
        const p2 = pointers[1];

        // Math.hypot calculates the distance between two points
        const currentDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y);

        if (prevPinchDistance > 0) {
            // How much did the distance change since the last frame
            const scaleRatio = currentDistance / prevPinchDistance;
            const nextScale = Math.max(minScale, Math.min(maxScale, scale * scaleRatio));

            // Find the exact midpoint between the two fingers
            const centerX = (p1.x + p2.x) / 2;
            const centerY = (p1.y + p2.y) / 2;

            // The exact same camera math from your mouse wheel event
            const rect = gridWrapper.getBoundingClientRect();
            const mouseX = centerX - rect.left;
            const mouseY = centerY - rect.top;
            
            

            const actualScaleRatio = nextScale / scale;
            panX = mouseX - (mouseX - panX) * actualScaleRatio;
            panY = mouseY - (mouseY - panY) * actualScaleRatio;

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

window.addEventListener('pointerup', (event) => {

    activePointers.delete(event.pointerId);
    if (activePointers.size < 2) {
        prevPinchDistance = -1;
    }

    try {
        if (gridWrapper.hasPointerCapture(event.pointerId)) {
            gridWrapper.releasePointerCapture(event.pointerId);
        }
    } catch (e) {}

    if (isSelecting) {
        let selectedWord = "";

        for (const key of currentSelectionPath) {
            const cellData = gameState.get(key);
            if (cellData) {
                // THE RULE CHECK: If the mode DOES NOT allow reuse, and the cell is found, break the path!
                if (!currentMode.allowReuse && cellData.domElement && cellData.domElement.classList.contains('found')) {
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

                if (wordsRemaining.length === 0) {
                    triggerGameOver(true);
                }

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

window.addEventListener('pointercancel', (event) => {
    activePointers.delete(event.pointerId);
        if (activePointers.size < 2) {
            prevPinchDistance = -1;
        }
    

    isDragging = false;
    document.body.classList.remove('is-dragging');
});


// --- Game Reset & Mode Switching ---
const modeSelector = /** @type {HTMLSelectElement | null} */ (document.getElementById('mode-selector'));

/**
 * Wipes the board and restarts the level based on the current mode
 * @returns {void}
 */
function resetGame() {
    isGameOver = false;
    if (gameOverModal) gameOverModal.style.display = 'none';
    if (timerInterval) clearInterval(timerInterval);
    // 1. Wipe all existing data
    gameState.clear();
    AppearingSections.length = 0;
    foundLines.length = 0;
    totalScore = 0;
    if (scoreDisplay) scoreDisplay.textContent = "0";
    
    // 2. Reset the target words
    wordsRemaining = [...gridData.words];
    
    if (currentMode.timeLimit !== null && timerContainer && timerDisplay) {
        timerContainer.style.display = 'block';
        timeRemaining = currentMode.timeLimit;
        timerDisplay.textContent = formatTime(timeRemaining);
        
        timerInterval = window.setInterval(() => {
            if (isGameOver) return;
            timeRemaining--;
            timerDisplay.textContent = formatTime(timeRemaining);
            
            if (timeRemaining <= 0) {
                triggerGameOver(false); // Out of time!
            }
        }, 1000);
    } else if (timerContainer) {
        timerContainer.style.display = 'none';
    }
    
    // 3. Rebuild the level
    generateLevelData();
    renderAllCells();
    updateCameraTransform();
}

if (modeSelector) {
    modeSelector.addEventListener('change', (e) => {
        const target = /** @type {HTMLSelectElement} */ (e.target);
        const selectedValue = target.value;
        currentMode = GameModes[selectedValue];
        console.log(`Switched to: ${currentMode.name}`);
        resetGame();
    });
}

function initializeGame() {
    generateLevelData();
    renderAllCells();
}

initializeGame();