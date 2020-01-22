const boardSize = 19;
const gridSize = 40;

const WHITE = 1;
const BLACK = 2;
const pWHITE = 3;
const pBLACK = 4;

const tileState = {
    'empty' : 0,
    'white' : WHITE,
    'black' : BLACK,
    'pWhite' : pWHITE,
    'pBlack' : pBLACK,
    'error' : 5,
};

const edgeType = {
    'none' : 0,
    'tl_corner' : 1,
    'tr_corner' : 2,
    'br_corner' : 3,
    'bl_corner' : 4,
    'th_edge' : 5,
    'rv_edge' : 6,
    'bh_edge' : 7,
    'lv_edge' : 8,
    'star' : 9,
}

const gameState = {
    'ready' : 0,
    'playing' : 1,
    'gameOver' : 2,
    'counting' : 3,
    'complete': 4,
}

const countingMode = {
    'none' : 0,
    'swap' : 1,
    'addW' : 2,
    'addB' : 3,
    'del' : 4,
    'patchDel' : 5,
    'fillW' : 6,
    'fillB' : 7,
}

export {boardSize, gridSize, WHITE, BLACK, tileState, edgeType, gameState, countingMode};