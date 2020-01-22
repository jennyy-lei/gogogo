import {boardSize, gridSize, WHITE, BLACK, tileState, gameState, countingMode} from './globals';

export function getPatch(i, j, board, patch = []) {
    let color = board[i][j];
    board[i][j] = -1;
    patch.push({x:i, y:j});

    // console.log(patch);

    if (i > 0 && board[i - 1][j] === color && board[i-1][j] !== -1) {
        // console.log('up');
        getPatch(i-1, j, board, patch);
    }
    if (i < boardSize - 1 && board[i + 1][j] === color && board[i+1][j] !== -1) {
        // console.log('down');
        getPatch(i+1, j, board, patch);
    }
    if (j > 0 && board[i][j - 1] === color && board[i][j-1] !== -1) {
        // console.log('left');
        getPatch(i, j-1, board, patch);
    }
    if (j < boardSize - 1 && board[i][j + 1] === color && board[i][j+1] !== -1) {
        // console.log('right');
        getPatch(i, j+1, board, patch);
    }
}

export function surround(board, patch) {
    let flag = true;
    let i, j;

    patch.map(function (coor) {
        i = coor.x;
        j = coor.y;

        if (i > 0 && board[i - 1][j] === tileState.empty) {
            // console.log('up');
            flag = false;
        }
        if (i < boardSize - 1 && board[i + 1][j] === tileState.empty) {
            // console.log('down');
            flag = false;
        }
        if (j > 0 && board[i][j - 1] === tileState.empty) {
            // console.log('left');
            flag = false;
        }
        if (j < boardSize - 1 && board[i][j + 1] === tileState.empty) {
            // console.log('right');
            flag = false;
        }
    });

    return flag;
}

export function closedTer(board, patch) {
    console.log(checkBoarder(board, patch, tileState.white, tileState.pWhite));
    if (checkBoarder(board, patch, tileState.white, tileState.pWhite)) {
        console.log('white');
        return tileState.pWhite;
    } else if (checkBoarder(board, patch, tileState.black, tileState.pBlack)) {
        console.log('black');
        return tileState.pBlack;
    } else {
        return -1;
    }
}

function checkBoarder(board, patch, color1, color2) {
    let i, j;
    let edge1 = color1;
    let edge2 = color2;
    let flag = true;

    patch.map(function (coor) {
        i = coor.x;
        j = coor.y;
        
        if (i > 0 && !(board[i - 1][j] === edge1 || board[i - 1][j] === edge2 || board[i - 1][j] === tileState.empty)) {
            flag = false;
            return;
        }
        if (i < boardSize - 1 && !(board[i + 1][j] === edge1 || board[i + 1][j] === edge2 || board[i + 1][j] === tileState.empty)) {
            flag = false;
            return;
        }
        if (j > 0 && !(board[i][j - 1] === edge1 || board[i][j - 1] === edge2 || board[i][j - 1] === tileState.empty)) {
            flag = false;
            return;
        }
        if (j < boardSize - 1 && !(board[i][j + 1] === edge1 || board[i][j + 1] === edge2 || board[i][j + 1] === tileState.empty)) {
            flag = false;
            return;
        }
    });

    return flag;
}

export function tileColor(color) {
    switch (color) {
         case tileState.empty:
             return 'transparent';
         case tileState.white: 
             return 'white';
         case tileState.black:
             return 'black';
        case tileState.pWhite:
            return 'rgba(255, 255, 255, 0.5)';
        case tileState.pBlack:
            return 'rgba(0, 0, 0, 0.5)';
        case tileState.error:
            return 'rgba(255, 99, 71, 0.5)';
    }
}