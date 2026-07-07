// @ts-check

/**
 * Define the exact structure of a Game Mode
 * @typedef {Object} GameModeConfig
 * @property {string} id
 * @property {string} name
 * @property {boolean} allowReuse
 * @property {number | null} timeLimit
 * @property {number | null} maxMoves
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
        maxMoves: null     // null means infinite
    },
    OVERLAP: {
        id: 'OVERLAP',
        name: 'Overlap (Reuse Allowed)',
        allowReuse: true,  // Players can drag through already-found words!
        timeLimit: null,
        maxMoves: null
    },
    BLITZ: {
        id: 'BLITZ',
        name: '60 Second Blitz',
        allowReuse: false,
        timeLimit: 60,     // 60 seconds to find everything
        maxMoves: null
    },
    PRECISION: {
        id: 'PRECISION',
        name: 'Precision (10 Moves)',
        allowReuse: false,
        timeLimit: null,
        maxMoves: 10       // Game over if they drag 10 times without winning
    }
};