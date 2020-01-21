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