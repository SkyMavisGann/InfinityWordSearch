// @ts-check

/**
 * Define the exact structure of a Game Mode
 * @typedef {Object} GameModeConfig
 * @property {string} id
 * @property {string} name
 * @property {boolean} allowReuse
 * @property {number | null} timeLimit
 * @property {number | null} maxLetters
 */

/** * Tell TS this object is a dictionary of GameModeConfigs
 * @type {Object.<string, GameModeConfig>} 
 */
export const GameModes = {
    CLASSIC: {
        id: 'CLASSIC',
        name: 'Classic Mode',
        allowReuse: false,
        timeLimit: null,   // null means infinite
        maxLetters: null     // null means infinite
    },
    OVERLAP: {
        id: 'OVERLAP',
        name: 'Overlap (Reuse Allowed)',
        allowReuse: true,  // Players can drag through already-found words!
        timeLimit: null,
        maxLetters: null
    },
    BLITZ: {
        id: 'BLITZ',
        name: '60 Second Blitz',
        allowReuse: false,
        timeLimit: 60,     // 60 seconds to find everything
        maxLetters: null
    },
    PRECISION: {
        id: 'PRECISION',
        name: 'Precision (50 Letters)',
        allowReuse: false,
        timeLimit: null,
        maxLetters: 50 
    }
};